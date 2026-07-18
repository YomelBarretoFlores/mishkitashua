import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";

// Lista de devoluciones para el admin, con filtro opcional por estado.
export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const status = request.nextUrl.searchParams.get("status") || "";
    const where = status ? { status } : {};
    const returns = await prisma.return.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            paymentMethod: true,
            chargeId: true,
            customer: { select: { name: true, email: true } },
          },
        },
      },
    });
    return NextResponse.json(returns);
  } catch {
    return NextResponse.json({ error: "Error al obtener devoluciones" }, { status: 500 });
  }
}
