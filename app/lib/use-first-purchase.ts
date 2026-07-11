"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

// Indica si el usuario logueado califica para el envío gratis de primera compra.
// Los invitados nunca califican (no se puede verificar su historial).
export function useFirstPurchase(): boolean {
  const { isSignedIn, isLoaded } = useAuth();
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setEligible(false);
      return;
    }
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

  return eligible;
}
