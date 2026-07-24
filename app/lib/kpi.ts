import { prisma } from "@/app/lib/prisma";

// Indicadores logísticos y de servicio.
//
// Cada indicador se publica junto con su fórmula, el numerador y el denominador
// que realmente se usaron, la fuente de los datos, las exclusiones aplicadas y
// su meta. La razón es simple: un porcentaje suelto no se puede auditar. Si el
// OTIF sale 41 %, hay que poder ver que son "7 de 17 pedidos" y de dónde salen
// esos 17.

export type IndicatorUnit = "%" | "días" | "estrellas";

export type Indicator = {
  key: string;
  category: "Distribución" | "Inventario" | "Servicio" | "Postventa";
  label: string;
  value: number | null; // null = no hay datos suficientes en el periodo
  unit: IndicatorUnit;
  target: number;
  // Si la meta es un mínimo (OTIF ≥ 90) o un máximo (devoluciones ≤ 5).
  targetDirection: "gte" | "lte";
  formula: string;
  numerator: { label: string; value: number };
  denominator: { label: string; value: number };
  source: string;
  exclusions: string;
  interpretation: string;
};

export type IndicatorReport = {
  period: { from: string; to: string; label: string };
  generatedAt: string;
  indicators: Indicator[];
  /**
   * Cuántos de los pedidos del periodo son de demostración.
   *
   * A diferencia del resto del panel, aquí SÍ se incluyen: los pedidos reales
   * todavía no llevan promisedAt/shippedAt/deliveredAt, así que sin ellos los
   * nueve indicadores saldrían todos vacíos. Pero el número se devuelve para
   * poder avisarlo en pantalla: un indicador calculado sobre datos inventados
   * no debe leerse como una medición del negocio.
   */
  demoOrders: number;
};

function pct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ¿El indicador cumple su meta? Un indicador sin datos no se cuenta como fallo.
export function meetsTarget(i: Indicator): boolean | null {
  if (i.value === null) return null;
  return i.targetDirection === "gte" ? i.value >= i.target : i.value <= i.target;
}

const DAY_MS = 86_400_000;

