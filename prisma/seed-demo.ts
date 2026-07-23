/**
 * Datos de ejemplo para poblar los indicadores.
 *
 *   npx tsx prisma/seed-demo.ts          → genera los datos
 *   npx tsx prisma/seed-demo.ts --wipe   → los borra
 *
 * TODO lo que crea este script queda marcado con isDemo, así que se distingue
 * del historial real y se puede borrar entero sin tocar los pedidos de verdad.
 * Los clientes de ejemplo usan el dominio @demo.mishkitashua.com, que el filtro
 * de correos ya excluye de cualquier envío.
 */
import { PrismaClient } from "@prisma/client";
import { promisedDeliveryDate } from "../app/lib/logistics";

const prisma = new PrismaClient();

const DEMO_DOMAIN = "demo.mishkitashua.com";
const DAY = 86_400_000;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function chance(p: number): boolean {
  return Math.random() < p;
}
function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const NOMBRES = [
  "Rosa Villanueva", "Carlos Mendoza", "Ana Quispe", "Luis Ramírez",
  "María Castillo", "Jorge Huamán", "Elena Vargas", "Pedro Alvarado",
  "Sofía Ríos", "Diego Sánchez", "Lucía Paredes", "Miguel Torres",
  "Carmen Rojas", "Andrés Palma", "Julia Espinoza", "Raúl Cárdenas",
];
const CIUDADES = ["Huaraz", "Lima", "Trujillo", "Chimbote", "Caraz", "Arequipa"];
const MOTIVOS = [
  "El frasco llegó con la tapa suelta y se derramó parte del manjar.",
  "Recibí dos unidades en vez de las tres que pedí.",
  "Los alfajores llegaron rotos dentro de la caja.",
  "El producto llegó con la fecha de consumo muy próxima.",
  "Me enviaron el sabor equivocado.",
];
const COMENTARIOS = [
  "Riquísimos, el manjar de aguaymanto es otro nivel.",
  "Llegó rápido y bien embalado. Repetiré.",
  "El alfajor de mashua es distinto a todo lo que había probado.",
  "Muy bueno, aunque me hubiera gustado que trajera más unidades.",
  "Buen sabor, la presentación es preciosa.",
  "Llegó un poco tarde pero el producto vale la pena.",
];

async function wipe() {
  // El orden importa: primero lo que apunta a los pedidos.
  const demoOrders = await prisma.order.findMany({
    where: { isDemo: true },
    select: { id: true },
  });
  const orderIds = demoOrders.map((o) => o.id);

  const reviews = await prisma.review.deleteMany({
    where: { orderId: { in: orderIds } },
  });
  const returns = await prisma.return.deleteMany({
    where: { orderId: { in: orderIds } },
  });
  const items = await prisma.orderItem.deleteMany({
    where: { orderId: { in: orderIds } },
  });
  const movements = await prisma.stockMovement.deleteMany({
    where: { orderId: { in: orderIds } },
  });
  const orders = await prisma.order.deleteMany({ where: { isDemo: true } });
  const customers = await prisma.customer.deleteMany({
    where: { isDemo: true, orders: { none: {} } },
  });

  console.log(
    `Borrado: ${orders.count} pedidos, ${items.count} líneas, ${returns.count} devoluciones, ` +
      `${reviews.count} reseñas, ${movements.count} movimientos, ${customers.count} clientes.`
  );
}

