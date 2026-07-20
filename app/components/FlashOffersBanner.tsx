"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, X } from "lucide-react";
import { useActivePromotions } from "@/app/lib/promotions-context";

const DISMISS_KEY = "msk-flash-dismissed";

function useCountdown(endsAt: string | Date) {
  const [remaining, setRemaining] = useState<number>(
    () => new Date(endsAt).getTime() - Date.now()
  );
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(new Date(endsAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return remaining;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "¡Última oportunidad!";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `Termina en ${days}d ${hours}h`;
  if (hours > 0) return `Termina en ${hours}h ${mins}m`;
  return `Termina en ${mins}m ${secs}s`;
}

export default function FlashOffersBanner() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const promos = useActivePromotions();
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // sessionStorage no existe al renderizar en el servidor, así que esto no
    // se puede derivar durante el render: hay que leerlo tras montar.
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (promos.length > 0) setDismissed(false);
  }, [promos.length]);

  // Rota entre promociones cada 6s si hay varias.
  useEffect(() => {
    if (promos.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % promos.length),
      6000
    );
    return () => clearInterval(id);
  }, [promos.length]);

  const current = promos[index];
  const remaining = useCountdown(current?.endsAt ?? new Date().toISOString());

  // No mostrar en el panel de admin ni en el checkout/confirmación.
  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/confirmacion");

  if (hidden || dismissed || !current) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { y: -40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-cocoa-deep text-white"
      >
        <div className="max-w-7xl mx-auto px-5 md:px-16 py-2 flex items-center justify-center gap-3 text-sm relative">
          <Zap size={16} className="text-caramel-light shrink-0" />
          <Link
            href="/productos"
            className="flex items-center gap-2 hover:text-caramel-light transition-colors text-center"
          >
            <span className="font-semibold">{current.title}</span>
            {current.description && (
              <span className="hidden sm:inline text-white/80">
                — {current.description}
              </span>
            )}
            <span className="text-caramel-light font-medium whitespace-nowrap">
              · {formatRemaining(remaining)}
            </span>
          </Link>
          <button
            onClick={dismiss}
            aria-label="Cerrar"
            className="absolute right-3 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
