import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { enforceRateLimit } from "@/app/lib/ratelimit";

const reviewSchema = z.object({
  orderId: z.string().min(1).max(60),
  productSlug: z.string().max(120).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productSlug = searchParams.get("productSlug");
  const ratingParam = searchParams.get("rating"); // "1".."5"
  const sort = searchParams.get("sort"); // "recientes" | "mejor" | "peor"
  const daysParam = searchParams.get("days"); // "7" | "30" | "90" | "365"

  const where: {
    productSlug?: string;
    rating?: number;
    createdAt?: { gte: Date };
  } = {};
  if (productSlug) where.productSlug = productSlug;

  const rating = Number(ratingParam);
  if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
    where.rating = rating;
  }

  const days = Number(daysParam);
  if (Number.isInteger(days) && days > 0) {
    where.createdAt = { gte: new Date(Date.now() - days * 86_400_000) };
  }

  // El promedio/total respeta los filtros aplicados; la lista se limita a 50.
  const orderBy =
    sort === "mejor"
      ? [{ rating: "desc" as const }, { createdAt: "desc" as const }]
      : sort === "peor"
        ? [{ rating: "asc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

  const [agg, reviews] = await Promise.all([
    prisma.review.aggregate({ where, _avg: { rating: true }, _count: true }),
    prisma.review.findMany({
      where,
      orderBy,
      take: 50,
      include: { customer: { select: { name: true } } },
    }),
  ]);

  const average = agg._avg.rating ?? 0;

  return NextResponse.json(
    {
      average: Math.round(average * 10) / 10,
      count: agg._count,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        customerName: r.customer.name,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "reviews", 10, 60_000);
  if (limited) return limited;
  try {
    const parsed = reviewSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const { orderId, productSlug, rating, comment } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Si se reseña un producto, debe pertenecer al pedido
    if (productSlug && !order.items.some((i) => i.productSlug === productSlug)) {
      return NextResponse.json(
        { error: "Ese producto no pertenece a este pedido" },
        { status: 400 }
      );
    }

    const existing = await prisma.review.findFirst({
      where: { orderId, productSlug: productSlug ?? null },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya dejaste una reseña para este producto" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        customerId: order.customerId,
        productSlug: productSlug ?? null,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
