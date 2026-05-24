import type { Metadata } from "next";
import Image from "next/image";
import { Leaf, ClipboardList, PackageCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Nuestra Historia",
  description:
    "Conoce el legado de Mishkitashua: tradición, ingredientes andinos y el arte de la repostería artesanal desde Huaraz, Áncash.",
  openGraph: {
    title: "Nuestra Historia | Mishkitashua",
    description:
      "Un legado de calidez, tradición y la búsqueda de la repostería perfecta desde los Andes peruanos.",
    images: [
      { url: "/images/banner-hero-2.png", width: 1200, height: 630 },
    ],
  },
};

const timeline = [
  {
    year: "2024",
    title: "Nace la idea",
    text: "Se plantea una propuesta de repostería andina basada en el uso de insumos regionales y sabores diferenciados.",
    side: "right" as const,
  },
  {
    year: "2025",
    title: "Se define el portafolio",
    text: "Se estructuran dos líneas de producto: alfajores andinos y manjares saborizados de tuna, aguaymanto y muña.",
    side: "left" as const,
  },
  {
    year: "2026",
    title: "Proyección comercial",
    text: "Mishkitashua se consolida como una marca con presentaciones definidas, envases comerciales, canales digitales y enfoque hacia una producción organizada por lotes.",
    side: "right" as const,
  },
];

export default function NosotrosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src="/images/banner-hero-2.png"
          alt="Nuestra Historia"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-deep/70 via-cocoa-deep/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-5">
          <div>
            <h1
              className="text-4xl md:text-6xl font-medium text-white mb-4 italic"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Sobre Mishkitashua
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Sabores andinos en una propuesta moderna.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="#fbf9f1" />
          </svg>
        </div>
      </section>

      {/* Sobre Mishkitashua */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-sm font-semibold text-caramel tracking-widest uppercase mb-3">
              Sobre Mishkitashua
            </p>
            <h2
              className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-6"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Sabores andinos en una propuesta moderna
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Mishkitashua nace como una marca peruana de repostería andina que
              transforma insumos representativos de los Andes en productos
              dulces, atractivos y listos para el mercado.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              Nuestro portafolio está conformado por dos líneas principales:
              alfajores andinos y manjares saborizados, desarrollados en tres
              sabores: tuna, aguaymanto y muña. Cada producto combina identidad
              regional, presentación cuidada y una experiencia de consumo
              diferente.
            </p>

            <h3
              className="text-xl font-semibold text-cocoa-deep mb-3"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Nuestra esencia
            </h3>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Mishkitashua busca revalorar ingredientes andinos como la mashua
              negra, la tuna, el aguaymanto y la muña, integrándolos en
              productos dulces con mayor valor agregado.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              La marca no solo se enfoca en ofrecer un sabor distinto, sino
              también en construir una propuesta visual, comercial y productiva
              coherente. Por eso, cada alfajor y cada manjar ha sido pensado
              desde su formulación hasta su empaque, cuidando el sabor, la
              textura, el color y la presentación final.
            </p>

            <h3
              className="text-xl font-semibold text-cocoa-deep mb-3"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              De los Andes al mercado
            </h3>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Mishkitashua une tradición e innovación en una línea de productos
              pensada para consumidores que buscan algo diferente: dulces con
              identidad peruana, sabores reconocibles y una presentación moderna.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Nuestros alfajores se elaboran con tapas a base de harina de
              mashua negra y rellenos de manjar saborizado. Los manjares, por su
              parte, se presentan en frascos de 300 g como productos
              independientes, ideales para untar, acompañar postres o utilizar en
              repostería.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden sticky top-24">
            <Image
              src="/images/marca-catalogo.png"
              alt="Portafolio Mishkitashua"
              width={800}
              height={800}
              className="w-full h-auto"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-16">
          <h2
            className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-2 text-center italic"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Nuestra Trayectoria
          </h2>
          <div className="w-12 h-0.5 bg-caramel mx-auto mb-16" />

          {/* Desktop Timeline */}
          <div className="hidden md:block relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cream-darker -translate-x-1/2" />

            <div className="space-y-16">
              {timeline.map((item) => (
                <div key={item.year} className="relative flex items-start">
                  {/* Left card */}
                  {item.side === "left" ? (
                    <div className="w-[calc(50%-32px)] pr-4">
                      <div className="bg-cream-dark rounded-xl p-6 border border-cream-darker/60">
                        <h3
                          className="text-xl font-semibold text-cocoa-deep mb-2"
                          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                        >
                          {item.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-[calc(50%-32px)]" />
                  )}

                  {/* Year circle */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-caramel-light/30 border-2 border-caramel-light flex items-center justify-center z-10">
                    <span
                      className="text-sm font-semibold text-cocoa-deep"
                      style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                    >
                      {item.year}
                    </span>
                  </div>

                  {/* Right card */}
                  {item.side === "right" ? (
                    <div className="w-[calc(50%-32px)] ml-auto pl-4">
                      <div className="bg-cream-dark rounded-xl p-6 border border-cream-darker/60">
                        <h3
                          className="text-xl font-semibold text-cocoa-deep mb-2"
                          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                        >
                          {item.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-[calc(50%-32px)]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden relative pl-10">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-cream-darker" />

            <div className="space-y-10">
              {timeline.map((item) => (
                <div key={item.year} className="relative">
                  {/* Year circle */}
                  <div className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-caramel-light/30 border-2 border-caramel-light flex items-center justify-center z-10">
                    <span className="text-[10px] font-semibold text-cocoa-deep">
                      {item.year}
                    </span>
                  </div>
                  <div className="bg-cream-dark rounded-xl p-5 border border-cream-darker/60">
                    <h3
                      className="text-lg font-semibold text-cocoa-deep mb-2"
                      style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="bg-cream py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-16">
          <h2
            className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-4 text-center"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Calidad que se nota en cada presentación
          </h2>
          <p className="text-on-surface-variant text-center max-w-2xl mx-auto mb-14">
            En Mishkitashua cuidamos la selección de ingredientes, el sabor,
            la textura y la presentación de cada producto. Buscamos que cada
            alfajor y cada manjar mantenga una experiencia uniforme, atractiva
            y confiable para nuestros clientes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
              <div className="w-14 h-14 bg-caramel-light/25 rounded-full flex items-center justify-center mx-auto mb-5">
                <Leaf className="text-caramel" size={26} />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-3"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Ingredientes andinos
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Trabajamos con comunidades andinas para obtener la mashua negra,
                tuna, el aguaymanto y la muña, resaltando ingredientes
                representativos de nuestra identidad regional.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
              <div className="w-14 h-14 bg-caramel-light/25 rounded-full flex items-center justify-center mx-auto mb-5">
                <ClipboardList className="text-caramel" size={26} />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-3"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Proceso estandarizado
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Nuestros productos se elaboran mediante formulaciones definidas,
                producción por lotes y criterios de uniformidad.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
              <div className="w-14 h-14 bg-caramel-light/25 rounded-full flex items-center justify-center mx-auto mb-5">
                <PackageCheck className="text-caramel" size={26} />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-3"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Empaques con propósito
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Cuidamos cada presentación con empaques funcionales, atractivos
                y pensados para reducir el impacto ambiental.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
