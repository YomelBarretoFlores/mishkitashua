import type { Metadata } from "next";
import { Suspense } from "react";
import SeguimientoContent from "./_components/seguimiento-content";

export const metadata: Metadata = {
  title: "Seguimiento de Pedido",
  description:
    "Consulta el estado de tu pedido Mishkitashua. Ingresa tu número de orden para ver el progreso de tu envío.",
};

export default function SeguimientoPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-5 py-24 text-center text-on-surface-variant">
          Cargando...
        </div>
      }
    >
      <SeguimientoContent />
    </Suspense>
  );
}
