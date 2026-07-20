import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { mercadoPagoConfigured } from "@/app/lib/mercadopago";
import { createOrderFromMpPayment } from "@/app/lib/mp-orders";

// Webhook de Mercado Pago. Se dispara cuando cambia el estado de un pago, así
// que el pedido se crea aunque el comprador cierre la pestaña sin volver.
// La creación es idempotente por chargeId, por lo que no duplica con la página
// de retorno.
//
// Seguridad en dos capas:
//  1. Firma HMAC (x-signature) validada con MP_WEBHOOK_SECRET (si está seteada).
//  2. El pago SIEMPRE se verifica contra la API de MP: un id de pago falso no
//     crea nada porque no estará "approved".
// Siempre responde 200 para que MP no reintente en bucle por errores nuestros.

function validSignature(request: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    // En producción se falla CERRADO: si el secreto falta (o alguien lo borra
    // por error), este endpoint quedaría abierto a cualquiera. En desarrollo se
    // permite para poder probar el flujo sin configurar el webhook.
    if (process.env.NODE_ENV === "production") {
      console.error("[webhook/mp] MP_WEBHOOK_SECRET no configurada: aviso rechazado");
      return false;
    }
    return true;
  }

  const signature = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    signature.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(v1, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!mercadoPagoConfigured()) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const url = new URL(request.url);
  let body: { type?: string; action?: string; data?: { id?: string } } = {};
  try {
    body = await request.json();
  } catch {
    /* algunos avisos vienen sin cuerpo; se usa la query */
  }

  // El id del pago llega en el cuerpo (data.id) o en la query (data.id / id).
  const dataId =
    body.data?.id ||
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    "";
  const type = body.type || url.searchParams.get("type") || url.searchParams.get("topic") || "";

  // Solo interesan los avisos de pago.
  if (type && type !== "payment") {
    return NextResponse.json({ ok: true, ignored: type }, { status: 200 });
  }
  if (!dataId) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!validSignature(request, dataId)) {
    // Firma inválida: no procesar, pero no revelar detalles.
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const result = await createOrderFromMpPayment(dataId);
    if (result.ok && result.created) {
      console.log(`[webhook/mp] pedido creado ${result.orderId} para pago ${dataId}`);
    } else if (!result.ok) {
      // Un pago aprobado que no acaba en pedido es lo peor que puede pasar
      // aquí, así que nunca debe morir en silencio.
      console.error(`[webhook/mp] pago ${dataId} SIN pedido: ${result.reason}`);
    }
  } catch (err) {
    // No romper el ciclo de reintentos de MP por un error transitorio nuestro:
    // se responde 200 igual; el pago sigue verificable en el próximo aviso.
    console.error("[webhook/mp] error:", err);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
