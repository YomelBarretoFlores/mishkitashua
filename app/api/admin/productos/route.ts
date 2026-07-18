import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { slugify } from "@/app/lib/slugify";

const CATEGORIES = ["alfajores", "manjares"];

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  return [];
}

// GET: todos los productos (activos + archivados), para el admin.
export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;
  const products = await prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const b = await request.json();

    const name = String(b.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });
    if (!CATEGORIES.includes(b.category)) {
      return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
    }
    const price = Number(b.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }

    const slug = (b.slug ? slugify(String(b.slug)) : slugify(name)) || `producto-${Date.now()}`;

    // sortOrder: al final del catálogo.
    const last = await prisma.product.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const product = await prisma.product.create({
      data: {
        slug,
        name,
        subtitle: String(b.subtitle ?? "").trim(),
        category: b.category,
        price,
        weight: String(b.weight ?? "").trim(),
        description: String(b.description ?? "").trim(),
        longDescription: String(b.longDescription ?? "").trim(),
        ingredients: toStringArray(b.ingredients),
        allergens: b.allergens ? String(b.allergens).trim() : null,
        features: toStringArray(b.features),
        image: String(b.image ?? "").trim(),
        images: toStringArray(b.images),
        color: String(b.color ?? "#3e2723").trim(),
        customizable: !!b.customizable,
        flavorOptions: toStringArray(b.flavorOptions),
        boxSize: b.boxSize ? Number(b.boxSize) : null,
        active: b.active === undefined ? true : !!b.active,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un producto con ese slug" }, { status: 409 });
    }
    console.error("[admin/productos POST]", error);
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const b = await request.json();
    const id = String(b.id ?? "");
    if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

    // Solo se actualizan los campos presentes en el cuerpo.
    const data: Prisma.ProductUpdateInput = {};
    if (b.name !== undefined) data.name = String(b.name).trim();
    if (b.subtitle !== undefined) data.subtitle = String(b.subtitle).trim();
    if (b.category !== undefined) {
      if (!CATEGORIES.includes(b.category)) {
        return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
      }
      data.category = b.category;
    }
    if (b.price !== undefined) {
      const price = Number(b.price);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
      }
      data.price = price;
    }
    if (b.weight !== undefined) data.weight = String(b.weight).trim();
    if (b.description !== undefined) data.description = String(b.description).trim();
    if (b.longDescription !== undefined) data.longDescription = String(b.longDescription).trim();
    if (b.ingredients !== undefined) data.ingredients = toStringArray(b.ingredients);
    if (b.allergens !== undefined) data.allergens = b.allergens ? String(b.allergens).trim() : null;
    if (b.features !== undefined) data.features = toStringArray(b.features);
    if (b.image !== undefined) data.image = String(b.image).trim();
    if (b.images !== undefined) data.images = toStringArray(b.images);
    if (b.color !== undefined) data.color = String(b.color).trim();
    if (b.customizable !== undefined) data.customizable = !!b.customizable;
    if (b.flavorOptions !== undefined) data.flavorOptions = toStringArray(b.flavorOptions);
    if (b.boxSize !== undefined) data.boxSize = b.boxSize ? Number(b.boxSize) : null;
    if (b.active !== undefined) data.active = !!b.active;

    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json(product);
  } catch (error) {
    console.error("[admin/productos PATCH]", error);
    return NextResponse.json({ error: "Error al actualizar el producto" }, { status: 500 });
  }
}

// DELETE = archivar (soft delete): el productSlug se referencia sin FK en
// Promotion/Review/AnalyticsEvent, así que borrar de verdad dejaría referencias
// colgando. Archivar lo saca del storefront sin romper nada histórico.
export async function DELETE(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/productos DELETE]", error);
    return NextResponse.json({ error: "Error al archivar el producto" }, { status: 500 });
  }
}
