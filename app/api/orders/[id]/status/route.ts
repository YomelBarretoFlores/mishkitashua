import { NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { sendEmail } from "@/app/lib/resend";
import { orderStatusEmail } from "@/app/lib/emails/templates";

// "cancelado" no es un paso más del recorrido: es una salida. Existe para
// poder medir la tasa de cancelación y para no dejar pedidos caídos colgando
// como si siguieran en curso.
const VALID_STATUSES = [
  "confirmado",
  "preparando",
  "enviado",
  "entregado",
  "cancelado",
];
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
      select: {
        status: true,
        shippedAt: true,
        deliveredAt: true,
        cancelledAt: true,
      },
    });
    if (!previous) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Se estampa la fecha del hito la primera vez que se alcanza. Sin esto solo
    // se sabría en qué estado está el pedido AHORA, y los indicadores (OTIF,
    // tiempo de ciclo) necesitan saber CUÁNDO llegó a cada estado.
    const now = new Date();
    const stamps: Record<string, Date> = {};
    if (status === "enviado" && !previous.shippedAt) stamps.shippedAt = now;
    if (status === "entregado") {
      if (!previous.shippedAt) stamps.shippedAt = now; // se saltó el paso
      if (!previous.deliveredAt) stamps.deliveredAt = now;
    }
    if (status === "cancelado" && !previous.cancelledAt) stamps.cancelledAt = now;

    const order = await prisma.order.update({
      where: { id },
      data: { status, ...stamps },
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
