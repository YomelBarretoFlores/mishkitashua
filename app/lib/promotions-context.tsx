"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  applyPromotions,
  type Promotion,
  type CartLine,
  type AppliedPromotions,
} from "@/app/lib/promotions";

// Contexto que pide /api/promotions UNA sola vez por sesión de página y
// comparte las promociones activas con todos los consumidores (banner, chatbot,
// detalle de producto, carrito, checkout), evitando fetches duplicados.
const PromotionsContext = createContext<Promotion[]>([]);

export function PromotionsProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPromotions(data);
      })
      .catch(() => {});
  }, []);

  return (
    <PromotionsContext value={promotions}>{children}</PromotionsContext>
  );
}

// Lista cruda de promociones activas.
export function useActivePromotions(): Promotion[] {
  return useContext(PromotionsContext);
}

// Promociones aplicadas a las líneas del carrito (descuento, envío, regalo).
export function usePromotions(lines: CartLine[]): AppliedPromotions {
  const promotions = useContext(PromotionsContext);
  return applyPromotions(lines, promotions);
}
