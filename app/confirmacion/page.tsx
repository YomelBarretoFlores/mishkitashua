"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Headphones,
  Home,
  Star,
  Send,
} from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  status: string;
  createdAt: string;
  customer: { name: string; address: string; city: string };
  items: { productName: string; quantity: number; price: number }[];
  review: { rating: number } | null;
};

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSent, setReviewSent] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        if (data.review) setReviewSent(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  const submitReview = async () => {
    if (!order || rating === 0) return;
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, rating, comment }),
    });
    setReviewSent(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-16 py-24 text-center">
        <p className="text-on-surface-variant">Cargando tu pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-16 py-24 text-center">
        <CheckCircle size={40} className="text-caramel mx-auto mb-6" />
        <h1
          className="text-3xl md:text-5xl font-medium text-cocoa-deep mb-4"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          ¡Gracias por tu compra!
        </h1>
        <p className="text-on-surface-variant mb-8">
          Tu pedido ha sido procesado exitosamente.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-7 py-4 rounded-lg"
        >
          Volver al inicio
          <Home size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-16 py-16 md:py-24">
      {/* Success Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-caramel-light/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-caramel" />
        </div>
        <h1
          className="text-3xl md:text-5xl font-medium text-cocoa-deep mb-4"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          ¡Gracias por tu compra!
        </h1>
        <span className="inline-block bg-cream-dark border border-cream-darker text-sm font-semibold text-cocoa-deep px-4 py-2 rounded-full mb-4">
          Orden #{order.orderNumber}
        </span>
        <p className="text-on-surface-variant max-w-lg mx-auto">
          Estamos preparando tus dulces con mucho cariño. Puedes hacer
          seguimiento de tu pedido con el número de orden.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        {/* Order Summary */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-cream-darker/60 p-6">
          <h2
            className="text-lg font-semibold text-cocoa-deep mb-4"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Tu Selección
          </h2>
          <div className="space-y-3 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-on-surface-variant">
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium text-cocoa-deep">
                  S/ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-cream-darker pt-3 space-y-1">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>S/ {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Costo de Envío</span>
              <span>S/ {order.shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-cocoa-deep pt-2">
              <span>Total</span>
              <span className="text-caramel">
                S/ {order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-cream-darker/60 p-6">
            <h3 className="text-sm font-semibold text-caramel tracking-widest uppercase mb-4">
              Detalles de Entrega
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Calendar size={16} className="text-cocoa shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-taupe uppercase">
                    Fecha Estimada
                  </p>
                  <p className="text-sm text-cocoa-deep font-medium">
                    3 a 5 días hábiles
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin size={16} className="text-cocoa shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-taupe uppercase">
                    Dirección
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {order.customer.address}, {order.customer.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-cream-dark rounded-2xl p-5">
            <div className="flex gap-3 items-start">
              <Headphones size={18} className="text-caramel shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-cocoa-deep text-sm mb-1">
                  ¿Necesitas ayuda?
                </p>
                <p className="text-xs text-on-surface-variant mb-2">
                  Contáctanos mencionando tu número de pedido.
                </p>
                <Link
                  href="/contacto"
                  className="text-xs font-semibold text-caramel hover:underline"
                >
                  Contactar Soporte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review */}
      <div className="bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8 mb-8">
        <h2
          className="text-lg font-semibold text-cocoa-deep mb-2"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          ¿Cómo fue tu experiencia?
        </h2>
        <p className="text-sm text-on-surface-variant mb-5">
          Tu opinión nos ayuda a mejorar.
        </p>

        {reviewSent ? (
          <div className="flex items-center gap-3 text-green-700 bg-green-50 rounded-lg p-4">
            <Send size={18} />
            <span className="text-sm font-medium">
              ¡Gracias por tu reseña!
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-label={`Calificar ${s} estrella${s > 1 ? "s" : ""}`}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      s <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Cuéntanos tu experiencia (opcional)"
              className="w-full px-4 py-3 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa resize-none"
            />
            <button
              onClick={submitReview}
              disabled={rating === 0}
              className="bg-cocoa text-white font-semibold px-6 py-3 rounded-lg hover:bg-cocoa-deep transition-colors disabled:opacity-40"
            >
              Enviar reseña
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href={`/seguimiento?q=${order.orderNumber}`}
          className="inline-flex items-center gap-2 border-2 border-cocoa text-cocoa-deep font-semibold px-6 py-3 rounded-lg hover:bg-cocoa hover:text-white transition-colors"
        >
          Seguir mi pedido
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-6 py-3 rounded-lg hover:bg-cocoa-deep transition-colors"
        >
          Volver al inicio
          <Home size={18} />
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-5 py-24 text-center">
          <p className="text-on-surface-variant">Cargando...</p>
        </div>
      }
    >
      <ConfirmacionContent />
    </Suspense>
  );
}
