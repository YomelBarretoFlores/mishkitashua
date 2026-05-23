import type { Metadata } from "next";
import CarritoContent from "./_components/carrito-content";

export const metadata: Metadata = {
  title: "Tu Selección",
  description:
    "Revisa los productos artesanales que has elegido antes de continuar con tu pedido.",
  robots: { index: false, follow: false },
};

export default function CarritoPage() {
  return <CarritoContent />;
}
