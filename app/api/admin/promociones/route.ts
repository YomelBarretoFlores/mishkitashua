import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const VALID_TYPES = [
  "flash_discount",
  "buy_x_get_y",
  "free_gift",
  "free_shipping",
];

export async function GET() {
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(promotions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      type,
      value,
      productSlug,
      minPurchase,
      giftDescription,
      startsAt,
      endsAt,
      active,
    } = body;

    if (!title?.trim() || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Título y tipo válido son obligatorios" },
        { status: 400 }
      );
    }
    if (!startsAt || !endsAt || new Date(startsAt) > new Date(endsAt)) {
      return NextResponse.json(
        { error: "Rango de fechas inválido" },
        { status: 400 }
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        type,
        value: value != null ? Number(value) : null,
        productSlug: productSlug || null,
        minPurchase: minPurchase != null ? Number(minPurchase) : null,
        giftDescription: giftDescription?.trim() || null,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        active: active ?? true,
      },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Promotion create error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...fields } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Falta el id" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (fields.active !== undefined) data.active = fields.active;
    if (fields.title !== undefined) data.title = fields.title.trim();
    if (fields.description !== undefined)
      data.description = fields.description?.trim() || null;
    if (fields.value !== undefined)
      data.value = fields.value != null ? Number(fields.value) : null;
    if (fields.minPurchase !== undefined)
      data.minPurchase =
        fields.minPurchase != null ? Number(fields.minPurchase) : null;
    if (fields.giftDescription !== undefined)
      data.giftDescription = fields.giftDescription?.trim() || null;
    if (fields.productSlug !== undefined)
      data.productSlug = fields.productSlug || null;
    if (fields.startsAt !== undefined) data.startsAt = new Date(fields.startsAt);
    if (fields.endsAt !== undefined) data.endsAt = new Date(fields.endsAt);

    const promotion = await prisma.promotion.update({ where: { id }, data });
    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Promotion update error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Falta el id" }, { status: 400 });
    }
    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Promotion delete error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
