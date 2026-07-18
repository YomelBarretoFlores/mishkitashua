import { NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { sendEmail } from "@/app/lib/resend";
import { returnResolvedEmail } from "@/app/lib/emails/templates";

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
        // customer se resuelve por customerId → email
      },
    });
    if (!ret) {
      return NextResponse.json({ error: "Devolución no encontrada" }, { status: 404 });
    }

    const refundAmount =
      status === "reembolsada"
        ? body.refundAmount != null && body.refundAmount !== ""
          ? Number(body.refundAmount)
          : ret.order.total
        : null;

    const updated = await prisma.return.update({
      where: { id },
      data: {
        status,
        adminNote,
        refundAmount,
        resolvedAt: new Date(),
      },
    });

    // Marcar el pedido como reembolsado al completar la devolución.
    if (status === "reembolsada") {
      await prisma.order.update({
        where: { id: ret.orderId },
        data: { paymentStatus: "reembolsado" },
      });
    }

    // Avisar al cliente.
    const customer = await prisma.customer.findUnique({
      where: { id: ret.customerId },
      select: { email: true },
    });
    if (customer?.email) {
      const recipient = customer.email;
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
