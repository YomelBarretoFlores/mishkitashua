import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";

const VALID_STATUSES = ["confirmado", "preparando", "enviado", "entregado"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar el estado" },
      { status: 500 }
    );
  }
}
