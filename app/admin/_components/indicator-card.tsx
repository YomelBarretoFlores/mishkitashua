"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { meetsTarget, type Indicator } from "@/app/lib/kpi";

// Tarjeta de indicador con su meta visible y, al desplegarla, todo lo que hace
// falta para auditarla: la fórmula, los números concretos que se usaron, de
// dónde salen y qué se excluyó. Un porcentaje sin eso no se puede defender.
export default function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const [open, setOpen] = useState(false);
  const ok = meetsTarget(indicator);

  const valueText =
    indicator.value === null
      ? "—"
      : indicator.unit === "%"
        ? `${indicator.value}%`
        : indicator.unit === "días"
          ? `${indicator.value} d`
          : indicator.value.toFixed(1);

  const targetText = `meta ${indicator.targetDirection === "gte" ? "≥" : "≤"} ${indicator.target}${indicator.unit === "%" ? "%" : ""}`;

  return (
    <div className="bg-white rounded-2xl border border-cream-darker/60 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-[10px] font-semibold text-taupe tracking-widest uppercase">
            {indicator.category}
          </span>
          {/* Punto de estado: verde en meta, rojo fuera, gris sin datos */}
          <span
            className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
              ok === null
                ? "bg-cream-darker"
                : ok
                  ? "bg-green-600"
                  : "bg-red-500"
            }`}
            title={
              ok === null ? "Sin datos" : ok ? "En meta" : "Fuera de meta"
            }
          />
        </div>

        <p className="text-sm text-on-surface-variant mb-2 leading-snug">
          {indicator.label}
        </p>
        <p
          className="text-3xl text-cocoa-deep leading-none mb-2"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          {valueText}
        </p>
        <p className="text-xs text-taupe">
          {targetText}
          {indicator.value === null && " · sin datos en el periodo"}
        </p>

        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cocoa hover:text-caramel transition-colors"
          aria-expanded={open}
        >
          Cómo se calcula
          <ChevronDown
            size={13}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <dl className="px-5 pb-5 pt-1 space-y-3 text-xs border-t border-cream-darker/60 bg-cream/40">
          <div className="pt-3">
            <dt className="font-semibold text-cocoa-deep mb-1">Fórmula</dt>
            <dd className="text-on-surface-variant leading-relaxed">
              {indicator.formula}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-cocoa-deep mb-1">
              Datos del periodo
            </dt>
            <dd className="text-on-surface-variant">
              {indicator.numerator.label}:{" "}
              <strong className="text-cocoa-deep">
                {indicator.numerator.value}
              </strong>
              <br />
              {indicator.denominator.label}:{" "}
              <strong className="text-cocoa-deep">
                {indicator.denominator.value}
              </strong>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-cocoa-deep mb-1">Fuente</dt>
            <dd className="text-on-surface-variant leading-relaxed">
              {indicator.source}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-cocoa-deep mb-1">Exclusiones</dt>
            <dd className="text-on-surface-variant leading-relaxed">
              {indicator.exclusions}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-cocoa-deep mb-1">
              Interpretación
            </dt>
            <dd className="text-on-surface-variant leading-relaxed">
              {indicator.interpretation}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
