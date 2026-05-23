import type { Metadata } from "next";
import CheckoutContent from "./_components/checkout-content";

export const metadata: Metadata = {
  title: "Finalizar Compra",
  description: "Completa tu pedido de forma segura.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}
