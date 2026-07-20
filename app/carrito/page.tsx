import type { Metadata } from "next";
import CarritoContent from "./_components/carrito-content";
import { getSiteSettings } from "@/app/lib/settings";

export const metadata: Metadata = {
  title: "Tu Selección",
  description:
    "Revisa los productos artesanales que has elegido antes de continuar con tu pedido.",
  robots: { index: false, follow: false },
};

// Los ajustes se leen en el servidor y bajan como prop: con un fetch desde el
// cliente el usuario veía S/ 12 durante un instante (o de forma permanente si
// la llamada fallaba), aunque el costo de envío configurado fuera otro.
// Se revalida cada 5 min y, además, al guardar la configuración (ver
// /api/admin/configuracion). Sin esto la página quedaría estática y mostraría
// para siempre el costo de envío que hubiera en el momento del build.
export const revalidate = 300;

export default async function CarritoPage() {
  const settings = await getSiteSettings();
  return <CarritoContent settings={settings} />;
}
