import { NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { sendEmail } from "@/app/lib/resend";
import { returnResolvedEmail } from "@/app/lib/emails/templates";
import { canTransition, returnStatusLabel } from "@/app/lib/return-status";

const RESOLVABLE = ["aprobada", "rechazada", "reembolsada"] as const;
type Resolution = (typeof RESOLVABLE)[number];

// El admin resuelve una devolución. Al marcarla "reembolsada", el pedido pasa a
// paymentStatus "reembolsado" (el dinero se devuelve manualmente en la pasarela
// usando el chargeId). En cada transición se avisa al cliente por correo.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as Resolution;
    if (!RESOLVABLE.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    const adminNote = body.adminNote ? String(body.adminNote).trim() : null;

    const ret = await prisma.return.findUnique({
      where: { id },
      include: {
        order: { select: { orderNumber: true, total: true } },
        customer: { select: { email: true } },
      },
    });
    if (!ret) {
      return NextResponse.json({ error: "Devolución no encontrada" }, { status: 404 });
    }

    // Solo transiciones válidas: una devolución rechazada o ya reembolsada no
    // se puede volver a resolver (si no, se reenviaría el correo al cliente y
    // se pisaría el importe del reembolso).
    if (!canTransition(ret.status, status)) {
      return NextResponse.json(
        {
          error: `No se puede pasar de "${returnStatusLabel(ret.status)}" a "${returnStatusLabel(status)}"`,
        },
        { status: 409 }
      );
    }

    let refundAmount: number | null = null;
    if (status === "reembolsada") {
      if (body.refundAmount != null && body.refundAmount !== "") {
        const parsed = Number(body.refundAmount);
        // Sin esto, un valor vacío o basura entraba a la BD como NaN.
        if (!Number.isFinite(parsed) || parsed <= 0 || parsed > ret.order.total) {
          return NextResponse.json(
            { error: `El importe debe estar entre 0 y S/ ${ret.order.total.toFixed(2)}` },
            { status: 400 }
          );
        }
        refundAmount = Math.round(parsed * 100) / 100;
      } else {
        refundAmount = ret.order.total;
      }
    }

    // Ambas escrituras juntas: si fallara la segunda, la devolución quedaría
    // "reembolsada" con el pedido todavía en "pagado".
    const [updated] = await prisma.$transaction([
      prisma.return.update({
        where: { id },
        data: { status, adminNote, refundAmount, resolvedAt: new Date() },
      }),
      ...(status === "reembolsada"
        ? [
            prisma.order.update({
              where: { id: ret.orderId },
              data: { paymentStatus: "reembolsado" },
            }),
          ]
        : []),
    ]);

    // Avisar al cliente.
    if (ret.customer?.email) {
      const recipient = ret.customer.email;
      const orderNumber = ret.order.orderNumber;
      after(async () => {
        try {
          await sendEmail({
            to: recipient,
            ...returnResolvedEmail({
              orderNumber,
              status,
              adminNote,
              refundAmount,
            }),
          });
        } catch (err) {
          console.error("[returns] correo de resolución falló:", err);
        }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/returns PATCH]", error);
    return NextResponse.json({ error: "Error al actualizar la devolución" }, { status: 500 });
  }
}
