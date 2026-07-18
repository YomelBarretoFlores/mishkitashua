// Siembra idempotente de productos: upsert por slug. Correr con:
//   npx tsx prisma/seed-products.ts   (o: npm run db:seed:products)
// Seguro de correr varias veces; asigna sortOrder según el orden del array.
import { PrismaClient } from "@prisma/client";
import { seedProducts } from "../app/lib/product-data";

const prisma = new PrismaClient();

async function main() {
  let n = 0;
  for (const [index, p] of seedProducts.entries()) {
    const data = {
      name: p.name,
      subtitle: p.subtitle,
      category: p.category,
      price: p.price,
      weight: p.weight,
      description: p.description,
      longDescription: p.longDescription,
      ingredients: p.ingredients,
      allergens: p.allergens ?? null,
      features: p.features,
      image: p.image,
      images: p.images,
      color: p.color,
      customizable: p.customizable ?? false,
      flavorOptions: p.flavorOptions ?? [],
      boxSize: p.boxSize ?? null,
      sortOrder: index,
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
    n++;
  }
  const total = await prisma.product.count();
  console.log(`✓ ${n} productos sembrados · ${total} en la base`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