async function seed() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, slug: true, name: true, price: true, image: true },
  });
  if (products.length === 0) {
    console.error("No hay productos. Corre antes: npm run db:seed:products");
    return;
  }

  // 1. Stock inicial, para que el control de inventario tenga algo que mostrar.
  const stockInicial: Record<string, number> = {
    "alfajores-andinos-surtidos": 40,
    "alfajor-unitario": 120,
    "manjar-tunaluna": 25,
    "manjar-sol-aguaymanto": 18,
    "manjar-muna-andina": 4, // deliberadamente bajo: muestra "últimas unidades"
  };
  for (const p of products) {
    const stock = stockInicial[p.slug];
    if (stock === undefined) continue;
    await prisma.product.update({ where: { id: p.id }, data: { stock } });
    await prisma.stockMovement.create({
      data: {
        productId: p.id,
        delta: stock,
        reason: "reposicion",
        note: "Stock inicial (datos de ejemplo)",
      },
    });
  }
  console.log(`Stock inicial asignado a ${products.length} productos.`);

  // 2. Clientes de ejemplo. Se reutilizan los que ya existan por correo.
  const customers: { id: string; name: string; email: string }[] = [];
  for (let i = 0; i < NOMBRES.length; i++) {
    const name = NOMBRES[i];
    const email = `${name.split(" ")[0].toLowerCase()}${i + 1}@${DEMO_DOMAIN}`;
    const ciudad = pick(CIUDADES);
    const existing = await prisma.customer.findFirst({ where: { email } });
    const c = existing
      ? await prisma.customer.update({
          where: { id: existing.id },
          data: { isDemo: true },
          select: { id: true, name: true, email: true },
        })
      : await prisma.customer.create({
          data: {
            name,
            email,
            phone: `+51 9${randInt(10000000, 99999999)}`,
            address: `Jr. ${pick(["Los Andes", "San Martín", "Bolívar", "Sucre"])} ${randInt(100, 999)}`,
            city: ciudad,
            isDemo: true,
            marketingOptIn: chance(0.8),
          },
          select: { id: true, name: true, email: true },
        });
    customers.push(c);
  }
  console.log(`${customers.length} clientes de ejemplo listos.`);

  // 3. Pedidos repartidos en los últimos 90 días, con una mezcla realista de
  //    resultados: la mayoría llega a tiempo, algunos tarde, unos se cancelan
  //    y otros siguen en curso.
  const NUM_ORDERS = 60;
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "singleton" },
  });
  const deliveryDays = settings?.deliveryDays ?? 3;
  const shippingCost = settings?.shippingCost ?? 12;

  let creados = 0;
  const entregados: { id: string; customerId: string; slugs: string[]; when: Date }[] = [];

  for (let i = 0; i < NUM_ORDERS; i++) {
    // Se decide primero el desenlace, porque condiciona la antigüedad: un
    // pedido "en preparación" de hace dos meses no existe en la vida real,
    // sería un pedido abandonado.
    const roll = Math.random();
    const enCurso = roll >= 0.85;
    const daysAgo = enCurso ? randInt(0, 3) : randInt(4, 90);
    const createdAt = new Date(Date.now() - daysAgo * DAY);
    const customer = pick(customers);

    // 1 a 3 productos distintos por pedido.
    const chosen = [...products].sort(() => Math.random() - 0.5).slice(0, randInt(1, 3));
    const items = chosen.map((p) => ({
      productSlug: p.slug,
      productName: p.name,
      quantity: randInt(1, 4),
      price: p.price,
      image: p.image,
    }));
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const freeShipping = subtotal >= 60;
    const envio = freeShipping ? 0 : shippingCost;
    const total = subtotal + envio;

    const promisedAt = promisedDeliveryDate(createdAt, deliveryDays);

    // Reparto de estados: 78 % entregado, 7 % cancelado, resto en curso.
    let status: string;
    let deliveredAt: Date | null = null;
    let shippedAt: Date | null = null;
    let cancelledAt: Date | null = null;

    if (roll < 0.78) {
      status = "entregado";
      // 85 % llega dentro del plazo; el resto se retrasa entre 1 y 4 días.
      const onTime = chance(0.85);
      const base = promisedAt.getTime();
      deliveredAt = onTime
        ? new Date(base - randInt(0, 2) * DAY)
        : new Date(base + randInt(1, 4) * DAY);
      if (deliveredAt < createdAt) deliveredAt = new Date(createdAt.getTime() + DAY);
      shippedAt = new Date(deliveredAt.getTime() - randInt(1, 2) * DAY);
      if (shippedAt < createdAt) shippedAt = new Date(createdAt.getTime() + 3600_000);
    } else if (roll < 0.85) {
      status = "cancelado";
      cancelledAt = new Date(createdAt.getTime() + randInt(1, 2) * DAY);
    } else if (roll < 0.92) {
      status = "enviado";
      shippedAt = new Date(createdAt.getTime() + DAY);
    } else {
      status = pick(["confirmado", "preparando"]);
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: `DEMO-${Date.now().toString(36).toUpperCase()}-${i}`,
        customerId: customer.id,
        subtotal,
        discount: 0,
        shippingCost: envio,
        total,
        paymentMethod: pick(["mercadopago", "transfer"]),
        paymentStatus: status === "cancelado" ? "reembolsado" : "pagado",
        status,
        createdAt,
        promisedAt,
        shippedAt,
        deliveredAt,
        cancelledAt,
        isDemo: true,
        items: { create: items },
      },
      select: { id: true },
    });
    creados++;

    if (status === "entregado" && deliveredAt) {
      entregados.push({
        id: order.id,
        customerId: customer.id,
        slugs: items.map((it) => it.productSlug),
        when: deliveredAt,
      });
    }
  }
  console.log(`${creados} pedidos de ejemplo (${entregados.length} entregados).`);

  // 4. Devoluciones sobre una parte de los entregados (~8 %).
  let devoluciones = 0;
  for (const e of entregados) {
    if (!chance(0.08)) continue;
    const createdAt = new Date(e.when.getTime() + randInt(1, 5) * DAY);
    if (createdAt > new Date()) continue;

    // La mayoría ya está resuelta; alguna queda pendiente para que se vea el
    // flujo completo en el panel.
    const resuelta = chance(0.8);
    const status = resuelta
      ? pick(["reembolsada", "reembolsada", "rechazada"])
      : "solicitada";
    const resolvedAt = resuelta
      ? new Date(createdAt.getTime() + randInt(1, 5) * DAY)
      : null;

    await prisma.return.create({
      data: {
        orderId: e.id,
        customerId: e.customerId,
        reason: pick(MOTIVOS),
        status,
        resolvedAt,
        createdAt,
        adminNote: resuelta ? "Caso revisado con el lote de producción." : null,
      },
    });
    devoluciones++;
  }
  console.log(`${devoluciones} devoluciones de ejemplo.`);

  // 5. Reseñas de pedidos entregados (~55 %), con nota alta pero no perfecta.
  let resenas = 0;
  for (const e of entregados) {
    if (!chance(0.55)) continue;
    const slug = pick(e.slugs);
    const existe = await prisma.review.findFirst({
      where: { orderId: e.id, productSlug: slug },
    });
    if (existe) continue;
    await prisma.review.create({
      data: {
        orderId: e.id,
        customerId: e.customerId,
        productSlug: slug,
        rating: chance(0.75) ? 5 : chance(0.7) ? 4 : 3,
        comment: chance(0.8) ? pick(COMENTARIOS) : null,
        createdAt: new Date(e.when.getTime() + randInt(1, 7) * DAY),
      },
    });
    resenas++;
  }
  console.log(`${resenas} reseñas de ejemplo.`);
  console.log("\nListo. Para deshacerlo: npx tsx prisma/seed-demo.ts --wipe");
}

const main = process.argv.includes("--wipe") ? wipe : seed;
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
