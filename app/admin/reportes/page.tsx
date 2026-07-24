"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Star,
  Download,
  Tag,
  RotateCcw,
  X,
  AlertTriangle,
} from "lucide-react";
import DateRangeFilter from "@/app/admin/_components/date-range-filter";
import IndicatorCard from "@/app/admin/_components/indicator-card";
import { meetsTarget, type IndicatorReport } from "@/app/lib/kpi";

type Report = {
  month: string;
  months: string[];
  totalOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  avgTicket: number;
  newCustomers: number;
  reviewAvg: number;
  reviewCount: number;
  topProducts: { productName: string; quantity: number; revenue: number }[];
  indicators?: IndicatorReport;
  period?: { label: string; from: string; to: string; usingRange: boolean };
  returns?: {
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    reembolsadas: number;
    montoReembolsado: number;
  };
};

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  });
}

export default function ReportesPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [month, setMonth] = useState<string>("");
  // Rango libre de fechas. Mientras esté puesto, manda sobre el selector de mes.
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (from || to) {
      if (from) params.set("from", from);
      if (to) params.set("to", to);
    } else if (month) {
      params.set("month", month);
    }
    const q = params.toString();
    fetch(`/api/admin/reportes${q ? `?${q}` : ""}`)
      .then((r) => r.json())
      .then((data: Report) => {
        setReport(data);
        if (!month && data.month) setMonth(data.month);
      })
      .catch(() => {});
  }, [month, from, to]);

  // Hay rango libre en cuanto se pone cualquiera de los dos extremos.
  const usingRange = from !== "" || to !== "";

  const exportCsv = () => {
    if (!report) return;
    const rows: string[][] = [
      ["Reporte", report.period?.label ?? monthLabel(report.month)],
      [],
      ["Métrica", "Valor"],
      ["Pedidos", String(report.totalOrders)],
      ["Ingresos (S/)", report.totalRevenue.toFixed(2)],
      ["Descuentos (S/)", report.totalDiscount.toFixed(2)],
      ["Ticket promedio (S/)", report.avgTicket.toFixed(2)],
      ["Clientes nuevos", String(report.newCustomers)],
      ["Rating promedio", report.reviewAvg.toFixed(1)],
      ["Reseñas", String(report.reviewCount)],
      ["Devoluciones solicitadas", String(report.returns?.total ?? 0)],
      ["Devoluciones sin resolver", String(report.returns?.pendientes ?? 0)],
      ["Devoluciones aprobadas", String(report.returns?.aprobadas ?? 0)],
      ["Devoluciones rechazadas", String(report.returns?.rechazadas ?? 0)],
      ["Devoluciones reembolsadas", String(report.returns?.reembolsadas ?? 0)],
      ["Monto reembolsado (S/)", (report.returns?.montoReembolsado ?? 0).toFixed(2)],
      [],
      ["Producto", "Cantidad", "Ingreso (S/)"],
      ...report.topProducts.map((p) => [
        p.productName,
        String(p.quantity),
        p.revenue.toFixed(2),
      ]),
      [],
      // Los indicadores se exportan con su fórmula y sus datos base, para que
      // el CSV coincida con lo que se ve en pantalla y se pueda comprobar.
      [
        "Indicador",
        "Valor",
        "Meta",
        "Cumple",
        "Formula",
        "Numerador",
        "Denominador",
        "Fuente",
        "Exclusiones",
      ],
      ...(report.indicators?.indicators ?? []).map((i) => {
        const ok = meetsTarget(i);
        return [
          i.label,
          i.value === null ? "sin datos" : `${i.value}${i.unit === "%" ? "%" : ` ${i.unit}`}`,
          `${i.targetDirection === "gte" ? ">=" : "<="} ${i.target}`,
          ok === null ? "sin datos" : ok ? "si" : "no",
          i.formula,
          `${i.numerator.label}: ${i.numerator.value}`,
          `${i.denominator.label}: ${i.denominator.value}`,
          i.source,
          i.exclusions,
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${report.month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpis = report
    ? [
        {
          label: "Ingresos",
          value: `S/ ${report.totalRevenue.toFixed(2)}`,
          icon: TrendingUp,
        },
        {
          label: "Pedidos",
          value: String(report.totalOrders),
          icon: ShoppingBag,
        },
        {
          label: "Ticket promedio",
          value: `S/ ${report.avgTicket.toFixed(2)}`,
          icon: TrendingUp,
        },
        {
          label: "Clientes nuevos",
          value: String(report.newCustomers),
          icon: Users,
        },
        {
          label: "Descuentos",
          value: `S/ ${report.totalDiscount.toFixed(2)}`,
          icon: Tag,
        },
        {
          label: "Rating promedio",
          value: `${report.reviewAvg.toFixed(1)} (${report.reviewCount})`,
          icon: Star,
        },
        {
          label: "Devoluciones",
          value: report.returns
            ? `${report.returns.total}${
                report.returns.pendientes > 0
                  ? ` (${report.returns.pendientes} sin resolver)`
                  : ""
              }`
            : "0",
          icon: RotateCcw,
        },
        {
          label: "Reembolsado",
          value: `S/ ${(report.returns?.montoReembolsado ?? 0).toFixed(2)}`,
          icon: RotateCcw,
        },
      ]
    : [];

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
        <div>
          <h1
            className="text-xl sm:text-2xl font-medium text-cocoa-deep"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Reportes e indicadores
          </h1>
          {report?.period && (
            <p className="text-sm text-on-surface-variant mt-0.5">
              Periodo: {report.period.label}
            </p>
          )}
        </div>
        <button
          onClick={exportCsv}
          disabled={!report}
          className="flex items-center gap-2 bg-cocoa text-white font-semibold px-4 py-2 rounded-lg hover:bg-cocoa-deep transition-colors disabled:opacity-50 text-sm"
        >
          <Download size={16} />
          Exportar CSV
        </button>
      </div>

      {/* Periodo: por mes completo o por rango de fechas libre. El rango manda
          sobre el mes mientras esté puesto, y se puede vaciar para volver. */}
      <div className="bg-white rounded-2xl border border-cream-darker/60 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-on-surface-variant mb-1">
              Mes
            </span>
            <select
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setFrom("");
                setTo("");
              }}
              disabled={usingRange}
              className="w-full px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa disabled:opacity-50"
            >
              {report?.months?.length ? (
                report.months.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m)}
                  </option>
                ))
              ) : (
                <option value={month}>{month && monthLabel(month)}</option>
              )}
            </select>
          </label>
          <DateRangeFilter
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
            labelFrom="Desde (rango libre)"
            labelTo="Hasta"
          />
        </div>
        {usingRange && (
          <button
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cocoa hover:text-caramel transition-colors"
          >
            <X size={13} />
            Volver a ver por mes
          </button>
        )}
      </div>

      {!report ? (
        <p className="text-taupe text-center py-12">Cargando reporte...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white rounded-2xl border border-cream-darker/60 p-5"
              >
                <div className="flex items-center gap-2 text-taupe mb-2">
                  <kpi.icon size={16} />
                  <span className="text-xs uppercase tracking-wide">
                    {kpi.label}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-cocoa-deep">
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          {/* Indicadores logísticos y de servicio, cada uno con su meta */}
          {report.indicators && (
            <section className="mb-8">
              <div className="flex items-baseline justify-between gap-4 flex-wrap mb-4">
                <h2 className="font-semibold text-cocoa-deep">
                  Indicadores logísticos y de servicio
                </h2>
                <p className="text-xs text-taupe">
                  {(() => {
                    const list = report.indicators.indicators;
                    const enMeta = list.filter(
                      (i) => meetsTarget(i) === true
                    ).length;
                    const fuera = list.filter(
                      (i) => meetsTarget(i) === false
                    ).length;
                    return `${enMeta} en meta · ${fuera} fuera · actualizado ${new Date(
                      report.indicators.generatedAt
                    ).toLocaleString("es-PE", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`;
                  })()}
                </p>
              </div>
              {/* El resto del panel excluye los datos de demostración. Estos
                  indicadores no pueden: los pedidos reales aún no registran
                  fechas de promesa ni de entrega, así que sin el histórico
                  ficticio saldrían todos vacíos. Se avisa para que nadie tome
                  una decisión creyendo que mide el negocio real. */}
              {report.indicators.demoOrders > 0 && (
                <div className="mb-4 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 flex gap-3">
                  <AlertTriangle
                    size={16}
                    className="text-amber-700 shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Incluye datos de demostración.</strong>{" "}
                    {report.indicators.demoOrders} de los pedidos de este periodo
                    son de prueba, creados para que estos indicadores tuvieran de
                    dónde calcularse. Sirven para ver cómo funcionan, no para
                    medir el negocio. Las ventas, los clientes y las reseñas del
                    resto del panel sí son solo reales.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {report.indicators.indicators.map((i) => (
                  <IndicatorCard key={i.key} indicator={i} />
                ))}
              </div>
              <p className="text-xs text-taupe mt-4 leading-relaxed">
                Periodo evaluado: {report.indicators.period.label}. Todos los
                indicadores se calculan sobre los pedidos creados en ese mes,
                salvo «Productos agotados», que es una foto del catálogo de hoy.
                Despliega «Cómo se calcula» en cada tarjeta para ver la fórmula
                y los datos exactos que se usaron.
              </p>
            </section>
          )}

          <div className="bg-white rounded-2xl border border-cream-darker/60 p-5 md:p-6">
            <h2 className="font-semibold text-cocoa-deep mb-4">
              Productos más vendidos
            </h2>
            {report.topProducts.length === 0 ? (
              <p className="text-taupe text-sm py-6 text-center">
                Sin ventas en este mes
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-taupe border-b border-cream-darker">
                      <th className="py-2 font-medium">Producto</th>
                      <th className="py-2 font-medium text-right">Cantidad</th>
                      <th className="py-2 font-medium text-right">Ingreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topProducts.map((p) => (
                      <tr
                        key={p.productName}
                        className="border-b border-cream-darker/40 last:border-0"
                      >
                        <td className="py-2.5 text-cocoa-deep">
                          {p.productName}
                        </td>
                        <td className="py-2.5 text-right text-on-surface-variant">
                          {p.quantity}
                        </td>
                        <td className="py-2.5 text-right font-medium text-cocoa-deep">
                          S/ {p.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
