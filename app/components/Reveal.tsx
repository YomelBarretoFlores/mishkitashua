"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Retraso en segundos, útil para escalonar (stagger) varios elementos. */
  delay?: number;
  /** Dirección desde la que entra el contenido. */
  direction?: "up" | "down" | "left" | "right";
  className?: string;
};

const offset = 28;

/**
 * Envuelve cualquier contenido para que aparezca con un fade + desplazamiento
 * suave al entrar en el viewport. Si el usuario prefiere menos movimiento,
 * el contenido simplemente aparece sin animación.
 */
export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
}: RevealProps) {
  const reduce = useReducedMotion();

  const hidden = reduce
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: direction === "up" ? offset : direction === "down" ? -offset : 0,
        x: direction === "left" ? offset : direction === "right" ? -offset : 0,
      };

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
