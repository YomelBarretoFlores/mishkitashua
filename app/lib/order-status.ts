import { Package, ChefHat, Truck, CheckCircle, type LucideIcon } from "lucide-react";

// Metadata de estados de pedido, compartida entre "Mis pedidos" y seguimiento.
export const ORDER_STEPS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "confirmado", label: "Confirmado", icon: Package },
  { key: "preparando", label: "En preparación", icon: ChefHat },
  { key: "enviado", label: "Enviado", icon: Truck },
  { key: "entregado", label: "Entregado", icon: CheckCircle },
];

export function orderStepIndex(status: string): number {
  return ORDER_STEPS.findIndex((s) => s.key === status);
}

// Clases de color para el badge de estado.
export function statusBadgeClasses(status: string): string {
  switch (status) {
    case "entregado":
      return "bg-green-100 text-green-700";
    case "enviado":
      return "bg-blue-100 text-blue-700";
    case "preparando":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-cream-dark text-cocoa-deep";
  }
}

export function statusLabel(status: string): string {
  return ORDER_STEPS.find((s) => s.key === status)?.label ?? status;
}
