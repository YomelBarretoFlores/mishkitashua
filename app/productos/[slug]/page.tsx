import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, products } from "@/app/lib/products";
import { productJsonLd } from "@/app/lib/jsonld";
import { prisma } from "@/app/lib/prisma";
import ProductDetail from "./_components/product-detail";

type Props = {
  params: Promise<{ slug: string }>;
};

// ISR: regenera cada 5 min para refrescar el aggregateRating del JSON-LD.
export const revalidate = 300;

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
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
  const product = getProductBySlug(slug);
  if (!product) notFound();

  // Resumen de reseñas para el aggregateRating (estrellas en Google).
  const agg = await prisma.review.aggregate({
    where: { productSlug: slug },
    _avg: { rating: true },
    _count: true,
  });
  const rating =
    agg._count > 0
      ? { average: agg._avg.rating ?? 0, count: agg._count }
      : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, rating)),
        }}
      />
      <ProductDetail />
    </>
  );
}
