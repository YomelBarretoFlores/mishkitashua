"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Star,
  Download,
  Tag,
} from "lucide-react";
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

  useEffect(() => {
    const q = month ? `?month=${month}` : "";
    fetch(`/api/admin/reportes${q}`)
      .then((r) => r.json())
      .then((data: Report) => {
        setReport(data);
        if (!month) setMonth(data.month);
      })
      .catch(() => {});
  }, [month]);

  const exportCsv = () => {
    if (!report) return;
    const rows: string[][] = [
      ["Reporte mensual", monthLabel(report.month)],
      [],
      ["Métrica", "Valor"],
      ["Pedidos", String(report.totalOrders)],
      ["Ingresos (S/)", report.totalRevenue.toFixed(2)],
      ["Descuentos (S/)", report.totalDiscount.toFixed(2)],
      ["Ticket promedio (S/)", report.avgTicket.toFixed(2)],
      ["Clientes nuevos", String(report.newCustomers)],
      ["Rating promedio", report.reviewAvg.toFixed(1)],
      ["Reseñas", String(report.reviewCount)],
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
      ]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1
          className="text-xl sm:text-2xl font-medium text-cocoa-deep"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          Reporte mensual
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-cream-darker rounded-lg text-sm focus:outline-none focus:border-cocoa"
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
          <button
            onClick={exportCsv}
            disabled={!report}
            className="flex items-center gap-2 bg-cocoa text-white font-semibold px-4 py-2 rounded-lg hover:bg-cocoa-deep transition-colors disabled:opacity-50 text-sm"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
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
