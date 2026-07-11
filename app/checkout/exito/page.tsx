import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getStripe, stripeConfigured } from "@/app/lib/stripe";
import { createOrderFromCheckout } from "@/app/lib/orders";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ session_id?: string }> };

// Stripe redirige aquí tras un pago exitoso. Verificamos que esté pagado y solo
// entonces creamos el pedido (idempotente: no duplica si recargas).
export default async function CheckoutExitoPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  if (!session_id || !stripeConfigured()) redirect("/checkout");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    redirect("/checkout");
  }

  // Idempotencia: si ya creamos el pedido para esta sesión, ve a su confirmación.
  const existing = await prisma.order.findFirst({
    where: { chargeId: session.id },
    select: { id: true },
  });
  if (existing) redirect(`/confirmacion?order=${existing.id}&fresh=1`);

  const meta = session.metadata ?? {};
  const customer = JSON.parse(meta.customer || "{}");
  const items = JSON.parse(meta.items || "[]");

  const result = await createOrderFromCheckout({
    customer,
    items,
    paymentMethod: "card",
    sessionId: meta.sessionId || undefined,
    payment: {
      chargeId: session.id,
      cardBrand: "Tarjeta (Stripe)",
      paymentStatus: "pagado",
    },
  });

  if (!result.ok) redirect("/checkout");
  redirect(`/confirmacion?order=${result.id}&fresh=1`);
}
