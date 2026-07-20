import { randomBytes } from "node:crypto";
import { prisma } from "@/app/lib/prisma";

export const BIRTHDAY_DISCOUNT = 15; // %
export const BIRTHDAY_VALID_DAYS = 7;

export type CouponCheck =
  | { ok: true; code: string; type: "percent" | "free_shipping"; value: number; label: string }
  | { ok: false; error: string };

// Código legible pero no adivinable: sin un valor aleatorio, cualquiera podría
// deducir el cupón de otra persona a partir de su correo.
function newCode(prefix: string): string {
  const rand = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `${prefix}-${rand}`;
}

export async function issueBirthdayCoupon(customerId: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + BIRTHDAY_VALID_DAYS);

  // Si ya tiene uno de cumpleaños vigente y sin usar, se reutiliza: pulsar dos
  // veces "Enviar ahora" no debe repartir cupones extra.
  const existing = await prisma.coupon.findFirst({
    where: {
      customerId,
      reason: "cumpleanos",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existing) return existing.code;

  const coupon = await prisma.coupon.create({
    data: {
      code: newCode("CUMPLE"),
      type: "percent",
      value: BIRTHDAY_DISCOUNT,
      customerId,
      reason: "cumpleanos",
      expiresAt,
    },
  });
  return coupon.code;
}

// Valida un código para un cliente concreto. Se usa tanto al escribirlo en el
// checkout como al crear el pedido: el cliente puede manipular lo que envía,
// así que el servidor vuelve a comprobarlo antes de cobrar.
export async function checkCoupon(
  code: string,
  customerId: string | null
): Promise<CouponCheck> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { ok: false, error: "Escribe un código" };

  const coupon = await prisma.coupon.findUnique({ where: { code: clean } });
  if (!coupon) return { ok: false, error: "Ese código no existe" };

  // Un cupón es nominal: sin sesión no se puede comprobar de quién es.
  if (!customerId || coupon.customerId !== customerId) {
    return { ok: false, error: "Ese código no es tuyo" };
  }
  if (coupon.usedAt) return { ok: false, error: "Ese código ya se usó" };
  if (coupon.expiresAt < new Date()) {
    return { ok: false, error: "Ese código ya venció" };
  }

  const type = coupon.type === "free_shipping" ? "free_shipping" : "percent";
  const value = coupon.value ?? 0;
  return {
    ok: true,
    code: coupon.code,
    type,
    value,
    label: type === "free_shipping" ? "Envío gratis" : `${value}% de descuento`,
  };
}

// Marca el cupón como canjeado. La condición usedAt:null en el update evita que
// dos pedidos simultáneos lo gasten dos veces.
export async function redeemCoupon(
  code: string,
  customerId: string,
  orderId: string
): Promise<boolean> {
  const res = await prisma.coupon.updateMany({
    // También se revalida la caducidad: entre que se valida en el checkout y
    // se confirma el pago (Mercado Pago puede tardar) el cupón pudo vencer.
    where: {
      code: code.trim().toUpperCase(),
      customerId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date(), orderId },
  });
  return res.count === 1;
}

// Cupones que el cliente puede usar ahora mismo. Existe porque el código solo
// viajaba por correo: si ese correo se perdía o caía en spam, el regalo era
// irrecuperable aunque estuviera emitido en la base.
export async function getActiveCoupons(customerId: string) {
  return prisma.coupon.findMany({
    where: { customerId, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "asc" },
    select: { code: true, type: true, value: true, expiresAt: true },
  });
}
