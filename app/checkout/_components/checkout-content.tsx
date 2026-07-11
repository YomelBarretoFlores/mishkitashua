"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/app/lib/analytics";
import {
  Lock,
  ArrowRight,
  ShoppingBag,
  Truck,
  CreditCard,
  Landmark,
  CheckCircle,
  Gift,
  ShieldCheck,
} from "lucide-react";
import { useCart, cartItemKey } from "@/app/lib/cart-context";
import { usePromotions } from "@/app/lib/promotions-context";

const SHIPPING_COST = 12.0;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type PaymentMethod = "card" | "transfer";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const router = useRouter();
  const promo = usePromotions(
    items.map((i) => ({ slug: i.slug, price: i.price, quantity: i.quantity }))
  );
  const shippingCost = promo.freeShipping ? 0 : SHIPPING_COST;
  const total = subtotal - promo.discount + shippingCost;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    telefono: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    setTouched((t) => ({ ...t, [e.target.name]: true }));

  const errors: Record<string, string> = {};
  if (!form.nombre.trim()) errors.nombre = "Ingresa tu nombre";
  if (!EMAIL_RE.test(form.email)) errors.email = "Correo electrónico inválido";
  if (!form.direccion.trim()) errors.direccion = "Ingresa tu dirección";
  if (!form.ciudad.trim()) errors.ciudad = "Ingresa tu ciudad";
  if (form.telefono.replace(/\D/g, "").length < 9)
    errors.telefono = "Teléfono inválido (mínimo 9 dígitos)";
  const isValid = Object.keys(errors).length === 0;
  const showError = (f: string) => (touched[f] ? errors[f] : undefined);

  useEffect(() => {
    if (items.length > 0) trackEvent("checkout_start", { page: "/checkout" });
  }, [items.length]);

  const markAllTouched = () =>
    setTouched({
      nombre: true,
      email: true,
      direccion: true,
      ciudad: true,
      telefono: true,
    });

  const customerPayload = () => ({
    name: form.nombre,
    email: form.email,
    phone: form.telefono,
    address: form.direccion,
    city: form.ciudad,
  });
  const itemsPayload = () =>
    items.map((i) => ({
      slug: i.slug,
      quantity: i.quantity,
      customization: i.customization ?? null,
    }));

  // Inicia el pago con tarjeta: crea la sesión de Stripe Checkout y redirige.
  // (Sin llaves de Stripe, el servidor crea el pedido en modo simulación.)
  const payWithCard = async () => {
    setError("");
    if (!isValid) return markAllTouched();
    setSubmitting(true);
    try {
      const sessionId = sessionStorage.getItem("msk-session") || "";
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerPayload(),
          items: itemsPayload(),
          sessionId,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "No se pudo iniciar el pago");
      }
      const { url } = await res.json();
      // El carrito se limpia en /confirmacion (fresh=1), igual para Stripe y simulación.
      window.location.href = url; // Stripe hospedado o /confirmacion (simulación)
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Error al iniciar el pago");
    }
  };

  const payWithTransfer = async () => {
    setError("");
    if (!isValid) return markAllTouched();
    setSubmitting(true);
    try {
      const sessionId = sessionStorage.getItem("msk-session") || "";
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerPayload(),
          items: itemsPayload(),
          paymentMethod: "transfer",
          sessionId,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "No se pudo registrar el pedido");
      }
      const { id } = await res.json();
      router.push(`/confirmacion?order=${id}&fresh=1`);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  const handlePay = () => {
    if (paymentMethod === "transfer") payWithTransfer();
    else payWithCard();
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-16 py-20 text-center">
        <ShoppingBag size={48} className="text-taupe mx-auto mb-6" />
        <h1
          className="text-3xl font-medium text-cocoa-deep mb-4"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          No hay productos para pagar
        </h1>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-cocoa-deep transition-colors"
        >
          Ver Productos <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const inputCls = (f: string) =>
    `w-full px-4 py-3 bg-white border rounded-lg text-sm text-cocoa-deep focus:outline-none transition-colors ${
      showError(f)
        ? "border-red-400 focus:border-red-500"
        : "border-cream-darker focus:border-cocoa"
    }`;

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-16 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1
          className="text-3xl md:text-5xl font-medium text-cocoa-deep mb-3 italic"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          Finalizar Compra
        </h1>
        <p className="text-on-surface-variant">
          Completa tu pedido de forma segura.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-8">
          {/* Envío */}
          <section className="bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-cream-darker/60">
              <Truck size={20} className="text-cocoa-deep" />
              <h2
                className="text-xl font-semibold text-cocoa-deep"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Detalles de Envío
              </h2>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls("nombre")}
                    placeholder="María Rodríguez"
                  />
                  {showError("nombre") && (
                    <p className="text-xs text-red-500 mt-1">
                      {showError("nombre")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls("email")}
                    placeholder="maria@ejemplo.com"
                  />
                  {showError("email") && (
                    <p className="text-xs text-red-500 mt-1">
                      {showError("email")}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputCls("direccion")}
                  placeholder="Av. Libertador 1234, Apt 5B"
                />
                {showError("direccion") && (
                  <p className="text-xs text-red-500 mt-1">
                    {showError("direccion")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls("ciudad")}
                    placeholder="Huaraz"
                  />
                  {showError("ciudad") && (
                    <p className="text-xs text-red-500 mt-1">
                      {showError("ciudad")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls("telefono")}
                    placeholder="+51 999 999 999"
                  />
                  {showError("telefono") && (
                    <p className="text-xs text-red-500 mt-1">
                      {showError("telefono")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Método de pago */}
          <section className="bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-cream-darker/60">
              <CreditCard size={20} className="text-cocoa-deep" />
              <h2
                className="text-xl font-semibold text-cocoa-deep"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Método de Pago
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {(
                [
                  { key: "card", label: "Tarjeta", icon: CreditCard },
                  { key: "transfer", label: "Transferencia", icon: Landmark },
                ] as const
              ).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setPaymentMethod(m.key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg text-xs font-semibold transition-colors border ${
                    paymentMethod === m.key
                      ? "bg-cocoa text-white border-cocoa"
                      : "bg-white text-cocoa-deep border-cream-darker hover:border-cocoa-light"
                  }`}
                >
                  <m.icon size={18} />
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === "transfer" ? (
              <div className="bg-cream rounded-xl p-5">
                <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                  Realiza tu transferencia a la siguiente cuenta y envíanos el
                  comprobante por WhatsApp:
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-cocoa-deep font-semibold">
                    Banco de la Nación
                  </p>
                  <p className="text-on-surface-variant">
                    Cuenta corriente: 00-123-456789
                  </p>
                  <p className="text-on-surface-variant">
                    Titular: Mishkitashua S.A.C.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-cream rounded-xl p-5 flex items-start gap-3">
                <ShieldCheck size={20} className="text-green-700 shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Pago protegido con{" "}
                  <span className="font-semibold text-cocoa-deep">Stripe</span>.
                  Serás redirigido a la pasarela segura; tus datos de tarjeta se
                  procesan cifrados y{" "}
                  <span className="font-semibold">
                    nunca se almacenan en nuestros servidores
                  </span>
                  .
                </p>
              </div>
            )}

            <p className="flex items-center gap-1.5 text-xs text-taupe mt-5">
              <Lock size={12} />
              Procesamiento de pago seguro y encriptado.
            </p>
          </section>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-cream-darker/60 p-6 sticky top-24">
            <h2
              className="text-xl font-semibold text-cocoa-deep mb-6"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Resumen del Pedido
            </h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={cartItemKey(item)} className="flex gap-3 items-center">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cocoa-deep">
                      {item.name}
                    </p>
                    <p className="text-xs text-taupe">Cant: {item.quantity}</p>
                    {item.customization && (
                      <p className="text-xs text-caramel">
                        {Object.entries(item.customization)
                          .filter(([, n]) => n > 0)
                          .map(([flavor, n]) => `${n} ${flavor}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-caramel">
                    S/ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-darker pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              {promo.discount > 0 && (
                <div className="flex justify-between text-sm text-green-700 font-medium">
                  <span>Descuento</span>
                  <span>- S/ {promo.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Costo de Envío</span>
                {promo.freeShipping ? (
                  <span className="text-green-700 font-medium">Gratis</span>
                ) : (
                  <span>S/ {SHIPPING_COST.toFixed(2)}</span>
                )}
              </div>
              <div className="border-t border-cream-darker pt-3 flex justify-between">
                <span className="font-semibold text-cocoa-deep">Total</span>
                <span className="text-xl font-semibold text-caramel">
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {promo.gift && (
              <div className="flex items-start gap-2 bg-caramel-light/20 border border-caramel-light/50 rounded-xl p-3 mb-6">
                <Gift size={16} className="text-caramel shrink-0 mt-0.5" />
                <p className="text-xs text-cocoa-deep">
                  <span className="font-semibold">
                    ¡Regalo sorpresa incluido!
                  </span>{" "}
                  {promo.gift}
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={handlePay}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-cocoa text-white font-semibold py-4 rounded-lg hover:bg-cocoa-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} />
              {submitting
                ? "Procesando..."
                : paymentMethod === "transfer"
                  ? "Confirmar Pedido"
                  : `Pagar S/ ${total.toFixed(2)}`}
            </button>

            <p className="text-xs text-taupe text-center mt-4 leading-relaxed">
              Al realizar tu pedido, aceptas nuestros{" "}
              <Link href="/ayuda" className="underline hover:text-cocoa-deep">
                Términos y Condiciones
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
