import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isFirstPurchaseForUser } from "@/app/lib/orders";

// ¿El usuario logueado califica para el envío gratis de bienvenida (0 pedidos)?
export async function GET() {
  const { userId } = await auth();
  const eligible = await isFirstPurchaseForUser(userId);
  return NextResponse.json({ eligible });
}
