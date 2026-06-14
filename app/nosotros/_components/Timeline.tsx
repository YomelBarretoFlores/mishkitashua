"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";

const timeline = [
  {
    year: "2024",
    title: "Nace la idea",
    text: "Se plantea una propuesta de repostería andina basada en el uso de insumos regionales y sabores diferenciados.",
    side: "right" as const,
  },
  {
    year: "2025",
    title: "Se define el portafolio",
    text: "Se estructuran dos líneas de producto: alfajores andinos y manjares saborizados de tuna, aguaymanto y muña.",
    side: "left" as const,
  },
  {
    year: "2026",
    title: "Proyección comercial",
    text: "Mishkitashua se consolida como una marca con presentaciones definidas, envases comerciales, canales digitales y enfoque hacia una producción organizada por lotes.",
    side: "right" as const,
  },
];

const spring = { type: "spring" as const, stiffness: 260, damping: 18 };

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-cream-dark rounded-xl p-6 border border-cream-darker/60">
      <h3
        className="text-xl font-semibold text-cocoa-deep mb-2"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        {title}
      </h3>
      <p className="text-sm text-on-surface-variant leading-relaxed">{text}</p>
    </div>
  );
}

function YearCircle({
  year,
  size,
  reduce,
}: {
  year: string;
  size: "lg" | "sm";
  reduce: boolean;
}) {
  const dim =
    size === "lg" ? "w-16 h-16 text-sm" : "w-8 h-8 text-[10px]";
  return (
    <motion.div
      className={`${dim} rounded-full bg-caramel-light/30 border-2 border-caramel-light flex items-center justify-center z-10`}
      initial={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
      whileInView={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={reduce ? { duration: 0.4 } : spring}
    >
      <span
        className="font-semibold text-cocoa-deep"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        {year}
      </span>
    </motion.div>
  );
}

/**
 * Línea de tiempo "Nuestra Trayectoria" animada: la línea vertical se dibuja
 * conforme el usuario hace scroll, los círculos de año aparecen con un "pop"
 * tipo resorte y cada tarjeta entra desde su lado. Respeta prefers-reduced-motion.
 */
export default function Timeline() {
  const reduce = useReducedMotion() ?? false;

  // Desktop: la línea crece con el scroll de la sección.
  const desktopRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: deskProgress } = useScroll({
    target: desktopRef,
    offset: ["start center", "end center"],
  });
  const deskScale = useTransform(deskProgress, [0, 1], [0, 1]);

  const mobileRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: mobProgress } = useScroll({
    target: mobileRef,
    offset: ["start center", "end center"],
  });
  const mobScale = useTransform(mobProgress, [0, 1], [0, 1]);

  const cardEnter = (side: "left" | "right") =>
    reduce
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
      : {
          initial: { opacity: 0, x: side === "left" ? -40 : 40 },
          whileInView: { opacity: 1, x: 0 },
        };

  return (
    <>
      {/* Desktop Timeline */}
      <div ref={desktopRef} className="hidden md:block relative max-w-3xl mx-auto">
        {/* Riel base + línea que se dibuja */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cream-darker -translate-x-1/2" />
        <motion.div
          className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-caramel origin-top"
          style={{ scaleY: reduce ? 1 : deskScale, x: "-50%" }}
        />

        <div className="space-y-16">
          {timeline.map((item) => {
            const enter = cardEnter(item.side);
            return (
              <div key={item.year} className="relative flex items-start">
                {item.side === "left" ? (
                  <motion.div
                    className="w-[calc(50%-32px)] pr-4"
                    initial={enter.initial}
                    whileInView={enter.whileInView}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card title={item.title} text={item.text} />
                  </motion.div>
                ) : (
                  <div className="w-[calc(50%-32px)]" />
                )}

                <div className="absolute left-1/2 -translate-x-1/2">
                  <YearCircle year={item.year} size="lg" reduce={reduce} />
                </div>

                {item.side === "right" ? (
                  <motion.div
                    className="w-[calc(50%-32px)] ml-auto pl-4"
                    initial={enter.initial}
                    whileInView={enter.whileInView}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card title={item.title} text={item.text} />
                  </motion.div>
                ) : (
                  <div className="w-[calc(50%-32px)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Timeline */}
      <div ref={mobileRef} className="md:hidden relative pl-10">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-cream-darker" />
        <motion.div
          className="absolute left-4 top-0 bottom-0 w-[2px] bg-caramel origin-top"
          style={{ scaleY: reduce ? 1 : mobScale }}
        />

        <div className="space-y-10">
          {timeline.map((item) => (
            <div key={item.year} className="relative">
              <div className="absolute -left-10 top-0">
                <YearCircle year={item.year} size="sm" reduce={reduce} />
              </div>
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card title={item.title} text={item.text} />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
