import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Promociones activas y vigentes (públicas), para mostrar en el front.
export async function GET() {
  const now = new Date();
  const promotions = await prisma.promotion.findMany({
    where: {
      active: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    orderBy: { endsAt: "asc" },
  });

  return NextResponse.json(promotions, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
