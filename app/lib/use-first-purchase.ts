"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

// Indica si el usuario logueado califica para el envío gratis de primera compra.
// Los invitados nunca califican (no se puede verificar su historial).
export function useFirstPurchase(): boolean {
  const { isSignedIn, isLoaded } = useAuth();
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    // Sin sesión no se consulta nada. No hace falta poner el estado a false
    // aquí (eso provocaba un render en cascada): al devolver el valor ya se
    // exige `isSignedIn`, así que cerrar sesión deja de dar envío gratis solo.
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    fetch("/api/account/first-purchase")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setEligible(!!d.eligible);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  return isSignedIn ? eligible : false;
}
