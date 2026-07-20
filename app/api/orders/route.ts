import { NextResponse } from "next/server";
import { createOrderFromCheckout } from "@/app/lib/orders";
import { checkoutSchema } from "@/app/lib/checkout-schema";
import { enforceRateLimit } from "@/app/lib/ratelimit";

// Pedidos por TRANSFERENCIA (pago manual, lo confirma el admin). El pago con
// tarjeta y Yape va por /api/checkout/mercadopago.
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "orders", 8, 60_000);
  if (limited) return limited;
  try {
    const body = await request.json();

    if (body.paymentMethod !== "transfer") {
      return NextResponse.json(
        { error: "Método de pago inválido para esta ruta" },
        { status: 400 }
      );
    }

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const data = parsed.data;

    const result = await createOrderFromCheckout({
      customer: data.customer,
      items: data.items,
      paymentMethod: "transfer",
      sessionId: data.sessionId,
      couponCode: data.couponCode ?? null,
      payment: { paymentStatus: "pendiente" }, // transferencia: confirma el admin
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ id: result.id, orderNumber: result.orderNumber });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Error al crear el pedido" },
      { status: 500 }
    );
  }
}
