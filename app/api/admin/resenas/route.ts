import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";

// Listado de reseñas para el admin, con filtros por producto, estrellas y
// fecha, más orden y paginación. Sigue el patrón de /api/admin/orders.
export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const productSlug = searchParams.get("productSlug") || "";
    const ratingParam = searchParams.get("rating") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const sort = searchParams.get("sort") || "recientes";

    const where: Record<string, unknown> = {};
    if (productSlug) where.productSlug = productSlug;

    const rating = Number(ratingParam);
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      where.rating = rating;
    }

    if (from || to) {
      const createdAt: Record<string, Date> = {};
      if (from) createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        createdAt.lte = toDate;
      }
      where.createdAt = createdAt;
    }

    const orderBy =
      sort === "mejor"
        ? [{ rating: "desc" as const }, { createdAt: "desc" as const }]
        : sort === "peor"
          ? [{ rating: "asc" as const }, { createdAt: "desc" as const }]
          : [{ createdAt: "desc" as const }];

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: { select: { name: true } },
          order: { select: { orderNumber: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener reseñas" },
      { status: 500 }
    );
  }
}
