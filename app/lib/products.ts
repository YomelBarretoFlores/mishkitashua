import { prisma } from "@/app/lib/prisma";
import type { Product as PrismaProduct } from "@prisma/client";

// El catálogo vive en la base de datos (modelo Product). Estos helpers son la
// única forma de leerlo desde el storefront. Solo devuelven productos activos;
// los archivados (active:false) siguen existiendo para no romper referencias
// históricas, pero no se muestran ni se pueden comprar.
export type Product = PrismaProduct;

// Categorías válidas (se validan en la capa de app; en la BD es String).
export type ProductCategory = "alfajores" | "manjares";

export async function getAllProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const product = await prisma.product.findUnique({ where: { slug } });
  // Un producto archivado se trata como inexistente para el storefront.
  if (!product || !product.active) return undefined;
  return product;
}

export async function getProductsByCategory(
  category: ProductCategory
): Promise<Product[]> {
  return prisma.product.findMany({
    where: { active: true, category },
    orderBy: { sortOrder: "asc" },
  });
}
