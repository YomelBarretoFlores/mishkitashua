import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { getPaymentClient, getPreferenceClient } from "@/app/lib/mercadopago";
import { createOrderFromCheckout } from "@/app/lib/orders";

type Result =
  | { ok: true; orderId: string; created: boolean }
  | { ok: false; reason: string };

// Crea el pedido a partir de un pago aprobado de Mercado Pago. Idempotente por
// chargeId (payment_id): si ya existe, no duplica. La verificación se hace
// contra la API de MP, nunca contra parámetros de URL. Lo usan tanto la página
// de retorno como el webhook, así que un pedido se crea aunque el comprador
// cierre la pestaña sin volver al sitio.
//
// Los datos del pedido viajan en la metadata. Checkout Pro la propaga del
// preference al payment, así que el webhook (que solo tiene el payment_id) la
// lee del pago; la página de retorno pasa el preferenceId como respaldo.
export async function createOrderFromMpPayment(
  paymentId: string,
  preferenceId?: string
): Promise<Result> {
  // Idempotencia.
  const existing = await prisma.order.findFirst({
    where: { chargeId: paymentId },
    select: { id: true },
  });
  if (existing) return { ok: true, orderId: existing.id, created: false };

  // Fuente de verdad: la API de MP.
  const payment = await getPaymentClient().get({ id: paymentId });
  if (payment.status !== "approved") {
    return { ok: false, reason: `estado ${payment.status}` };
  }

  // Metadata del pago; si viene vacía y hay preferenceId, se usa la del preference.
  let meta = ((payment as { metadata?: Record<string, string> }).metadata ??
    {}) as Record<string, string>;
  if (!meta.customer && preferenceId) {
    const preference = await getPreferenceClient().get({ preferenceId });
    meta = (preference.metadata ?? {}) as Record<string, string>;
  }
  let customer: unknown;
  let items: unknown;
  try {
    customer = JSON.parse(meta.customer || "{}");
    items = JSON.parse(meta.items || "[]");
  } catch {
    return { ok: false, reason: "metadata inválida" };
  }

  try {
    const result = await createOrderFromCheckout({
      customer: customer as never,
      items: items as never,
      paymentMethod: payment.payment_method_id ?? "mercadopago",
      sessionId: meta.session_id || undefined,
      couponCode: meta.coupon || null,
      // Quién compró y si tocaba envío gratis se decidió al cobrar; aquí no hay
      // sesión, así que viaja en la metadata en vez de deducirse.
      actor: {
        clerkUserId: meta.clerk_user_id || null,
        firstPurchase: meta.first_purchase === "1",
      },
      payment: {
        chargeId: String(payment.id ?? paymentId),
        cardBrand: `${payment.payment_method_id ?? "Mercado Pago"}`,
        cardLast4: payment.card?.last_four_digits ?? undefined,
        paymentStatus: "pagado",
      },
    });

    if (!result.ok) return { ok: false, reason: result.error };
    return { ok: true, orderId: result.id, created: true };
  } catch (err) {
    // La página de retorno y el webhook corren casi a la vez: si el otro ganó
    // la carrera, el @unique de chargeId rechaza este insert. No es un error,
    // es exactamente lo que queremos — se devuelve el pedido que sí se creó.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const winner = await prisma.order.findFirst({
        where: { chargeId: paymentId },
        select: { id: true },
      });
      if (winner) return { ok: true, orderId: winner.id, created: false };
    }
    throw err;
  }
}
