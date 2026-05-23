import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Snowflake, Leaf, Truck, Store, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes y Envíos",
};

export default function AyudaPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-16 py-12 md:py-20">
      {/* Header */}
      <div className="text-center mb-14">
        <h1
          className="text-3xl md:text-[64px] font-medium text-cocoa-deep mb-4"
          style={{
            fontFamily: "var(--font-eb-garamond), serif",
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
          }}
        >
          Preguntas Frecuentes y Envíos
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto">
          Todo lo que necesitas saber sobre el cuidado, envío y origen de
          nuestros alfajores artesanales andinos.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conservation - 8 cols */}
        <div className="lg:col-span-8 bg-cream-dark rounded-2xl p-6 md:p-8">
          <div className="flex gap-3 items-start mb-6">
            <div className="w-10 h-10 bg-cocoa/10 rounded-full flex items-center justify-center shrink-0">
              <Snowflake size={20} className="text-cocoa" />
            </div>
            <h2
              className="text-xl md:text-2xl font-semibold text-cocoa-deep"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              ¿Cómo se conservan los alfajores?
            </h2>
          </div>

          <p className="text-on-surface-variant leading-relaxed mb-6">
            Nuestros alfajores artesanales están elaborados sin conservantes
            artificiales para mantener su sabor puro y textura ideal.
          </p>

          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              <span className="text-cocoa-deep font-semibold">
                Temperatura Ambiente:
              </span>{" "}
              Recomendamos mantenerlos en un lugar fresco y seco, lejos de la
              luz solar directa. Así conservarán su frescura óptima durante 15
              días.
            </p>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              <span className="text-cocoa-deep font-semibold">
                Refrigeración:
              </span>{" "}
              Si vives en un clima muy cálido o deseas extender su vida útil
              hasta 30 días, puedes guardarlos en el refrigerador dentro de un
              recipiente hermético. Sugerimos dejarlos a temperatura ambiente 15
              minutos antes de consumir para que el dulce de leche recupere su
              cremosidad.
            </p>
          </div>
        </div>

        {/* Shipping - 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-cream-darker/60 p-6">
          <div className="flex gap-3 items-start mb-5">
            <Truck size={22} className="text-caramel shrink-0 mt-0.5" />
            <h3
              className="text-lg font-semibold text-cocoa-deep"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Tiempos de envío nacional
            </h3>
          </div>

          <div className="space-y-4 mb-5">
            <div>
              <h4 className="font-semibold text-cocoa-deep text-sm mb-1">
                Lima Metropolitana
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Entregas en 24 a 48 horas hábiles tras la confirmación del
                pedido.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-cocoa-deep text-sm mb-1">
                Provincias (Nivel Nacional)
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Envíos a través de agencias asociadas. Tiempo estimado de 3 a 5
                días hábiles, dependiendo del destino.
              </p>
            </div>
          </div>

          {/* Packaging note */}
          <div className="bg-cream rounded-xl p-4 border border-cream-darker/40">
            <div className="flex gap-2 items-start">
              <Info
                size={16}
                className="text-on-surface-variant shrink-0 mt-0.5"
              />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Preparamos los envíos a provincia en embalajes especiales
                termoaislantes para garantizar que el producto llegue en
                perfectas condiciones, protegiendo el delicado chocolate y el
                dulce de leche de los cambios bruscos de temperatura.
              </p>
            </div>
          </div>
        </div>

        {/* Ingredients - 8 cols with image */}
        <div className="lg:col-span-8 bg-cream-dark rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
            <div>
              <div className="flex gap-3 items-start mb-5">
                <div className="w-10 h-10 bg-cocoa/10 rounded-full flex items-center justify-center shrink-0">
                  <Leaf size={20} className="text-cocoa" />
                </div>
                <h2
                  className="text-xl md:text-2xl font-semibold text-cocoa-deep"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Ingredientes de origen andino
                </h2>
              </div>

              <p className="text-on-surface-variant leading-relaxed mb-6">
                La esencia de Mishkitashua radica en la riqueza de los Andes.
                Seleccionamos cuidadosamente cada insumo, trabajando
                directamente con comunidades locales para garantizar prácticas
                sostenibles y un sabor auténtico que honra nuestras raíces.
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "Maca Peruana",
                  "Quinua Real",
                  "Cacao Amazónico",
                  "Sal de Maras",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="bg-white text-cocoa-deep text-sm font-medium px-4 py-2 rounded-full border border-cream-darker/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative h-[200px] md:h-full rounded-xl overflow-hidden hidden md:block">
              <Image
                src="/images/alfajores-surtidos.jpg"
                alt="Ingredientes andinos"
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
          </div>
        </div>

        {/* Wholesale - 4 cols */}
        <div className="lg:col-span-4 bg-cocoa rounded-2xl p-6 text-white flex flex-col">
          <div className="flex gap-3 items-start mb-4">
            <Store size={20} className="text-caramel-light shrink-0 mt-0.5" />
            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Ventas al por mayor
            </h3>
          </div>
          <p className="text-sm text-white/80 leading-relaxed mb-4 flex-grow">
            ¿Interesado en distribuir nuestros productos en tu cafetería, tienda
            boutique o para eventos corporativos? Ofrecemos condiciones
            especiales para compras por volumen.
          </p>
          <Link
            href="/contacto"
            className="text-sm font-semibold text-caramel-light hover:underline"
          >
            Solicitar catálogo corporativo
          </Link>
        </div>
      </div>
    </div>
  );
}
