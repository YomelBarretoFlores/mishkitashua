import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import {
  mercadoPagoConfigured,
  getPaymentClient,
  getPreferenceClient,
} from "@/app/lib/mercadopago";
import { createOrderFromCheckout } from "@/app/lib/orders";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    payment_id?: string;
    status?: string;
    preference_id?: string;
  }>;
};

// Mercado Pago redirige aquí tras el pago. Verificamos contra la API que el
// pago esté aprobado (no confiamos en los parámetros de la URL) y solo entonces
// creamos el pedido. Idempotente: recargar no duplica el pedido.
export default async function MercadoPagoRetornoPage({ searchParams }: Props) {
  const { payment_id, preference_id } = await searchParams;
  if (!payment_id || !preference_id || !mercadoPagoConfigured()) {
    redirect("/checkout");
  }

  // Idempotencia: si ya existe el pedido de este pago, ir a su confirmación.
  const existing = await prisma.order.findFirst({
    where: { chargeId: payment_id },
    select: { id: true },
  });
  if (existing) redirect(`/confirmacion?order=${existing.id}&fresh=1`);

  // Fuente de verdad: la API, no la URL (evita falsificar un pago aprobado).
  const payment = await getPaymentClient().get({ id: payment_id });
  if (payment.status !== "approved") {
    redirect("/checkout");
  }

  // Los datos del pedido viajan en la preferencia, no en la URL.
  const preference = await getPreferenceClient().get({
    preferenceId: preference_id,
  });
  const meta = (preference.metadata ?? {}) as Record<string, string>;
  const customer = JSON.parse(meta.customer || "{}");
  const items = JSON.parse(meta.items || "[]");

  const result = await createOrderFromCheckout({
    customer,
    items,
    paymentMethod: payment.payment_method_id ?? "mercadopago",
    sessionId: meta.session_id || undefined,
    payment: {
      chargeId: String(payment.id ?? payment_id),
      cardBrand: `${payment.payment_method_id ?? "Mercado Pago"}`,
      cardLast4: payment.card?.last_four_digits ?? undefined,
      paymentStatus: "pagado",
    },
  });

  if (!result.ok) redirect("/checkout");
  redirect(`/confirmacion?order=${result.id}&fresh=1`);
}
