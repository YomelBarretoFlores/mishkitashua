import { NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { sendEmail } from "@/app/lib/resend";
import { orderStatusEmail } from "@/app/lib/emails/templates";

const VALID_STATUSES = ["confirmado", "preparando", "enviado", "entregado"];
// "confirmado" no se avisa: ya lo cubre el comprobante de la compra.
const NOTIFIABLE = ["preparando", "enviado", "entregado"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    // Se lee antes para no reenviar el correo si el estado no cambió (pulsar
    // dos veces el mismo botón en el panel no debe escribirle al cliente).
    const previous = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!previous) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { customer: { select: { email: true } } },
    });

    // Avisar al cliente del avance de su pedido.
    if (
      previous.status !== status &&
      (NOTIFIABLE as readonly string[]).includes(status) &&
      order.customer?.email
    ) {
      const recipient = order.customer.email;
      const orderNumber = order.orderNumber;
      after(async () => {
        try {
          await sendEmail({
            to: recipient,
            ...orderStatusEmail({
              orderNumber,
              status: status as (typeof NOTIFIABLE)[number],
            }),
          });
        } catch (err) {
          console.error("[orders] correo de estado falló:", err);
        }
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[orders/:id/status PATCH]", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado" },
      { status: 500 }
    );
  }
}
