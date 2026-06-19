"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { SLOGAN } from "@/app/lib/brand";

/**
 * Hero a sangre completa con fotografía real, degradado cálido y un sutil
 * zoom Ken Burns de fondo. El texto entra con una animación escalonada al
 * cargar para darle más impacto y "emoción" a la primera impresión.
 */
export default function HeroHome() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const item = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
        },
      };

  return (
    <section className="relative overflow-hidden">
      {/* Fondo: foto real con zoom Ken Burns */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-alfajores-andinos.png"
          alt="Alfajores andinos Mishkitashua con ingredientes de los Andes"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center animate-ken-burns"
        />
        {/* Degradado para legibilidad y calidez */}
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa-deep/90 via-cocoa-deep/70 to-cocoa-deep/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-deep/80 via-transparent to-transparent" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative max-w-7xl mx-auto px-5 md:px-16 py-28 md:py-40"
      >
        <div className="max-w-2xl">
          <motion.p
            variants={item}
            className="text-sm font-semibold text-caramel-light tracking-widest uppercase mb-5"
          >
            {SLOGAN}
          </motion.p>
          <motion.h1
            variants={item}
            className="text-4xl md:text-6xl lg:text-7xl font-medium text-white leading-[1.05] mb-6"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Repostería andina con identidad propia
          </motion.h1>
          <motion.p
            variants={item}
            className="text-lg md:text-xl text-cream/90 leading-relaxed mb-9 max-w-xl"
          >
            Alfajores y manjares inspirados en los Andes peruanos, elaborados
            con tuna, aguaymanto y muña. Tradición, color y sabor en cada
            bocado.
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap gap-4">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-caramel-light text-cocoa-deep font-semibold px-8 py-4 rounded-lg hover:bg-caramel-dim transition-colors shadow-lg shadow-cocoa-deep/30"
            >
              Explorar Productos
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/nosotros"
              className="inline-flex items-center gap-2 border-2 border-cream/70 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-cocoa-deep transition-colors backdrop-blur-sm"
            >
              Nuestra Historia
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
