import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyUnsubscribeToken } from "@/app/lib/unsubscribe";

// Baja en un clic. Gmail y Yahoo llaman aquí por POST cuando el usuario pulsa
// "Cancelar suscripción" en la propia bandeja, sin abrir el correo (RFC 8058).
// La página /baja hace lo mismo para quien sigue el enlace a mano.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("c") ?? "";
  const token = searchParams.get("t") ?? "";

  if (!customerId || !token || !verifyUnsubscribeToken(customerId, token)) {
    return NextResponse.json({ error: "Enlace inválido" }, { status: 400 });
  }

  await prisma.customer.updateMany({
    where: { id: customerId },
    data: { marketingOptIn: false },
  });

  return NextResponse.json({ ok: true });
}
