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
} from "lucide-react";
import { useCart } from "@/app/lib/cart-context";

const SHIPPING_COST = 12.0;

type PaymentMethod = "card" | "transfer";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const total = subtotal + SHIPPING_COST;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    telefono: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (items.length > 0) trackEvent("checkout_start", { page: "/checkout" });
  }, [items.length]);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const sessionId = sessionStorage.getItem("msk-session") || "";
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.nombre,
            email: form.email,
            phone: form.telefono,
            address: form.direccion,
            city: form.ciudad,
          },
          items: items.map((i) => ({
            slug: i.slug,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            image: i.image,
          })),
          paymentMethod,
          subtotal,
          shippingCost: SHIPPING_COST,
          total,
          sessionId,
        }),
      });

      if (!res.ok) throw new Error("Error");

      const { id } = await res.json();
      clearCart();
      router.push(`/confirmacion?order=${id}`);
    } catch {
      setSubmitting(false);
      alert("Error al procesar el pedido. Inténtalo de nuevo.");
    }
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
          Ver Productos
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

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

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Details */}
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
                      required
                      className="w-full px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                      placeholder="María Rodríguez"
                    />
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
                      required
                      className="w-full px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                      placeholder="maria@ejemplo.com"
                    />
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
                    required
                    className="w-full px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                    placeholder="Av. Libertador 1234, Apt 5B"
                  />
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
                      required
                      className="w-full px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                      placeholder="Huaraz"
                    />
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
                      required
                      className="w-full px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                      placeholder="+51 999 999 999"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Method */}
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

              {/* Payment Toggle */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors border ${
                    paymentMethod === "card"
                      ? "bg-cocoa text-white border-cocoa"
                      : "bg-white text-cocoa-deep border-cream-darker hover:border-cocoa-light"
                  }`}
                >
                  <CreditCard size={16} />
                  Tarjeta de Crédito / Débito
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors border ${
                    paymentMethod === "transfer"
                      ? "bg-cocoa text-white border-cocoa"
                      : "bg-white text-cocoa-deep border-cream-darker hover:border-cocoa-light"
                  }`}
                >
                  <Landmark size={16} />
                  Transferencia Bancaria
                </button>
              </div>

              {paymentMethod === "card" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                      Número de Tarjeta
                    </label>
                    <div className="relative">
                      <CreditCard
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe"
                      />
                      <input
                        type="text"
                        name="cardNumber"
                        value={form.cardNumber}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                        Fecha de Expiración
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={form.cardExpiry}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cardCvv"
                        value={form.cardCvv}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-cream rounded-xl p-5">
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                    Realiza tu transferencia a la siguiente cuenta y envíanos el
                    comprobante por WhatsApp o correo electrónico:
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
              )}

              <p className="flex items-center gap-1.5 text-xs text-taupe mt-5">
                <Lock size={12} />
                Procesamiento de pago seguro y encriptado.
              </p>
            </section>
          </div>

          {/* Order Summary */}
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
                  <div key={item.slug} className="flex gap-3 items-center">
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
                      <p className="text-xs text-taupe">
                        Cant: {item.quantity}
                      </p>
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
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span>Costo de Envío</span>
                  <span>S/ {SHIPPING_COST.toFixed(2)}</span>
                </div>
                <div className="border-t border-cream-darker pt-3 flex justify-between">
                  <span className="font-semibold text-cocoa-deep">Total</span>
                  <span className="text-xl font-semibold text-caramel">
                    S/ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-cocoa text-white font-semibold py-4 rounded-lg hover:bg-cocoa-deep transition-colors disabled:opacity-60"
              >
                <CheckCircle size={18} />
                {submitting ? "Procesando..." : "Finalizar Compra"}
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
      </form>
    </div>
  );
}
