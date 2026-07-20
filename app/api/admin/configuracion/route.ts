import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { getSiteSettings } from "@/app/lib/settings";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;
  return NextResponse.json(await getSiteSettings());
}

export async function PUT(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const b = await request.json();
    const shippingCost = Number(b.shippingCost);
    if (!Number.isFinite(shippingCost) || shippingCost < 0) {
      return NextResponse.json({ error: "Costo de envío inválido" }, { status: 400 });
    }
    let freeShippingThreshold: number | null = null;
    if (b.freeShippingThreshold !== null && b.freeShippingThreshold !== "" && b.freeShippingThreshold !== undefined) {
      const t = Number(b.freeShippingThreshold);
      if (!Number.isFinite(t) || t < 0) {
        return NextResponse.json({ error: "Umbral inválido" }, { status: 400 });
      }
      freeShippingThreshold = t;
    }

    const row = await prisma.siteSetting.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", shippingCost, freeShippingThreshold },
      update: { shippingCost, freeShippingThreshold },
    });
    // El carrito muestra el costo de envío desde el servidor, así que hay que
    // refrescarlo para que el cambio se vea de inmediato y no en 5 minutos.
    revalidatePath("/carrito");

    return NextResponse.json({
      shippingCost: row.shippingCost,
      freeShippingThreshold: row.freeShippingThreshold,
    });
  } catch (error) {
    console.error("[admin/configuracion PUT]", error);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
