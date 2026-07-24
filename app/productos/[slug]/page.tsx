import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/app/lib/products";
import { productJsonLd } from "@/app/lib/jsonld";
import { prisma } from "@/app/lib/prisma";
import { dePedidoReal } from "@/app/lib/demo-data";
import ProductDetail from "./_components/product-detail";

type Props = {
  params: Promise<{ slug: string }>;
};

// ISR: regenera cada 5 min para refrescar el aggregateRating del JSON-LD.
export const revalidate = 300;

export async function generateStaticParams() {
  // Si la BD no responde en build, dejar que las páginas se generen on-demand
  // (dynamicParams por defecto = true), en vez de romper el build.
  try {
    const products = await getAllProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: `${product.name} — ${product.subtitle}`,
    description: product.description,
    alternates: { canonical: `/productos/${product.slug}` },
    openGraph: {
      title: `${product.name} | Mishkitashua`,
      description: product.description,
      url: `/productos/${product.slug}`,
      images: [{ url: product.image, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Mishkitashua`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Resumen de reseñas para el aggregateRating (estrellas en Google).
  // Envuelto en try/catch: un hipo de conexión a la BD durante el build/ISR no
  // debe romper el prerender de la página (se renderiza sin aggregateRating).
  let rating: { average: number; count: number } | undefined;
  try {
    const agg = await prisma.review.aggregate({
      where: { productSlug: slug, ...dePedidoReal },
      _avg: { rating: true },
      _count: true,
    });
    if (agg._count > 0) {
      rating = { average: agg._avg.rating ?? 0, count: agg._count };
    }
  } catch (err) {
    console.error("[producto] no se pudo cargar el rating:", err);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, rating)),
        }}
      />
      <ProductDetail product={product} />
    </>
  );
}