export async function buildIndicatorReport(
  from: Date,
  to: Date,
  periodLabel: string
): Promise<IndicatorReport> {
  const range = { gte: from, lt: to };

  const [orders, returns, reviews] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: range },
      select: {
        id: true,
        isDemo: true,
        status: true,
        createdAt: true,
        promisedAt: true,
        deliveredAt: true,
        cancelledAt: true,
        items: { select: { quantity: true } },
        returns: { select: { status: true } },
      },
    }),
    prisma.return.findMany({
      where: { createdAt: range },
      select: { status: true, createdAt: true, resolvedAt: true },
    }),
    prisma.review.aggregate({
      where: { createdAt: range },
      _avg: { rating: true },
      _sum: { rating: true },
      _count: true,
    }),
  ]);

  const now = new Date();
  const cancelled = orders.filter((o) => o.status === "cancelado");
  const delivered = orders.filter((o) => o.status === "entregado");
  // "Debían estar entregados": se excluyen los cancelados y también los que
  // todavía están dentro de su plazo. Un pedido de ayer que se prometió para
  // mañana no es un incumplimiento: contarlo como tal hundiría el indicador
  // solo por tener pedidos recientes en curso.
  const deliverable = orders.filter(
    (o) =>
      o.status !== "cancelado" &&
      (o.status === "entregado" || !o.promisedAt || o.promisedAt <= now)
  );

  const unitsOf = (list: typeof orders) =>
    list.reduce(
      (acc, o) => acc + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

  // ── OTIF ──────────────────────────────────────────────────────────────
  // Solo entran los pedidos entregados que tienen fecha comprometida y fecha
  // real de entrega: sin ambas no se puede decir si llegó a tiempo. Los pedidos
  // anteriores a que se registraran esas fechas quedan fuera del cálculo.
  const otifBase = delivered.filter((o) => o.promisedAt && o.deliveredAt);
  const otifOk = otifBase.filter(
    (o) =>
      o.deliveredAt! <= o.promisedAt! &&
      // "Completo" = sin devolución aceptada. Si hubo que devolver algo, el
      // pedido no llegó completo y en condiciones.
      !o.returns.some((r) => r.status === "aprobada" || r.status === "reembolsada")
  );

  // ── Fill rate ─────────────────────────────────────────────────────────
  const unitsRequested = unitsOf(deliverable);
  const unitsDelivered = unitsOf(delivered);

  // ── Tiempo de ciclo ───────────────────────────────────────────────────
  const cycleBase = delivered.filter((o) => o.deliveredAt);
  const cycleDays = cycleBase.map(
    (o) => (o.deliveredAt!.getTime() - o.createdAt.getTime()) / DAY_MS
  );
  const avgCycle =
    cycleDays.length > 0
      ? cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length
      : null;

  // ── Devoluciones ──────────────────────────────────────────────────────
  const ordersWithReturn = delivered.filter((o) => o.returns.length > 0);
  const closedReturns = returns.filter(
    (r) => r.resolvedAt && r.status !== "solicitada"
  );
  const resolutionDays = closedReturns.map(
    (r) => (r.resolvedAt!.getTime() - r.createdAt.getTime()) / DAY_MS
  );
  const avgResolution =
    resolutionDays.length > 0
      ? resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length
      : null;

  const indicators: Indicator[] = [
    {
      key: "otif",
      category: "Distribución",
      label: "OTIF (a tiempo y completo)",
      value: pct(otifOk.length, otifBase.length),
      unit: "%",
      target: 90,
      targetDirection: "gte",
      formula:
        "(Pedidos entregados a tiempo y sin incidencia ÷ Pedidos entregados) × 100",
      numerator: { label: "Entregados a tiempo y completos", value: otifOk.length },
      denominator: { label: "Pedidos entregados", value: otifBase.length },
      source: "Pedidos: fecha comprometida, fecha de entrega y devoluciones",
      exclusions:
        "Pedidos cancelados y pedidos sin fecha comprometida o de entrega registrada",
      interpretation:
        "Mide la promesa cumplida de principio a fin: llegó cuando dijimos y sin que el cliente tuviera que reclamar nada.",
    },
    {
      key: "fill_rate",
      category: "Distribución",
      label: "Fill rate",
      value: pct(unitsDelivered, unitsRequested),
      unit: "%",
      target: 95,
      targetDirection: "gte",
      formula: "(Unidades entregadas ÷ Unidades solicitadas) × 100",
      numerator: { label: "Unidades entregadas", value: unitsDelivered },
      denominator: { label: "Unidades solicitadas", value: unitsRequested },
      source: "Líneas de pedido (OrderItem) de los pedidos del periodo",
      exclusions:
        "Pedidos cancelados y pedidos aún dentro de su plazo de entrega",
      interpretation:
        "De todo lo que los clientes pidieron, qué porción llegó a estar en sus manos. Si baja, es que se está pidiendo más de lo que se alcanza a producir.",
    },
    {
      key: "tiempo_ciclo",
      category: "Distribución",
      label: "Tiempo de ciclo del pedido",
      value: avgCycle === null ? null : round1(avgCycle),
      unit: "días",
      target: 3,
      targetDirection: "lte",
      formula:
        "Σ (Fecha de entrega − Fecha del pedido) ÷ Pedidos entregados",
      numerator: {
        label: "Suma de días transcurridos",
        value: round1(cycleDays.reduce((a, b) => a + b, 0)),
      },
      denominator: { label: "Pedidos entregados", value: cycleBase.length },
      source: "Pedidos: fecha de creación y fecha de entrega",
      exclusions: "Pedidos sin fecha de entrega registrada y cancelados",
      interpretation:
        "Cuánto tarda de media un pedido desde que entra hasta que el cliente lo recibe. Es el tiempo que el cliente realmente percibe.",
    },
    {
      key: "nivel_servicio",
      category: "Servicio",
      label: "Nivel de servicio",
      value: pct(delivered.length, deliverable.length),
      unit: "%",
      target: 95,
      targetDirection: "gte",
      formula: "(Pedidos entregados ÷ Pedidos a entregar) × 100",
      numerator: { label: "Pedidos entregados", value: delivered.length },
      denominator: { label: "Pedidos a entregar", value: deliverable.length },
      source: "Estado de los pedidos del periodo",
      exclusions:
        "Pedidos cancelados y pedidos aún dentro de su plazo de entrega",
      interpretation:
        "De los pedidos que ya deberían estar entregados, cuántos lo están. Si baja, hay pedidos vencidos sin cerrar.",
    },
    {
      key: "tasa_devoluciones",
      category: "Postventa",
      label: "Tasa de devoluciones",
      value: pct(ordersWithReturn.length, delivered.length),
      unit: "%",
      target: 5,
      targetDirection: "lte",
      formula: "(Pedidos con devolución ÷ Pedidos entregados) × 100",
      numerator: {
        label: "Pedidos con devolución",
        value: ordersWithReturn.length,
      },
      denominator: { label: "Pedidos entregados", value: delivered.length },
      source: "Módulo de devoluciones, cruzado con los pedidos entregados",
      exclusions: "Pedidos no entregados y cancelados",
      interpretation:
        "Cuántas entregas acaban en reclamo. Es el termómetro de la calidad del producto y del embalaje.",
    },
    {
      key: "tiempo_devoluciones",
      category: "Postventa",
      label: "Tiempo de atención de devoluciones",
      value: avgResolution === null ? null : round1(avgResolution),
      unit: "días",
      target: 3,
      targetDirection: "lte",
      formula:
        "Σ (Fecha de resolución − Fecha de solicitud) ÷ Devoluciones cerradas",
      numerator: {
        label: "Suma de días de resolución",
        value: round1(resolutionDays.reduce((a, b) => a + b, 0)),
      },
      denominator: {
        label: "Devoluciones cerradas",
        value: closedReturns.length,
      },
      source: "Devoluciones: fecha de solicitud y fecha de resolución",
      exclusions: "Devoluciones aún en estado «solicitada» (sin resolver)",
      interpretation:
        "Cuánto espera un cliente con un problema hasta tener respuesta. Es lo que más pesa en si vuelve a comprar tras una incidencia.",
    },
    {
      key: "calificacion",
      category: "Servicio",
      label: "Calificación promedio",
      value:
        reviews._count > 0 ? round1(reviews._avg.rating ?? 0) : null,
      unit: "estrellas",
      target: 4.5,
      targetDirection: "gte",
      formula: "Σ Estrellas recibidas ÷ Número de reseñas",
      numerator: {
        label: "Suma de estrellas",
        value: reviews._sum.rating ?? 0,
      },
      denominator: { label: "Reseñas", value: reviews._count },
      source: "Reseñas verificadas de clientes que compraron",
      exclusions: "Ninguna: solo pueden reseñar quienes compraron el producto",
      interpretation:
        "La nota media que ponen los clientes. Al exigir compra previa, no se puede inflar con reseñas falsas.",
    },
    {
      key: "tasa_cancelacion",
      category: "Servicio",
      label: "Tasa de cancelación",
      value: pct(cancelled.length, orders.length),
      unit: "%",
      target: 5,
      targetDirection: "lte",
      formula: "(Pedidos cancelados ÷ Total de pedidos) × 100",
      numerator: { label: "Pedidos cancelados", value: cancelled.length },
      denominator: { label: "Total de pedidos", value: orders.length },
      source: "Estado de los pedidos del periodo",
      exclusions: "Ninguna",
      interpretation:
        "Pedidos que se cayeron después de entrar. Si sube, suele apuntar a falta de stock o a problemas de cobro.",
    },
    {
      key: "quiebre_stock",
      category: "Inventario",
      label: "Productos agotados",
      value: null, // se calcula aparte: no depende del periodo, es una foto de hoy
      unit: "%",
      target: 10,
      targetDirection: "lte",
      formula: "(Productos con stock 0 ÷ Productos activos con control) × 100",
      numerator: { label: "Productos agotados", value: 0 },
      denominator: { label: "Productos con control de stock", value: 0 },
      source: "Catálogo: stock actual de cada producto activo",
      exclusions: "Productos archivados y productos «bajo pedido» (sin control)",
      interpretation:
        "Cuánto del catálogo no se puede comprar ahora mismo. A diferencia del resto, es una foto de hoy, no del periodo.",
    },
  ];

  // El quiebre de stock es del momento actual, no del periodo evaluado.
  const tracked = await prisma.product.findMany({
    where: { active: true, NOT: { stock: null } },
    select: { stock: true },
  });
  const agotados = tracked.filter((p) => (p.stock ?? 0) <= 0).length;
  const quiebre = indicators.find((i) => i.key === "quiebre_stock")!;
  quiebre.numerator.value = agotados;
  quiebre.denominator.value = tracked.length;
  quiebre.value = pct(agotados, tracked.length);

  return {
    period: {
      from: from.toISOString(),
      to: to.toISOString(),
      label: periodLabel,
    },
    generatedAt: new Date().toISOString(),
    indicators,
    demoOrders: orders.filter((o) => o.isDemo).length,
  };
}
