import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { priceCheckout, isFirstPurchaseForUser } from "@/app/lib/orders";
import {
  mercadoPagoConfigured,
  mercadoPagoIsTest,
  getPreferenceClient,
} from "@/app/lib/mercadopago";
import { checkoutSchema as schema } from "@/app/lib/checkout-schema";
import { enforceRateLimit } from "@/app/lib/ratelimit";

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
    const customer = userId
      ? await prisma.customer.findUnique({
          where: { clerkUserId: userId },
          select: { id: true },
        })
      : null;

    const priced = await priceCheckout(data.items, {
      freeShipping: firstPurchase,
      couponCode: data.couponCode,
      customerId: customer?.id ?? null,
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
        // Se incluyen clerk_user_id y first_purchase porque el webhook corre
        // SIN sesión: si tuviera que deducirlos, calcularía un envío distinto
        // del que se acaba de cobrar y hasta crearía un cliente duplicado.
        metadata: {
          customer: JSON.stringify(data.customer),
          items: JSON.stringify(data.items),
          session_id: data.sessionId ?? "",
          coupon: priced.coupon?.code ?? "",
          clerk_user_id: userId ?? "",
          first_purchase: firstPurchase ? "1" : "",
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
