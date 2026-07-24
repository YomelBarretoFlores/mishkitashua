import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { sendEmail } from "@/app/lib/resend";
import { paymentReceivedEmail } from "@/app/lib/emails/templates";

// Confirmar a mano el pago de un pedido por Yape o transferencia.
//
// Estas dos vías no tienen forma de validarse solas: el dinero llega al
// teléfono o a la cuenta del BCP, fuera de la aplicación. Hasta ahora el pedido
// nacía "pendiente" y no había manera de dejar constancia de que el abono había
// llegado, así que la única forma de saber si un pedido estaba cobrado era
// acordarse. Aquí se cierra ese ciclo.
//
// Solo aplica a `paymentMethod: "transfer"`. Los pedidos de Mercado Pago los
// gobierna la pasarela vía webhook; permitir marcarlos a mano abriría la puerta
// a declarar cobrado algo que la pasarela nunca cobró.

const schema = z.object({
  paymentStatus: z.enum(["pagado", "pendiente"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { paymentStatus } = parsed.data;

  try {
    const { id } = await params;
    const previous = await prisma.order.findUnique({
      where: { id },
      select: {
        orderNumber: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        customer: { select: { email: true, name: true } },
      },
    });
    if (!previous) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    if (previous.paymentMethod !== "transfer") {
      return NextResponse.json(
        {
          error:
            "Solo se confirman a mano los pagos por Yape o transferencia. Los de Mercado Pago los confirma la pasarela.",
        },
        { status: 400 }
      );
    }
    if (previous.paymentStatus === "reembolsado") {
      return NextResponse.json(
        { error: "Este pedido ya fue reembolsado" },
        { status: 409 }
      );
    }
    if (previous.paymentStatus === paymentStatus) {
      return NextResponse.json({ ok: true, sinCambios: true });
    }

    await prisma.order.update({ where: { id }, data: { paymentStatus } });

    // Se avisa al cliente solo al confirmar: le sirve de recibo y le ahorra
    // escribir por WhatsApp para preguntar si llegó su abono. Deshacer un
    // marcado por error es cosa interna y no debe generarle un correo.
    if (paymentStatus === "pagado" && previous.customer?.email) {
      const to = previous.customer.email;
      const datos = {
        orderNumber: previous.orderNumber,
        total: previous.total,
        customerName: previous.customer.name,
      };
      after(async () => {
        try {
          await sendEmail({ to, ...paymentReceivedEmail(datos) });
        } catch (err) {
          console.error("[orders] correo de pago confirmado falló:", err);
        }
      });
    }

    return NextResponse.json({ ok: true, paymentStatus });
  } catch (error) {
    console.error("[admin/orders/:id/pago PATCH]", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el pago" },
      { status: 500 }
    );
  }
}
