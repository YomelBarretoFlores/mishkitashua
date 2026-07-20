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

// Transiciones permitidas. "rechazada" y "reembolsada" son finales: sin esto,
// el admin podía reembolsar una devolución ya rechazada, o marcar dos veces
// "reembolsada" y reenviarle el correo al cliente cada vez.
const ALLOWED: Record<ReturnStatus, ReturnStatus[]> = {
  solicitada: ["aprobada", "rechazada"],
  aprobada: ["reembolsada", "rechazada"],
  rechazada: [],
  reembolsada: [],
};

export function canTransition(from: string, to: ReturnStatus): boolean {
  const allowed = ALLOWED[from as ReturnStatus];
  return !!allowed && allowed.includes(to);
}

// ¿Sigue dentro del plazo para devolver, contando desde la fecha del pedido?
export function withinReturnWindow(orderDate: Date): boolean {
  const limit = RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - orderDate.getTime() <= limit;
}

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
