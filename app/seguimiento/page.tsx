import type { Metadata } from "next";
import SeguimientoContent from "./_components/seguimiento-content";

export const metadata: Metadata = {
  title: "Seguimiento de Pedido",
  description:
    "Consulta el estado de tu pedido Mishkitashua. Ingresa tu número de orden para ver el progreso de tu envío.",
};

export default function SeguimientoPage() {
  return <SeguimientoContent />;
}
