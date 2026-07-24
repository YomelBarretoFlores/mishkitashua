import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { priceCheckout, isFirstPurchaseForUser } from "@/app/lib/orders";
import { mercadoPagoConfigured, getPaymentClient } from "@/app/lib/mercadopago";
import { checkoutSchema } from "@/app/lib/checkout-schema";
import { createOrderFromMpPayment } from "@/app/lib/mp-orders";
import { enforceRateLimit } from "@/app/lib/ratelimit";

// Cobro con Yape (Checkout API).
//
// A diferencia de Checkout Pro, aquí el cliente no sale de la web y NO necesita
// cuenta de Mercado Pago: le basta la app de Yape. Es la razón de ser de esta
// ruta, porque por Checkout Pro Yape pasa por la billetera de MP y exige cuenta.
//
// El celular y el código de aprobación NUNCA llegan aquí: el SDK del navegador
// los cambia por un token contra Mercado Pago directamente. Este endpoint solo
// ve ese token, que además es de un solo uso. Así ningún dato sensible toca
// nuestros servidores ni nuestros registros.

const schema = checkoutSchema.extend({
  // Token de un solo uso que devuelve mp.yape() en el navegador.
  token: z.string().min(10).max(200),
});

// Traducción de los rechazos de Mercado Pago a algo que el comprador entienda y
// pueda resolver. Sin esto solo vería "el pago fue rechazado" y volvería a
// intentarlo igual, con el mismo resultado.
function motivoLegible(statusDetail: string | undefined): string {
  switch (statusDetail) {
    case "cc_rejected_insufficient_amount":
      return "No hay saldo suficiente en tu cuenta de Yape.";
    case "cc_rejected_max_attempts":
      return "Demasiados intentos. Espera unos minutos antes de volver a probar.";
    case "cc_rejected_bad_filled_security_code":
    case "cc_rejected_other_reason":
      return "El código de aprobación no es válido o ya venció. Genera uno nuevo en tu app de Yape.";
    case "cc_rejected_high_risk":
      return "Yape rechazó la operación por seguridad. Prueba con otro medio de pago.";
    default:
      return "Yape rechazó el pago. Genera un código nuevo en tu app e inténtalo otra vez.";
  }
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "checkout-yape", 6, 60_000);
  if (limited) return limited;

  if (!mercadoPagoConfigured()) {
    return NextResponse.json(
      { error: "Los pagos no están configurados" },
      { status: 503 }
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const { userId } = await auth();
    const firstPurchase = await isFirstPurchaseForUser(userId);
    const customer = userId
      ? await prisma.customer.findUnique({
          where: { clerkUserId: userId },
          select: { id: true },
        })
      : null;

    // El importe se recalcula SIEMPRE en el servidor: lo que mande el navegador
    // sirve para pintar la pantalla, nunca para decidir cuánto se cobra.
    const priced = await priceCheckout(data.items, {
      freeShipping: firstPurchase,
      couponCode: data.couponCode,
      customerId: customer?.id ?? null,
    });
    if (!priced.ok) {
      return NextResponse.json({ error: priced.error }, { status: priced.status });
    }

    // Límites del método "yape" según la propia API de MP. Se repiten aquí
    // porque la comprobación del navegador se salta con un curl, y sin esto el
    // rechazo llegaría desde Mercado Pago sin explicación aprovechable.
    if (priced.total < 1 || priced.total > 2000) {
      return NextResponse.json(
        {
          error: `Yape solo acepta cobros entre S/ 1.00 y S/ 2000.00. Tu total es de S/ ${priced.total.toFixed(2)}: elige otro medio de pago.`,
        },
        { status: 400 }
      );
    }

    // La metadata tiene la MISMA forma que la de Checkout Pro a propósito: así
    // el pedido lo crea la función de siempre, ya probada e idempotente, y el
    // webhook puede reconstruirlo solo si algo se cae entre el cobro y aquí.
    const metadata = {
      customer: JSON.stringify(data.customer),
      items: JSON.stringify(data.items),
      session_id: data.sessionId ?? "",
      coupon: priced.coupon?.code ?? "",
      clerk_user_id: userId ?? "",
      first_purchase: firstPurchase ? "1" : "",
    };

    const payment = await getPaymentClient().create({
      body: {
        token: data.token,
        transaction_amount: priced.total,
        description: "Pedido Mishkitashua",
        installments: 1,
        payment_method_id: "yape",
        payer: { email: data.customer.email },
        metadata,
      },
      // Evita cobrar dos veces si la respuesta se pierde y el navegador
      // reintenta: Mercado Pago devuelve el mismo pago en vez de crear otro.
      requestOptions: { idempotencyKey: randomUUID() },
    });

    if (payment.status !== "approved") {
      console.warn(
        `[yape] pago no aprobado: ${payment.status} / ${payment.status_detail}`
      );
      return NextResponse.json(
        { error: motivoLegible(payment.status_detail) },
        { status: 402 }
      );
    }

    // Cobrado. A partir de aquí el dinero YA salió de la cuenta del cliente, así
    // que un fallo nuestro no puede quedar en silencio: si esto falla, el
    // webhook de Mercado Pago lo reintentará con la misma metadata.
    const result = await createOrderFromMpPayment(String(payment.id));
    if (!result.ok) {
      console.error(
        `[yape] pago ${payment.id} COBRADO pero sin pedido: ${result.reason}`
      );
      return NextResponse.json(
        {
          error:
            "Tu pago se procesó, pero hubo un problema al registrar el pedido. Escríbenos por WhatsApp con tu comprobante y lo resolvemos enseguida.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: result.orderId });
  } catch (error) {
    console.error("[checkout/yape]", error);
    // Los errores de la API de MP traen un mensaje utilizable; el resto, no.
    const msg = (error as { message?: string })?.message;
    return NextResponse.json(
      { error: msg?.includes("token") ? "El código de Yape no es válido o ya venció. Genera uno nuevo." : "No se pudo procesar el pago" },
      { status: 400 }
    );
  }
}
