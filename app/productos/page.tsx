import type { Metadata } from "next";
import ProductosContent from "./_components/productos-content";

export const metadata: Metadata = {
  title: "Nuestras Creaciones",
  description:
    "Explora nuestra selección de alfajores artesanales y manjares saborizados de los Andes peruanos. Tunaluna, Sol Aguaymanto y Muña Andina.",
  openGraph: {
    title: "Nuestras Creaciones | Mishkitashua",
    description:
      "Alfajores andinos surtidos y manjares saborizados elaborados con ingredientes de los Andes peruanos.",
    images: [{ url: "/images/tres-manjares.jpg", width: 1200, height: 630 }],
  },
};

export default function ProductosPage() {
  return <ProductosContent />;
}
