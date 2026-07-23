"use client";

import { useEffect, useState } from "react";

export type Section = { id: string; label: string };

// Índice lateral de una página larga. Resalta la sección visible y permite
// saltar a cualquiera. En pantallas anchas va fijo a la izquierda; en móvil se
// convierte en una fila de píldoras con scroll horizontal, para no comerse la
// pantalla.
export default function SectionNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;

    // Se marca como activa la sección más cercana al inicio de la ventana.
    // El margen superior descuenta la altura del navbar fijo.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // scroll-mt en cada sección deja el espacio del navbar; aquí solo se salta.
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <nav aria-label="Secciones de la página">
      {/* Móvil: píldoras horizontales */}
      <div className="lg:hidden sticky top-16 z-30 -mx-5 px-5 py-3 bg-cream/95 backdrop-blur border-b border-cream-darker/60">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-sm border transition-colors ${
                active === s.id
                  ? "bg-cocoa-deep text-white border-cocoa-deep"
                  : "bg-white text-on-surface-variant border-cream-darker/60"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Escritorio: índice fijo a un lado */}
      <ul className="hidden lg:block sticky top-24 space-y-1 border-l border-cream-darker/60">
        {sections.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => go(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              className={`block w-full text-left text-sm pl-4 -ml-px py-2 border-l-2 transition-colors ${
                active === s.id
                  ? "border-caramel text-cocoa-deep font-semibold"
                  : "border-transparent text-on-surface-variant hover:text-cocoa-deep"
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
