"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

// Evento no estándar de Chromium; no está en los tipos de TS.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS moderno se identifica como Mac con pantalla táctil.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari iOS expone esta propiedad no estándar.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallAppButton({
  className = "",
}: {
  className?: string;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    setIos(isIOS());

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Ya instalada: no mostrar nada.
  if (installed) return null;
  // Sin evento de instalación y no es iOS: el navegador no permite instalar
  // (o ya se ofreció). No mostramos un botón que no haría nada.
  if (!deferred && !ios) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } else if (ios) {
      setShowIOSHelp(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={
          className ||
          "inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-caramel transition-colors"
        }
      >
        <Download size={16} aria-hidden />
        Descargar app
      </button>

      {showIOSHelp && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-cocoa-deep/40 backdrop-blur-[2px]"
          onClick={() => setShowIOSHelp(false)}
          role="presentation"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="w-full max-w-sm bg-white rounded-2xl border border-cream-darker/60 shadow-xl p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2
                id="ios-install-title"
                className="text-lg font-medium text-cocoa-deep"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Instalar en iPhone
              </h2>
              <button
                onClick={() => setShowIOSHelp(false)}
                aria-label="Cerrar"
                className="text-taupe hover:text-cocoa-deep transition-colors"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <ol className="text-sm text-on-surface-variant space-y-3">
              <li className="flex items-center gap-2">
                <span className="font-semibold text-cocoa-deep">1.</span>
                Toca el botón{" "}
                <Share size={15} className="inline text-cocoa" aria-hidden />{" "}
                <span className="font-medium text-cocoa-deep">Compartir</span> en
                la barra de Safari.
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold text-cocoa-deep">2.</span>
                Elige{" "}
                <span className="font-medium text-cocoa-deep">
                  Añadir a inicio
                </span>
                .
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold text-cocoa-deep">3.</span>
                Confirma con{" "}
                <span className="font-medium text-cocoa-deep">Añadir</span>.
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
