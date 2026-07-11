"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCart } from "@/app/lib/cart-context";

// El carrito vive en localStorage (por navegador). Este componente lo ata a la
// IDENTIDAD del usuario: si cambia la sesión (cerrar sesión o cambiar de cuenta)
// se vacía el carrito. Excepción: invitado → inicia sesión conserva el carrito.
const OWNER_KEY = "mishkitashua-cart-owner";

export default function CartSessionSync() {
  const { isLoaded, userId } = useAuth();
  const { clearCart, hydrated } = useCart();

  useEffect(() => {
    if (!isLoaded || !hydrated) return;

    const current = userId ?? "guest";
    const prev = localStorage.getItem(OWNER_KEY);

    // Primera vez en este navegador: solo registrar el dueño (no limpiar).
    if (prev === null) {
      localStorage.setItem(OWNER_KEY, current);
      return;
    }
    if (prev === current) return;

    // Cambió la identidad.
    const wasGuest = prev === "guest";
    localStorage.setItem(OWNER_KEY, current);

    // Invitado → inicia sesión: conservar el carrito (merge).
    // Logout o cambio de cuenta: limpiar (no exponer el carrito de otro usuario).
    if (!wasGuest) clearCart();
  }, [isLoaded, userId, hydrated, clearCart]);

  return null;
}
