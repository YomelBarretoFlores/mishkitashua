import { NextResponse } from "next/server";
import { getSiteSettings } from "@/app/lib/settings";

// Configuración pública para los displays del cliente (carrito, checkout).
// El precio que se cobra lo recalcula el servidor; esto es solo para mostrar.
export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
