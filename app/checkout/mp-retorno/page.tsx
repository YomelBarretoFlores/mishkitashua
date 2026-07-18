import { redirect } from "next/navigation";
import { mercadoPagoConfigured } from "@/app/lib/mercadopago";
import { createOrderFromMpPayment } from "@/app/lib/mp-orders";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    payment_id?: string;
    status?: string;
    preference_id?: string;
  }>;
};

// Mercado Pago redirige aquí tras el pago. La creación del pedido (verificación
// contra la API + idempotencia) vive en createOrderFromMpPayment, compartida
// con el webhook, así que da igual si el comprador vuelve por aquí o no.
export default async function MercadoPagoRetornoPage({ searchParams }: Props) {
  const { payment_id, preference_id } = await searchParams;
  if (!payment_id || !preference_id || !mercadoPagoConfigured()) {
    redirect("/checkout");
  }

  const result = await createOrderFromMpPayment(payment_id!, preference_id!);
  if (!result.ok) redirect("/checkout");
  redirect(`/confirmacion?order=${result.orderId}&fresh=1`);
}
