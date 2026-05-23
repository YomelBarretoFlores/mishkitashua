"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Lock } from "lucide-react";
import { useCart } from "@/app/lib/cart-context";

const SHIPPING_COST = 12.0;

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const total = subtotal + (items.length > 0 ? SHIPPING_COST : 0);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-16 py-20 text-center">
        <ShoppingBag size={48} className="text-taupe mx-auto mb-6" />
        <h1
          className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-4"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          Tu carrito está vacío
        </h1>
        <p className="text-on-surface-variant mb-8">
          Descubre nuestros alfajores y manjares artesanales.
        </p>
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
      <div className="mb-10">
        <h1
          className="text-3xl md:text-5xl font-medium text-cocoa-deep mb-3"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          Tu Selección
        </h1>
        <p className="text-on-surface-variant">
          Revisa los tesoros artesanales que has elegido antes de continuar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.slug}
              className="bg-white rounded-2xl border border-cream-darker/60 p-5 md:p-6"
            >
              <div className="flex gap-4 md:gap-6">
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-cocoa-deep text-lg">
                        {item.name}
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.slug)}
                      className="p-2 text-taupe hover:text-red-600 transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="inline-flex items-center border border-cream-darker rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.slug, item.quantity - 1)
                        }
                        className="p-2 text-cocoa-deep hover:bg-cream-dark transition-colors rounded-l-lg"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 py-2 text-sm font-semibold text-cocoa-deep">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.slug, item.quantity + 1)
                        }
                        className="p-2 text-cocoa-deep hover:bg-cream-dark transition-colors rounded-r-lg"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-lg font-semibold text-cocoa-deep">
                      S/ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-cream-darker/60 p-6 sticky top-24">
            <h2
              className="text-xl font-semibold text-cocoa-deep mb-6"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Resumen de Compra
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Envío estimado</span>
                <span>S/ {SHIPPING_COST.toFixed(2)}</span>
              </div>
              <div className="border-t border-cream-darker pt-3 flex justify-between">
                <span className="font-semibold text-cocoa-deep">Total</span>
                <span className="text-lg font-semibold text-caramel">
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-cocoa text-white font-semibold py-4 rounded-lg hover:bg-cocoa-deep transition-colors"
            >
              Continuar al Pago
              <ArrowRight size={18} />
            </Link>

            <p className="flex items-center justify-center gap-1.5 text-xs text-taupe mt-4">
              <Lock size={12} />
              Pago seguro y cifrado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
