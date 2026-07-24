"use client";

import { Search, X } from "lucide-react";

// Caja de búsqueda del panel. Mismo aspecto que la que ya tenía Pedidos, para
// que las secciones no se vean cada una de su padre y su madre.
//
// Lleva botón de borrar a propósito: sin él, para volver a ver la lista
// completa hay que seleccionar el texto y borrarlo a mano, que fue la misma
// queja que hubo con el filtro de fechas de los reportes.
export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  label = "Buscar",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-on-surface-variant mb-1">
        {label}
      </span>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe pointer-events-none"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa [&::-webkit-search-cancel-button]:hidden"
        />
        {value !== "" && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-taupe hover:text-cocoa-deep hover:bg-cream-darker/60 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </label>
  );
}

// Normaliza para comparar: sin tildes y en minúsculas, así "Huaman" encuentra
// "Huamán". Escribir con tilde en un buscador es justo lo que nadie hace.
export function normaliza(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
