import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Headphones,
  Home,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Confirmación de Pedido",
  description: "Tu pedido ha sido confirmado. Gracias por tu compra.",
  robots: { index: false, follow: false },
};

export default function ConfirmacionPage() {
  const orderNumber = `MSK-${Math.floor(10000 + Math.random() * 90000)}`;

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
          Orden #{orderNumber}
        </span>
        <p className="text-on-surface-variant max-w-lg mx-auto">
          Estamos horneando y preparando tus dulces con mucho cariño. Enviaremos
          un correo de confirmación con los detalles de tu envío en breve.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Delivery Details */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8">
            <h2 className="text-sm font-semibold text-caramel tracking-widest uppercase mb-6">
              Detalles de Entrega
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-cocoa" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-taupe uppercase tracking-wide mb-1">
                    Fecha Estimada
                  </p>
                  <p className="font-semibold text-cocoa-deep">
                    3 a 5 días hábiles
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Entre 09:00 AM y 06:00 PM
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-cocoa" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-taupe uppercase tracking-wide mb-1">
                    Dirección de Envío
                  </p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    La dirección proporcionada en tu formulario de pedido.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="md:col-span-5">
          <div className="bg-cream-dark rounded-2xl p-6">
            <div className="flex gap-3 items-start">
              <Headphones size={20} className="text-caramel shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-cocoa-deep mb-1">
                  ¿Necesitas ayuda?
                </h3>
                <p className="text-sm text-on-surface-variant mb-3">
                  Si tienes preguntas sobre tu orden, contáctanos mencionando tu
                  número de pedido.
                </p>
                <Link
                  href="/contacto"
                  className="text-sm font-semibold text-caramel hover:underline"
                >
                  Contactar Soporte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Home */}
      <div className="text-center mt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-7 py-4 rounded-lg hover:bg-cocoa-deep transition-colors"
        >
          Volver al inicio
          <Home size={18} />
        </Link>
      </div>
    </div>
  );
}
