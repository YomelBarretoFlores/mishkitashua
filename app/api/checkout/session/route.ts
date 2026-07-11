import { NextResponse } from "next/server";
import { z } from "zod";
import { priceCheckout, createOrderFromCheckout } from "@/app/lib/orders";
import { stripeConfigured, getStripe } from "@/app/lib/stripe";
import { enforceRateLimit } from "@/app/lib/ratelimit";

const schema = z.object({
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().email(),
    phone: z.string().trim().min(6).max(30),
    address: z.string().trim().min(3).max(200),
    city: z.string().trim().min(2).max(100),
  }),
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        quantity: z.number().int().min(1).max(99),
        customization: z.record(z.string(), z.number()).nullable().optional(),
      })
    )
    .min(1),
  sessionId: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "checkout", 6, 60_000);
  if (limited) return limited;

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const data = parsed.data;

    // Recalcular el monto en el servidor (anti-manipulación de precios).
    const priced = await priceCheckout(data.items);
    if (!priced.ok) {
      return NextResponse.json({ error: priced.error }, { status: priced.status });
    }

    // --- Modo simulación (sin llaves de Stripe): crea el pedido directamente ---
    if (!stripeConfigured()) {
      const result = await createOrderFromCheckout({
        customer: data.customer,
        items: data.items,
        paymentMethod: "card",
        sessionId: data.sessionId,
        payment: { cardBrand: "Simulado", paymentStatus: "simulado" },
      });
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error },
          { status: result.status }
        );
      }
      return NextResponse.json({
        url: `/confirmacion?order=${result.id}&fresh=1`,
        simulated: true,
      });
    }

    // --- Stripe Checkout hospedado (tokenización + 3D Secure, PCI SAQ-A) ---
    const origin =
      request.headers.get("origin") ?? new URL(request.url).origin;
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: data.customer.email,
      line_items: [
        {
          price_data: {
            currency: "pen",
            product_data: { name: "Pedido Mishkitashua" },
            unit_amount: Math.round(priced.total * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      // Datos para recrear el pedido tras el pago (sin datos de tarjeta).
      metadata: {
        customer: JSON.stringify(data.customer),
        items: JSON.stringify(data.items),
        sessionId: data.sessionId ?? "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout/session] error:", error);
    return NextResponse.json(
      { error: "Error al iniciar el pago" },
      { status: 500 }
    );
  }
}
