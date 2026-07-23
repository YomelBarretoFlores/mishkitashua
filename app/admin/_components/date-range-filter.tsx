"use client";

import { X } from "lucide-react";

// Rango de fechas para los filtros del panel.
//
// Un <input type="date"> vacío se ve como una caja gris sin nada dentro: no
// dice qué fecha pide ni se adivina que es una fecha. Por eso aquí siempre
// lleva su etiqueta encima y una "x" para vaciarlo, porque el control del
// navegador no ofrece una forma clara de quitar la fecha una vez puesta.
export default function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  labelFrom = "Desde",
  labelTo = "Hasta",
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  labelFrom?: string;
  labelTo?: string;
}) {
  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void
  ) => (
    <label className="block">
      <span className="block text-xs font-medium text-on-surface-variant mb-1">
        {label}
      </span>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          // El "max" evita rangos imposibles hacia el futuro.
          max="2100-12-31"
          className="w-full px-3 py-2 pr-8 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={`Quitar ${label.toLowerCase()}`}
            title="Quitar fecha"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-taupe hover:text-cocoa-deep transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </label>
  );

  return (
    <>
      {field(labelFrom, from, onFromChange)}
      {field(labelTo, to, onToChange)}
    </>
  );
}
