import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { STOCK_REASONS } from "@/app/lib/stock";

// GET: últimos movimientos de stock (opcionalmente de un producto).
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  const movements = await prisma.stockMovement.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { product: { select: { name: true } } },
  });

  return NextResponse.json(movements);
}

const schema = z.object({
  productId: z.string().min(1).max(60),
  // Negativo = salida (venta manual), positivo = entrada (reposición).
  delta: z.number().int().refine((n) => n !== 0, "El movimiento no puede ser 0"),
  reason: z.enum(["venta_manual", "reposicion", "ajuste", "devolucion"]),
  note: z.string().trim().max(200).optional().nullable(),
});

// POST: registra un movimiento manual y ajusta el stock en la misma operación.
// Se usa para la venta en mano (que no pasa por la tienda) y la reposición.
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { productId, delta, reason, note } = parsed.data;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, stock: true },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }
    if (product.stock === null) {
      return NextResponse.json(
        {
          error: `${product.name} está como "bajo pedido". Ponle un stock inicial para poder registrar movimientos.`,
        },
        { status: 400 }
      );
    }
    if (product.stock + delta < 0) {
      return NextResponse.json(
        { error: `Solo quedan ${product.stock} unidades de ${product.name}` },
        { status: 409 }
      );
    }

    const [, updated] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId,
          delta,
          reason,
          note: note?.trim() || STOCK_REASONS[reason] || null,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { stock: { increment: delta } },
        select: { id: true, name: true, slug: true, stock: true },
      }),
    ]);

    // El catálogo muestra la disponibilidad, así que hay que refrescarlo.
    revalidatePath("/productos");
    revalidatePath(`/productos/${updated.slug}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/stock POST]", error);
    return NextResponse.json(
      { error: "Error al registrar el movimiento" },
      { status: 500 }
    );
  }
}
