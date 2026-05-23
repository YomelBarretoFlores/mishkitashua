import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Mountain, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Mishkitashua — Sabores que nacen de nuestra tierra",
  description:
    "Repostería artesanal andina. Alfajores y manjares saborizados con ingredientes de los Andes peruanos: Tunaluna, Sol Aguaymanto y Muña Andina.",
  openGraph: {
    title: "Mishkitashua — Sabores que nacen de nuestra tierra",
    description:
      "Alfajores artesanales y manjares saborizados de los Andes peruanos.",
    images: [
      {
        url: "/images/tres-sabores-poster.jpg",
        width: 1200,
        height: 630,
        alt: "Mishkitashua — Tres sabores, una misma identidad",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="max-w-7xl mx-auto px-5 md:px-16 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-caramel tracking-widest uppercase mb-4">
                Sabores que nacen de nuestra tierra
              </p>
              <h1
                className="text-4xl md:text-6xl font-medium text-cocoa-deep leading-tight mb-6"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Repostería andina con identidad propia
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed mb-8 max-w-lg">
                Alfajores artesanales y manjares saborizados elaborados con
                ingredientes seleccionados de los Andes peruanos. Tres sabores,
                una misma identidad.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-cocoa-deep transition-colors"
                >
                  Explorar Productos
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/nosotros"
                  className="inline-flex items-center gap-2 border-2 border-cocoa text-cocoa-deep font-semibold px-7 py-3.5 rounded-lg hover:bg-cocoa hover:text-white transition-colors"
                >
                  Nuestra Historia
                </Link>
              </div>
            </div>

            <div className="relative aspect-square max-w-lg mx-auto lg:mx-0">
              <Image
                src="/images/tres-sabores-poster.jpg"
                alt="Productos Mishkitashua - Tres sabores, una misma identidad"
                fill
                className="object-cover rounded-3xl"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-16">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-4"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Dos líneas de producto
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Descubre nuestra repostería artesanal andina, donde cada producto
              cuenta la historia de los Andes peruanos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              href="/productos#alfajores"
              className="group relative rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <Image
                src="/images/alfajores-poster.jpg"
                alt="Alfajores Andinos Surtidos"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3
                  className="text-2xl md:text-3xl font-medium text-white mb-2"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Alfajores Andinos Surtidos
                </h3>
                <p className="text-white/80 text-sm mb-3">
                  3 sabores surtidos · 2 por sabor · Caja x 6 unidades
                </p>
                <span className="inline-flex items-center gap-1 text-caramel-light text-sm font-semibold">
                  Ver producto <ArrowRight size={16} />
                </span>
              </div>
            </Link>

            <Link
              href="/productos#manjares"
              className="group relative rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <Image
                src="/images/manjares-saborizados.jpg"
                alt="Manjares Saborizados"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3
                  className="text-2xl md:text-3xl font-medium text-white mb-2"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Manjares Saborizados
                </h3>
                <p className="text-white/80 text-sm mb-3">
                  Tres sabores que nacen de nuestra tierra · 300g
                </p>
                <span className="inline-flex items-center gap-1 text-caramel-light text-sm font-semibold">
                  Ver colección <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-cream py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-16">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-4"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Nuestro Compromiso
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Creemos que el sabor excepcional proviene de estándares sin
              concesiones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
              <div className="w-14 h-14 bg-cream-dark rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Leaf className="text-caramel" size={26} />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-3"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Ingredientes Seleccionados
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Trabajamos directamente con comunidades andinas para obtener los
                mejores insumos: tuna, aguaymanto, muña y más.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
              <div className="w-14 h-14 bg-cream-dark rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mountain className="text-caramel" size={26} />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-3"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Hecho en los Andes
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Cada producto se elabora con orgullo en los Andes peruanos,
                honrando recetas y técnicas tradicionales.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
              <div className="w-14 h-14 bg-cream-dark rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Heart className="text-caramel" size={26} />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-3"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Sabores Auténticos
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Sin conservantes artificiales. Textura suave y cremosa en cada
                manjar, crocante perfecto en cada alfajor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-reposteria.jpg"
            alt="Mishkitashua productos"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-cocoa-deep/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 md:px-16 py-20 md:py-28 text-center">
          <h2
            className="text-3xl md:text-5xl font-medium text-white mb-4"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Disfruta lo mejor de los Andes
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Haz tu pedido y recibe nuestros productos artesanales directamente
            en tu puerta.
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-caramel-light text-cocoa-deep font-semibold px-8 py-4 rounded-lg hover:bg-caramel-dim transition-colors"
          >
            Comprar Ahora
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
