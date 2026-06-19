// Motor de promociones — fuente única de verdad usada en carrito, checkout y
// servidor (creación de pedidos). Función pura: recibe líneas del carrito y las
// promociones activas, devuelve descuentos y regalos aplicados.

export type PromotionType =
  | "flash_discount" // descuento % (value = porcentaje)
  | "buy_x_get_y" // 2x1 sobre un producto (cada 2 unidades, 1 gratis)
  | "free_gift" // regalo sorpresa al superar minPurchase
  | "free_shipping"; // envío gratis al superar minPurchase

export type Promotion = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  value: number | null;
  productSlug: string | null;
  minPurchase: number | null;
  giftDescription: string | null;
  startsAt: string | Date;
  endsAt: string | Date;
  active: boolean;
};

export type CartLine = {
  slug: string;
  price: number;
  quantity: number;
};

export type AppliedPromotions = {
  subtotal: number;
  discount: number;
  freeShipping: boolean;
  gift: string | null;
  applied: { title: string; type: string; amount: number }[];
};

export function isPromotionActive(promo: Promotion, now: Date = new Date()): boolean {
  if (!promo.active) return false;
  const starts = new Date(promo.startsAt);
  const ends = new Date(promo.endsAt);
  return starts <= now && now <= ends;
}

export function applyPromotions(
  lines: CartLine[],
  promotions: Promotion[],
  now: Date = new Date()
): AppliedPromotions {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const active = promotions.filter((p) => isPromotionActive(p, now));

  let discount = 0;
  let freeShipping = false;
  let gift: string | null = null;
  const applied: { title: string; type: string; amount: number }[] = [];

  for (const promo of active) {
    let amount = 0;

    switch (promo.type as PromotionType) {
      case "flash_discount": {
        const percent = promo.value ?? 0;
        if (percent <= 0) break;
        const base = promo.productSlug
          ? lines
              .filter((l) => l.slug === promo.productSlug)
              .reduce((s, l) => s + l.price * l.quantity, 0)
          : subtotal;
        amount = (base * percent) / 100;
        break;
      }
      case "buy_x_get_y": {
        // 2x1: por cada 2 unidades del producto, 1 sale gratis.
        const target = lines.filter(
          (l) => !promo.productSlug || l.slug === promo.productSlug
        );
        for (const l of target) {
          const free = Math.floor(l.quantity / 2);
          amount += free * l.price;
        }
        break;
      }
      case "free_shipping": {
        if (subtotal >= (promo.minPurchase ?? 0)) freeShipping = true;
        break;
      }
      case "free_gift": {
        if (subtotal >= (promo.minPurchase ?? 0)) {
          gift = promo.giftDescription || promo.title;
        }
        break;
      }
    }

    if (amount > 0 || (promo.type === "free_shipping" && freeShipping) || gift) {
      applied.push({
        title: promo.title,
        type: promo.type,
        amount: Math.round(amount * 100) / 100,
      });
      discount += amount;
    }
  }

  // El descuento nunca puede superar el subtotal.
  discount = Math.min(discount, subtotal);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    freeShipping,
    gift,
    applied,
  };
}
