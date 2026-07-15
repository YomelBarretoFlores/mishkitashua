import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { priceCheckout, isFirstPurchaseForUser } from "@/app/lib/orders";
import {
  mercadoPagoConfigured,
  mercadoPagoIsTest,
  getPreferenceClient,
} from "@/app/lib/mercadopago";
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
  const limited = enforceRateLimit(request, "checkout-mp", 6, 60_000);
  if (limited) return limited;

  if (!mercadoPagoConfigured()) {
    return NextResponse.json(
      { error: "Mercado Pago no está configurado" },
      { status: 503 }
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
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const data = parsed.data;

  try {
    // Envío gratis de bienvenida si es la primera compra del usuario logueado.
    const { userId } = await auth();
    const firstPurchase = await isFirstPurchaseForUser(userId);

    // El monto SIEMPRE se recalcula en el servidor (anti-manipulación).
    const priced = await priceCheckout(data.items, {
      freeShipping: firstPurchase,
    });
    if (!priced.ok) {
      return NextResponse.json({ error: priced.error }, { status: priced.status });
    }

    const origin = request.headers.get("origin") ?? new URL(request.url).origin;
    // Mercado Pago rechaza auto_return si las back_urls no son públicas
    // (localhost). En desarrollo se omite: el comprador vuelve con el botón
    // "Volver al sitio" del checkout.
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(origin);

    const preference = await getPreferenceClient().create({
      body: {
        items: [
          {
            id: "pedido-mishkitashua",
            title: "Pedido Mishkitashua",
            quantity: 1,
            unit_price: priced.total,
            currency_id: "PEN",
          },
        ],
        payer: {
          name: data.customer.name,
          email: data.customer.email,
        },
        back_urls: {
          success: `${origin}/checkout/mp-retorno`,
          pending: `${origin}/checkout/mp-retorno`,
          failure: `${origin}/checkout`,
        },
        ...(isLocal ? {} : { auto_return: "approved" as const }),
        // Datos para recrear el pedido tras el pago (nunca datos de tarjeta).
        metadata: {
          customer: JSON.stringify(data.customer),
          items: JSON.stringify(data.items),
          session_id: data.sessionId ?? "",
        },
        statement_descriptor: "MISHKITASHUA",
      },
    });

    // El entorno lo manda MP_TEST_MODE, no la respuesta: así nunca se mezcla
    // el checkout de sandbox con credenciales de producción ni al revés.
    const url = mercadoPagoIsTest()
      ? (preference.sandbox_init_point ?? preference.init_point)
      : preference.init_point;
    if (!url) {
      return NextResponse.json(
        { error: "No se pudo iniciar el pago" },
        { status: 502 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[checkout/mercadopago] error:", error);
    return NextResponse.json(
      { error: "Error al iniciar el pago" },
      { status: 500 }
    );
  }
}
