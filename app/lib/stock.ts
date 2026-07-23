// Estado de disponibilidad de un producto, derivado del stock.
//
// El control es deliberadamente simple: `stock` es un número de unidades que
// baja con cada venta. Si vale null, el producto no se controla y se prepara
// por encargo ("bajo pedido"), que es como funciona buena parte de la
// repostería artesanal.

export type Availability = "disponible" | "pocas" | "agotado" | "bajo-pedido";

// Por debajo de esta cantidad se avisa de que quedan pocas unidades. Es solo
// un aviso visual: no bloquea nada.
export const LOW_STOCK_THRESHOLD = 5;

export function availabilityOf(stock: number | null | undefined): Availability {
  if (stock === null || stock === undefined) return "bajo-pedido";
  if (stock <= 0) return "agotado";
  if (stock <= LOW_STOCK_THRESHOLD) return "pocas";
  return "disponible";
}

// ¿Se puede comprar? Solo lo impide el agotado; "bajo pedido" sí se vende.
export function isPurchasable(stock: number | null | undefined): boolean {
  return availabilityOf(stock) !== "agotado";
}

export function availabilityLabel(
  a: Availability,
  stock?: number | null
): string {
  switch (a) {
    case "agotado":
      return "Agotado";
    case "bajo-pedido":
      return "Bajo pedido";
    case "pocas":
      return stock != null ? `Últimas ${stock} unidades` : "Pocas unidades";
    default:
      return "Disponible";
  }
}

export function availabilityClasses(a: Availability): string {
  switch (a) {
    case "agotado":
      return "bg-red-100 text-red-700";
    case "bajo-pedido":
      return "bg-blue-100 text-blue-700";
    case "pocas":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-green-100 text-green-700";
  }
}

// Motivos de movimiento de stock, con su etiqueta para el panel.
export const STOCK_REASONS: Record<string, string> = {
  venta_web: "Venta en la tienda",
  venta_manual: "Venta manual",
  reposicion: "Reposición",
  ajuste: "Ajuste de inventario",
  devolucion: "Devolución al stock",
};
