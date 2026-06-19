// Siembra reseñas de ejemplo para poblar el catálogo en demos.
// Cada reseña va ligada a un cliente + pedido (entregado) reales.
// Idempotente: si ya hay clientes demo, no vuelve a sembrar.
// Para limpiar: borra clientes con email "@demo.mishkitashua.com".
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCTS = {
  "alfajores-andinos-surtidos": {
    name: "Alfajores Andinos",
    price: 8.0,
    image: "/images/alfajores-caja-oscuro.png",
  },
  "manjar-tunaluna": {
    name: "Tunaluna",
    price: 15.0,
    image: "/images/tunaluna-frasco.png",
  },
  "manjar-sol-aguaymanto": {
    name: "Sol Aguaymanto",
    price: 15.0,
    image: "/images/aguaymanto-frasco.png",
  },
  "manjar-muna-andina": {
    name: "Muña Andina",
    price: 15.0,
    image: "/images/muna-frasco.png",
  },
};

// { nombre, ciudad, productSlug, rating, comentario, hace (días) }
const REVIEWS = [
  ["María Quispe", "Huaraz", "alfajores-andinos-surtidos", 5, "¡Deliciosos! La combinación de sabores andinos es única, se nota lo artesanal. Llegaron en perfecto estado.", 3],
  ["José Curi", "Lima", "alfajores-andinos-surtidos", 5, "Los pedí para un regalo y encantaron. El de aguaymanto es mi favorito.", 9],
  ["Lucía Ramos", "Trujillo", "alfajores-andinos-surtidos", 4, "Muy ricos y bien presentados. Me hubiera gustado que la caja trajera más unidades.", 14],
  ["Andrés Mendoza", "Huaraz", "alfajores-andinos-surtidos", 5, "El sabor a muña es espectacular, distinto a todo lo que había probado. Repetiré.", 21],
  ["Carmen Flores", "Arequipa", "manjar-tunaluna", 5, "El manjar de tuna tiene un sabor frutal increíble. Lo uso en el desayuno con pan casero.", 5],
  ["Pedro Salinas", "Lima", "manjar-tunaluna", 4, "Buena textura, cremoso y no empalaga. Me gustó bastante.", 12],
  ["Rosa Huamán", "Cusco", "manjar-tunaluna", 5, "Calidad de verdad artesanal. El frasco rinde mucho.", 20],
  ["Diego Ríos", "Huaraz", "manjar-sol-aguaymanto", 5, "El toque ácido del aguaymanto lo hace especial. Perfecto para postres.", 4],
  ["Valeria Castro", "Lima", "manjar-sol-aguaymanto", 4, "Rico y diferente. El color dorado es muy bonito, ideal para acompañar queques.", 11],
  ["Manuel Tinoco", "Chimbote", "manjar-sol-aguaymanto", 5, "Me sorprendió lo natural del sabor. Se siente la fruta de verdad.", 18],
  ["Sofía León", "Huaraz", "manjar-muna-andina", 5, "Nunca había probado manjar de muña, es fresco y aromático. Una joyita andina.", 6],
  ["Gabriel Ponce", "Lima", "manjar-muna-andina", 4, "Sabor herbal muy original. Al principio raro, pero termina gustando mucho.", 13],
  ["Elena Vargas", "Huánuco", "manjar-muna-andina", 5, "Aromático y cremoso, ideal con el pan de la mañana. Recomendadísimo.", 25],
];

async function main() {
  const existing = await prisma.customer.findFirst({
    where: { email: { endsWith: "@demo.mishkitashua.com" } },
  });
  if (existing) {
    console.log("Ya existen reseñas demo. Nada que sembrar.");
    return;
  }

  let count = 0;
  for (let i = 0; i < REVIEWS.length; i++) {
    const [name, city, slug, rating, comment, daysAgo] = REVIEWS[i];
    const product = PRODUCTS[slug];
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const email = `cliente${i + 1}@demo.mishkitashua.com`;

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone: "999000000",
        address: "Dirección demo",
        city,
        createdAt,
      },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: `DEMO-${(i + 1).toString().padStart(3, "0")}`,
        customerId: customer.id,
        subtotal: product.price,
        discount: 0,
        shippingCost: 12,
        total: product.price + 12,
        paymentMethod: "transfer",
        status: "entregado",
        createdAt,
        items: {
          create: [
            {
              productSlug: slug,
              productName: product.name,
              quantity: 1,
              price: product.price,
              image: product.image,
            },
          ],
        },
      },
    });

    await prisma.review.create({
      data: {
        orderId: order.id,
        customerId: customer.id,
        productSlug: slug,
        rating,
        comment,
        createdAt,
      },
    });
    count++;
  }

  console.log(`Sembradas ${count} reseñas demo.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
