import type { Metadata } from "next";
import Image from "next/image";
import { Leaf, MapPin, Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "Nuestra Historia",
  description:
    "Conoce el legado de Mishkitashua: tradición, ingredientes andinos y el arte de la repostería artesanal desde Huaraz, Áncash.",
  openGraph: {
    title: "Nuestra Historia | Mishkitashua",
    description:
      "Un legado de calidez, tradición y la búsqueda de la repostería perfecta desde los Andes peruanos.",
    images: [
      { url: "/images/alfajores-productos-light.jpg", width: 1200, height: 630 },
    ],
  },
};

const timeline = [
  {
    year: "2023",
    title: "La Primera Receta",
    text: "Comenzamos experimentando con recetas familiares de manjar, buscando incorporar sabores únicos de los Andes peruanos.",
    side: "right" as const,
  },
  {
    year: "2024",
    title: "Perfeccionando el Arte",
    text: "Viajamos por los Andes para perfeccionar el arte del manjar saborizado, seleccionando los mejores insumos: tuna, aguaymanto y muña.",
    side: "left" as const,
  },
  {
    year: "2025",
    title: "Mishkitashua Nace",
    text: "Lanzamos oficialmente nuestra marca con dos líneas de producto: Alfajores Andinos Surtidos y Manjares Saborizados en tres sabores únicos.",
    side: "right" as const,
  },
];

export default function NosotrosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src="/images/alfajores-productos-light.jpg"
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
              Nuestra Historia
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Un legado de calidez, tradición y la búsqueda de la repostería
              perfecta.
            </p>
          </div>
        </div>
      </section>

      {/* Heritage */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-6"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Nuestra Herencia
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Todo comenzó con una receta sencilla transmitida de generación en
              generación. Nuestra fundadora creyó que la verdadera artesanía no
              puede apresurarse. Cada pliegue de masa, cada medida precisa de
              manjar y cada cuidadosa vigilancia del horno es un testimonio de la
              dedicación de nuestra familia al oficio.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              No solo horneamos; preservamos memorias. La calidez que sientes al
              descubrir nuestros productos es la misma calidez que llenaba la
              cocina de nuestra abuela. Utilizamos solo los mejores ingredientes
              naturales, asegurando que cada bocado cuente una historia de
              autenticidad y amor.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="/images/portafolio-mishkitashua.jpg"
              alt="Portafolio Mishkitashua"
              fill
              className="object-cover"
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
            Nuestro Compromiso
          </h2>
          <p className="text-on-surface-variant text-center max-w-2xl mx-auto mb-14">
            Creemos que el sabor excepcional proviene de estándares sin
            concesiones.
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
                Ingredientes Puros
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Obtenemos solo los mejores insumos naturales: tuna silvestre,
                aguaymanto orgánico y muña de altura.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
              <div className="w-14 h-14 bg-caramel-light/25 rounded-full flex items-center justify-center mx-auto mb-5">
                <MapPin className="text-caramel" size={26} />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-3"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Origen Local
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Colaboramos con comunidades andinas locales para apoyar
                prácticas sostenibles y garantizar la frescura.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
              <div className="w-14 h-14 bg-caramel-light/25 rounded-full flex items-center justify-center mx-auto mb-5">
                <Cookie className="text-caramel" size={26} />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-3"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Artesanía Diaria
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Cada pieza se elabora a mano y en pequeños lotes para garantizar
                la textura y el sabor perfectos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
