import { NextResponse } from "next/server";
import { createOrderFromCheckout } from "@/app/lib/orders";
import { enforceRateLimit } from "@/app/lib/ratelimit";

// Pedidos por TRANSFERENCIA (pago manual). El pago con tarjeta va por
// /api/checkout/session (Stripe Checkout).
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

    const result = await createOrderFromCheckout({
      customer: body.customer,
      items: body.items,
      paymentMethod: "transfer",
      sessionId: body.sessionId,
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
