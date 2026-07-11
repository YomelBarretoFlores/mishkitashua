import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Promociones activas y vigentes (públicas), para mostrar en el front.
// Si la BD está despertando (Neon scale-to-zero), degrada a lista vacía en vez
// de 500 para no romper el banner/chatbot del front.
export async function GET() {
  try {
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
  } catch (err) {
    console.error("[promotions] BD no disponible, devuelvo []:", err);
    return NextResponse.json([]);
  }
}
