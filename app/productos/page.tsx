import type { Metadata } from "next";
import { getAllProducts } from "@/app/lib/products";
import ProductosContent from "./_components/productos-content";

// ISR: refresca el catálogo cada 5 min desde la BD.
export const revalidate = 300;

export const metadata: Metadata = {
    title: "Nuestras Creaciones",
    alternates: { canonical: "/productos" },
    description:
        "Explora nuestra selección de alfajores artesanales y manjares saborizados de los Andes peruanos. Tunaluna, Sol Aguaymanto y Muña Andina.",
    openGraph: {
        title: "Nuestras Creaciones | Mishkitashua",
        description:
            "Alfajores andinos surtidos y manjares saborizados elaborados con ingredientes de los Andes peruanos.",
        images: [
            { url: "/images/tres-manjares-fila.png", width: 1200, height: 630 },
        ],
    },
};

export default async function ProductosPage() {
    const products = await getAllProducts();
    return <ProductosContent products={products} />;
}
