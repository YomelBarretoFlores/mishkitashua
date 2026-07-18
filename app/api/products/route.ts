import { NextResponse } from "next/server";
import { getAllProducts } from "@/app/lib/products";

// Catálogo público (solo activos). Lo consumen componentes cliente que no
// pueden llamar a Prisma directamente (chatbot, selects del admin, etc.).
export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
