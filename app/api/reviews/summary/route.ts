import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { dePedidoReal } from "@/app/lib/demo-data";

// Devuelve rating promedio y conteo por productSlug, para mostrar en el catálogo.
export async function GET() {
  const grouped = await prisma.review.groupBy({
    by: ["productSlug"],
    where: { productSlug: { not: null }, ...dePedidoReal },
    _avg: { rating: true },
    _count: true,
  });

  const summary: Record<string, { average: number; count: number }> = {};
  for (const g of grouped) {
    if (!g.productSlug) continue;
    summary[g.productSlug] = {
      average: Math.round((g._avg.rating ?? 0) * 10) / 10,
      count: g._count,
    };
  }

  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
