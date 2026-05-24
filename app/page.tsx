import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, ClipboardList, PackageCheck } from "lucide-react";

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
                url: "/images/marca-todos-productos.png",
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
                                style={{
                                    fontFamily:
                                        "var(--font-eb-garamond), serif",
                                }}
                            >
                                Repostería andina con identidad propia
                            </h1>
                            <p className="text-lg text-on-surface-variant leading-relaxed mb-8 max-w-lg">
                                Alfajores y manjares inspirados en los Andes
                                peruanos, elaborados con sabores de tuna,
                                aguaymanto y muña. Una propuesta moderna,
                                innovadora y lista para disfrutar en cualquier
                                ocasión.
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

                        <div className="relative aspect-[3/4] max-w-lg mx-auto lg:mx-0">
                            <Image
                                src="/images/marca-todos-productos.png"
                                alt="Productos Mishkitashua - Tres sabores, una misma identidad"
                                fill
                                className="object-contain rounded-3xl"
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
                            style={{
                                fontFamily: "var(--font-eb-garamond), serif",
                            }}
                        >
                            Dos líneas, una misma identidad
                        </h2>
                        <p className="text-on-surface-variant max-w-2xl mx-auto">
                            Mishkitashua reúne alfajores andinos y manjares
                            saborizados en una propuesta dulce, moderna y con
                            identidad regional. Cada producto combina sabores
                            representativos de los Andes con una presentación
                            cuidada, ideal para consumo personal, regalo o venta
                            comercial.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Alfajores — full card */}
                        <Link
                            href="/productos#alfajores"
                            className="group rounded-2xl overflow-hidden bg-white border border-cream-darker/60 hover:shadow-lg transition-shadow flex flex-col"
                        >
                            <div className="overflow-hidden">
                                <Image
                                    src="/images/alfajores-caja-claro.png"
                                    alt="Alfajores Andinos"
                                    width={800}
                                    height={1000}
                                    className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                            <div className="p-6">
                                <h3
                                    className="text-2xl font-medium text-cocoa-deep mb-2"
                                    style={{
                                        fontFamily:
                                            "var(--font-eb-garamond), serif",
                                    }}
                                >
                                    Alfajores Andinos
                                </h3>
                                <p className="text-on-surface-variant text-sm mb-3">
                                    Caja surtida de 6 alfajores con tres
                                    sabores: tuna, aguaymanto y muña.
                                </p>
                                <span className="inline-flex items-center gap-1 text-caramel text-sm font-semibold">
                                    Ver producto <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>

                        {/* Manjares */}
                        <Link
                            href="/productos#manjares"
                            className="group rounded-2xl overflow-hidden bg-white border border-cream-darker/60 hover:shadow-lg transition-shadow flex flex-col"
                        >
                            <div className="overflow-hidden">
                                <Image
                                    src="/images/tres-manjares-fila.png"
                                    alt="Manjares Saborizados"
                                    width={800}
                                    height={1000}
                                    className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                            <div className="p-6">
                                <h3
                                    className="text-2xl font-medium text-cocoa-deep mb-2"
                                    style={{
                                        fontFamily:
                                            "var(--font-eb-garamond), serif",
                                    }}
                                >
                                    Manjares Saborizados
                                </h3>
                                <p className="text-on-surface-variant text-sm mb-3">
                                    Manjares de tuna, aguaymanto y muña en
                                    presentación de 300 g.
                                </p>
                                <span className="inline-flex items-center gap-1 text-caramel text-sm font-semibold">
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
                            style={{
                                fontFamily: "var(--font-eb-garamond), serif",
                            }}
                        >
                            Calidad que se nota en cada presentación
                        </h2>
                        <p className="text-on-surface-variant max-w-2xl mx-auto">
                            En Mishkitashua cuidamos la selección de
                            ingredientes, el sabor, la textura y la presentación
                            de cada producto. Buscamos que cada alfajor y cada
                            manjar mantenga una experiencia uniforme, atractiva
                            y confiable para nuestros clientes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
                            <div className="w-14 h-14 bg-cream-dark rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <Leaf className="text-caramel" size={26} />
                            </div>
                            <h3
                                className="text-xl font-semibold text-cocoa-deep mb-3"
                                style={{
                                    fontFamily:
                                        "var(--font-eb-garamond), serif",
                                }}
                            >
                                Ingredientes andinos
                            </h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                Trabajamos con comunidades andinas para obtener
                                la mashua negra, tuna, el aguaymanto y la muña,
                                resaltando ingredientes representativos de
                                nuestra identidad regional.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
                            <div className="w-14 h-14 bg-cream-dark rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <ClipboardList
                                    className="text-caramel"
                                    size={26}
                                />
                            </div>
                            <h3
                                className="text-xl font-semibold text-cocoa-deep mb-3"
                                style={{
                                    fontFamily:
                                        "var(--font-eb-garamond), serif",
                                }}
                            >
                                Proceso estandarizado
                            </h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                Nuestros productos se elaboran mediante
                                formulaciones definidas, producción por lotes y
                                criterios de uniformidad.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40">
                            <div className="w-14 h-14 bg-cream-dark rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <PackageCheck
                                    className="text-caramel"
                                    size={26}
                                />
                            </div>
                            <h3
                                className="text-xl font-semibold text-cocoa-deep mb-3"
                                style={{
                                    fontFamily:
                                        "var(--font-eb-garamond), serif",
                                }}
                            >
                                Empaques con propósito
                            </h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                Cuidamos cada presentación con empaques
                                funcionales, atractivos y pensados para reducir
                                el impacto ambiental.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/images/banner-hero-2.png"
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
                        Disfruta lo mejor de Mishkitashua
                    </h2>
                    <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                        Elige tus alfajores o manjares favoritos y descubre una
                        forma diferente de disfrutar los sabores andinos.
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
