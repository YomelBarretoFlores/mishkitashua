"use client";

import { useEffect, useRef, useState } from "react";
import { Smartphone, Loader2 } from "lucide-react";

// Formulario de pago con Yape.
//
// El celular y el código de aprobación se los queda el SDK de Mercado Pago y
// viajan cifrados DIRECTAMENTE a sus servidores; nuestro backend solo recibe el
// token resultante, de un solo uso. Por eso el `create()` ocurre aquí y no en el
// servidor: si esos datos pasaran por nosotros, entraríamos en el alcance de
// PCI y quedarían en los registros del servidor.

type YapeSdk = {
  yape: (args: { otp: string; phoneNumber: string }) => {
    create: () => Promise<{ id: string }>;
  };
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, opts?: { locale?: string }) => YapeSdk;
  }
}

const SDK_URL = "https://sdk.mercadopago.com/js/v2";

// Límites que declara la propia API de Mercado Pago para el método "yape"
// (min_allowed_amount / max_allowed_amount). Se comprueban aquí para no mandar
// al comprador a un rechazo que no sabría interpretar: con un descuento grande
// el total puede bajar de S/ 1 y MP lo rechaza sin explicar por qué.
const MINIMO = 1;
const MAXIMO = 2000;

export default function YapeForm({
  total,
  disabled,
  onAntesDePagar,
  onPagado,
}: {
  total: number;
  disabled?: boolean;
  /** Devuelve los datos del pedido, o null si el formulario de envío no es válido. */
  onAntesDePagar: () => {
    customer: Record<string, string>;
    items: unknown[];
    sessionId: string;
    couponCode: string | null;
  } | null;
  onPagado: (orderId: string) => void;
}) {
  const [telefono, setTelefono] = useState("");
  const [otp, setOtp] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [sdkListo, setSdkListo] = useState(false);
  const mpRef = useRef<YapeSdk | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

  useEffect(() => {
    if (!publicKey) return;

    const iniciar = () => {
      if (!window.MercadoPago) return;
      mpRef.current = new window.MercadoPago(publicKey, { locale: "es-PE" });
      setSdkListo(true);
    };

    if (window.MercadoPago) {
      iniciar();
      return;
    }
    // El SDK se carga solo cuando se elige Yape, no en cada visita al checkout.
    const existente = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_URL}"]`
    );
    if (existente) {
      existente.addEventListener("load", iniciar);
      return () => existente.removeEventListener("load", iniciar);
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = iniciar;
    script.onerror = () =>
      setError("No se pudo cargar el sistema de pagos. Revisa tu conexión.");
    document.body.appendChild(script);
  }, [publicKey]);

  const soloDigitos = (v: string, max: number) =>
    v.replace(/\D/g, "").slice(0, max);

  const telefonoOk = telefono.length === 9;
  const otpOk = otp.length === 6;

  const pagar = async () => {
    setError("");
    const datos = onAntesDePagar();
    if (!datos) return; // el formulario de envío marca sus propios errores
    if (!mpRef.current) {
      setError("El sistema de pagos aún se está cargando. Espera un momento.");
      return;
    }

    setProcesando(true);
    try {
      // 1. Celular + código -> token, contra Mercado Pago, sin pasar por aquí.
      const yape = mpRef.current.yape({ otp, phoneNumber: telefono });
      const token = await yape.create();

      // 2. El token sí viaja a nuestro servidor, que es quien cobra y decide el
      //    importe. El navegador nunca manda el precio.
      const res = await fetch("/api/checkout/yape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, token: token.id }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "No se pudo procesar el pago");

      onPagado(d.id);
    } catch (err) {
      setProcesando(false);
      // El código es de un solo uso: si falló, el que escribió ya no sirve.
      setOtp("");
      setError(
        err instanceof Error && err.message
          ? err.message
          : "El código no es válido o ya venció. Genera uno nuevo en tu app de Yape."
      );
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-amber-50 border border-amber-300/70 rounded-xl p-4 text-sm text-amber-900">
        El pago con Yape no está configurado. Elige otro medio de pago.
      </div>
    );
  }

  if (total < MINIMO || total > MAXIMO) {
    return (
      <div className="bg-amber-50 border border-amber-300/70 rounded-xl p-4 text-sm text-amber-900 leading-relaxed">
        {total < MINIMO ? (
          <>
            Yape no acepta cobros menores de S/ {MINIMO.toFixed(2)} y tu total es
            de S/ {total.toFixed(2)}. Elige <strong>Tarjeta u otros</strong> para
            completar esta compra.
          </>
        ) : (
          <>
            Yape no acepta cobros mayores de S/ {MAXIMO.toFixed(2)} y tu total es
            de S/ {total.toFixed(2)}. Elige <strong>Tarjeta u otros</strong> para
            completar esta compra.
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-xl p-5">
      <div className="flex items-start gap-3 mb-5">
        <Smartphone size={20} className="text-cocoa-deep shrink-0 mt-0.5" />
        <div className="text-sm text-on-surface-variant leading-relaxed">
          <p className="font-semibold text-cocoa-deep mb-1">
            Paga con Yape sin salir de aquí
          </p>
          <p>
            Abre tu app de Yape, entra en{" "}
            <strong className="text-cocoa-deep">Aprobar compra por internet</strong>{" "}
            y copia el código de 6 dígitos que aparece. No necesitas cuenta de
            Mercado Pago.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs font-medium text-on-surface-variant mb-1">
            Celular afiliado a Yape
          </span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={telefono}
            onChange={(e) => setTelefono(soloDigitos(e.target.value, 9))}
            placeholder="9XXXXXXXX"
            disabled={procesando}
            className="w-full px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep tracking-wide focus:outline-none focus:border-cocoa disabled:opacity-60"
          />
          {telefono !== "" && !telefonoOk && (
            <span className="block text-xs text-red-500 mt-1">
              El celular tiene 9 dígitos
            </span>
          )}
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-on-surface-variant mb-1">
            Código de aprobación
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(soloDigitos(e.target.value, 6))}
            placeholder="6 dígitos"
            disabled={procesando}
            className="w-full px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep tracking-[0.3em] font-mono focus:outline-none focus:border-cocoa disabled:opacity-60"
          />
          {otp !== "" && !otpOk && (
            <span className="block text-xs text-red-500 mt-1">
              El código tiene 6 dígitos
            </span>
          )}
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-4 leading-relaxed">{error}</p>
      )}

      <button
        type="button"
        onClick={pagar}
        disabled={disabled || procesando || !telefonoOk || !otpOk || !sdkListo}
        className="w-full mt-5 flex items-center justify-center gap-2 bg-[#742384] text-white font-semibold py-3.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {procesando ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Procesando…
          </>
        ) : (
          <>Yapear S/ {total.toFixed(2)}</>
        )}
      </button>

      <p className="text-xs text-taupe mt-3 leading-relaxed">
        El código vence a los pocos minutos: genéralo justo antes de pagar.
        Además, tu app de Yape tiene su propio tope por operación (S/&nbsp;500,
        900 o 2000 según lo que hayas configurado); si tu pedido lo supera,
        Yape lo rechazará y tendrás que usar otro medio de pago.
      </p>
    </div>
  );
}
