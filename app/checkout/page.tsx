import type { Metadata } from "next";
import CheckoutContent from "./_components/checkout-content";
import { requireAuthPage } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "Finalizar Compra",
  description: "Completa tu pedido de forma segura.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Requiere sesión para comprar (así se recopilan los datos del cliente).
  await requireAuthPage("/checkout");
  return <CheckoutContent />;
}
