import { NextResponse } from "next/server";
import { z } from "zod";
import { after } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { returnRequestedEmail } from "@/app/lib/emails/templates";
import { enforceRateLimit } from "@/app/lib/ratelimit";
import { RETURN_WINDOW_DAYS, withinReturnWindow } from "@/app/lib/return-status";

const schema = z.object({
  orderId: z.string().min(1).max(60),
  reason: z.string().trim().min(5).max(1000),
});

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "returns", 5, 60_000);
  if (limited) return limited;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Inicia sesión para solicitar una devolución" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Escribe un motivo (mínimo 5 caracteres)" },
      { status: 400 }
    );
  }
  const { orderId, reason } = parsed.data;

  try {
    const customer = await prisma.customer.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, email: true },
    });
    if (!customer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, customerId: true, status: true, orderNumber: true, createdAt: true, total: true },
    });
    // El pedido debe existir, ser del cliente y estar entregado.
    if (!order || order.customerId !== customer.id) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    if (order.status !== "entregado") {
      return NextResponse.json(
        { error: "Solo puedes devolver pedidos ya entregados" },
        { status: 400 }
      );
    }
    if (!withinReturnWindow(order.createdAt)) {
      return NextResponse.json(
        {
          error: `El plazo para devolver es de ${RETURN_WINDOW_DAYS} días y ya venció`,
        },
        { status: 400 }
      );
    }

    // Una devolución por pedido, sea cual sea su estado: si no, tras un rechazo
    // se podría volver a solicitar sin límite. El @unique de orderId lo blinda
    // también contra dos peticiones simultáneas.
    const existing = await prisma.return.findUnique({ where: { orderId } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya solicitaste una devolución para este pedido" },
        { status: 400 }
      );
    }

    const ret = await prisma.return.create({
      data: { orderId, customerId: customer.id, reason },
    });

    const recipient = customer.email;
    const orderNumber = order.orderNumber;
    after(async () => {
      try {
        await sendEmail({
          to: recipient,
          ...returnRequestedEmail({ orderNumber }),
        });
      } catch (err) {
        console.error("[returns] correo de solicitud falló:", err);
      }
    });

    return NextResponse.json({ id: ret.id, status: ret.status });
  } catch (error) {
    console.error("[returns POST]", error);
    return NextResponse.json({ error: "Error al solicitar la devolución" }, { status: 500 });
  }
}
