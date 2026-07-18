// Ventana para solicitar una devolución tras la entrega (días).
export const RETURN_WINDOW_DAYS = 7;

// Estados de una devolución, compartidos entre cliente y admin.
export const RETURN_STATUSES = [
  "solicitada",
  "aprobada",
  "rechazada",
  "reembolsada",
] as const;

export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export function returnStatusLabel(status: string): string {
  switch (status) {
    case "solicitada":
      return "Solicitada";
    case "aprobada":
      return "Aprobada";
    case "rechazada":
      return "Rechazada";
    case "reembolsada":
      return "Reembolsada";
    default:
      return status;
  }
}

export function returnBadgeClasses(status: string): string {
  switch (status) {
    case "reembolsada":
      return "bg-green-100 text-green-700";
    case "aprobada":
      return "bg-blue-100 text-blue-700";
    case "rechazada":
      return "bg-red-100 text-red-700";
    default: // solicitada
      return "bg-amber-100 text-amber-700";
  }
}
