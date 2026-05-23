import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Snowflake, Leaf, Truck, Store, Info, AlertTriangle } from "lucide-react";
import { faqJsonLd } from "@/app/lib/jsonld";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes y Envíos",
  description:
    "Todo sobre conservación, ingredientes, pedidos y envíos de nuestros alfajores andinos y manjares saborizados Mishkitashua.",
  openGraph: {
    title: "Preguntas Frecuentes y Envíos | Mishkitashua",
    description:
      "Conservación, ingredientes, pedidos y envíos de alfajores y manjares Mishkitashua.",
  },
};

export default function AyudaPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-16 py-12 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      {/* Header */}
      <div className="text-center mb-6">
        <h1
          className="text-3xl md:text-[64px] font-medium text-cocoa-deep mb-4"
          style={{
            fontFamily: "var(--font-eb-garamond), serif",
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
          }}
        >
          Preguntas frecuentes y envíos
        </h1>
        <p
          className="text-on-surface-variant font-medium mb-2"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          Todo lo que necesitas saber sobre nuestros productos
        </p>
      </div>
      <p className="text-on-surface-variant max-w-3xl mx-auto text-center mb-14">
        Encuentra información sobre la conservación, ingredientes, pedidos y
        envíos de nuestros alfajores andinos y manjares saborizados
        Mishkitashua.
      </p>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conservation alfajores - 8 cols */}
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

          <p className="text-on-surface-variant leading-relaxed mb-4">
            Nuestros alfajores deben conservarse en un lugar fresco, seco y
            protegido de la luz solar directa. Para mantener mejor su textura y
            presentación, se recomienda conservarlos en su empaque original hasta
            el momento de consumo.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            Una vez abierto el empaque, consumir en el menor tiempo posible y
            evitar la exposición a humedad, calor o manipulación directa.
          </p>
        </div>

        {/* Conservation manjares - 4 cols */}
        <div className="lg:col-span-4 bg-cream-dark rounded-2xl p-6 md:p-8">
          <div className="flex gap-3 items-start mb-5">
            <div className="w-10 h-10 bg-cocoa/10 rounded-full flex items-center justify-center shrink-0">
              <Snowflake size={20} className="text-cocoa" />
            </div>
            <h3
              className="text-lg font-semibold text-cocoa-deep"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              ¿Cómo se conservan los manjares saborizados?
            </h3>
          </div>

          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
            Los manjares Mishkitashua deben mantenerse cerrados, en un lugar
            fresco y seco. Después de abrir el frasco, se recomienda refrigerar
            el producto y consumirlo dentro del periodo indicado en la etiqueta.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Esta recomendación aplica para nuestras tres variedades: Tunaluna,
            Sol Aguaymanto y Muña Andina.
          </p>
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
                La identidad de Mishkitashua se basa en insumos representativos
                de los Andes peruanos. Nuestra propuesta utiliza harina de
                mashua negra para la línea de alfajores y sabores diferenciados
                a base de tuna roja, aguaymanto y muña para los manjares y
                rellenos.
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "Mashua negra",
                  "Tuna roja",
                  "Aguaymanto",
                  "Muña",
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

        {/* Allergens - 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-cream-darker/60 p-6">
          <div className="flex gap-3 items-start mb-5">
            <AlertTriangle size={20} className="text-caramel shrink-0 mt-0.5" />
            <h3
              className="text-lg font-semibold text-cocoa-deep"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              ¿Los productos contienen alérgenos?
            </h3>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Sí. Nuestros productos contienen ingredientes de origen lácteo. Los
            alfajores también pueden contener gluten y huevo, debido a la
            composición de sus tapas. Recomendamos revisar siempre la etiqueta
            antes de consumir.
          </p>
        </div>

        {/* Shipping - 8 cols */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8">
          <div className="flex gap-3 items-start mb-5">
            <Truck size={22} className="text-caramel shrink-0 mt-0.5" />
            <h3
              className="text-lg font-semibold text-cocoa-deep"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Tiempos de envío nacional
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
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

          <div className="bg-cream rounded-xl p-4 border border-cream-darker/40">
            <div className="flex gap-2 items-start">
              <Info
                size={16}
                className="text-on-surface-variant shrink-0 mt-0.5"
              />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Preparamos los envíos a provincia en embalajes especiales
                termoaislantes para garantizar que el producto llegue en
                perfectas condiciones.
              </p>
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
