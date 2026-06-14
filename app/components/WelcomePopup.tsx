"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, Truck, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const HIDDEN_ROUTES = ["/admin", "/checkout", "/confirmacion"];
const STORAGE_KEY = "mishkitashua-welcome-shown";

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  const content = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };
  const item = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
  const pop = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.8 },
        show: {
          opacity: 1,
          scale: 1,
          transition: { type: "spring" as const, stiffness: 400, damping: 14 },
        },
      };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-cocoa-deep hover:bg-white transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <div className="relative h-48 overflow-hidden">
              <Image
                src="/images/banner-hero-3.png"
                alt="Bienvenido a Mishkitashua"
                fill
                className="object-cover"
                sizes="(max-width: 448px) 100vw, 448px"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
              <motion.span
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 14,
                  delay: 0.35,
                }}
                className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-caramel text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-cocoa-deep/20"
              >
                <Sparkles size={13} />
                Oferta de bienvenida
              </motion.span>
            </div>

            <motion.div
              className="p-6 text-center"
              variants={content}
              initial="hidden"
              animate="show"
            >
              <motion.h2
                variants={item}
                className="text-[26px] md:text-3xl font-medium text-cocoa-deep mb-1.5"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Bienvenido a Mishkitashua
              </motion.h2>
              <motion.p
                variants={item}
                className="text-on-surface-variant text-sm mb-5"
              >
                Sabores que nacen de nuestra tierra
              </motion.p>

              {/* Oferta destacada tipo cupón */}
              <motion.div
                variants={pop}
                className="flex items-center gap-3 bg-caramel-light/25 border border-dashed border-caramel/50 rounded-xl px-4 py-3 mb-5 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-caramel/15 flex items-center justify-center shrink-0">
                  <Truck size={20} className="text-caramel" />
                </div>
                <p className="text-sm text-cocoa-deep leading-snug">
                  <span className="font-bold text-caramel uppercase tracking-wide">
                    Envío gratis
                  </span>{" "}
                  en tu primera compra
                </p>
              </motion.div>

              <motion.div variants={item}>
                <Link
                  href="/productos"
                  onClick={handleClose}
                  className="inline-flex w-full items-center justify-center gap-2 bg-cocoa text-white font-semibold px-6 py-3.5 rounded-lg hover:bg-cocoa-deep transition-colors shadow-lg shadow-cocoa-deep/20"
                >
                  Explorar Productos
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
              <motion.p
                variants={item}
                className="text-[11px] text-taupe mt-3"
              >
                Sin código · se aplica al finalizar tu compra
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
