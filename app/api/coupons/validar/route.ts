import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { checkCoupon } from "@/app/lib/coupons";
import { enforceRateLimit } from "@/app/lib/ratelimit";

const schema = z.object({ code: z.string().trim().min(1).max(40) });

// Comprueba un cupón para enseñar el descuento antes de pagar. NO lo canjea:
// eso ocurre al crear el pedido, y allí se vuelve a validar. Esto es solo para
// la vista, así que nunca decide el precio.
export async function POST(request: Request) {
  // Sin límite, este endpoint permitiría probar códigos a lo bruto.
  const limited = enforceRateLimit(request, "coupon-check", 10, 60_000);
  if (limited) return limited;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Inicia sesión para usar un cupón" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Escribe un código" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  const result = await checkCoupon(parsed.data.code, customer?.id ?? null);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 200 });
  }
  return NextResponse.json({
    ok: true,
    code: result.code,
    label: result.label,
    type: result.type,
    value: result.value,
  });
}
