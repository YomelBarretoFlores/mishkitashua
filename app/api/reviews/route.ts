import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productSlug = searchParams.get("productSlug");

  const where = productSlug ? { productSlug } : undefined;

  // Promedio/total sobre TODAS las reseñas; la lista se limita a 50.
  const [agg, reviews] = await Promise.all([
    prisma.review.aggregate({ where, _avg: { rating: true }, _count: true }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
  try {
    const { orderId, productSlug, rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La calificación debe estar entre 1 y 5" },
        { status: 400 }
      );
    }

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

    const existing = await prisma.review.findUnique({
      where: {
        orderId_productSlug: { orderId, productSlug: productSlug ?? null },
      },
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
