import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, ClipboardList, PackageCheck } from "lucide-react";
import HeroHome from "@/app/components/HeroHome";
import Reveal from "@/app/components/Reveal";

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
            {/* Hero cinematográfico */}
            <HeroHome />

            {/* Categories */}
            <section className="bg-white py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-5 md:px-16">
                    <Reveal className="text-center mb-14">
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
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Alfajores — full card */}
                        <Reveal className="flex" direction="up">
                        <Link
                            href="/productos#alfajores"
                            className="group rounded-2xl overflow-hidden bg-white border border-cream-darker/60 hover:shadow-lg transition-shadow flex flex-col w-full"
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
                        </Reveal>

                        {/* Manjares */}
                        <Reveal className="flex" direction="up" delay={0.12}>
                        <Link
                            href="/productos#manjares"
                            className="group rounded-2xl overflow-hidden bg-white border border-cream-darker/60 hover:shadow-lg transition-shadow flex flex-col w-full"
                        >
                            <div className="overflow-hidden">
                                <Image
                                    src="/images/manjares-frascos-madera.png"
                                    alt="Manjares saborizados Mishkitashua: Tunaluna, Muña Andina y Sol Aguaymanto"
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
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Historia / Herencia andina */}
            <section className="relative overflow-hidden bg-cocoa-deep text-white">
                <div className="max-w-7xl mx-auto px-5 md:px-16 py-20 md:py-28">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <Reveal direction="right">
                            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                                <Image
                                    src="/images/manjares-frascos-madera.png"
                                    alt="Manjares Mishkitashua elaborados con ingredientes de los Andes"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </div>
                        </Reveal>

                        <Reveal direction="left" delay={0.1}>
                            <p className="text-sm font-semibold text-caramel-light tracking-widest uppercase mb-4">
                                Nuestra esencia
                            </p>
                            <h2
                                className="text-3xl md:text-5xl font-medium leading-tight mb-6"
                                style={{
                                    fontFamily:
                                        "var(--font-eb-garamond), serif",
                                }}
                            >
                                Del corazón de los Andes a tu mesa
                            </h2>
                            <p className="text-cream/80 text-lg leading-relaxed mb-5">
                                Cada alfajor y cada manjar nace de la riqueza de
                                nuestra tierra: la tuna que florece en las
                                alturas, el aguaymanto dorado por el sol andino y
                                la muña que perfuma nuestros valles. No vendemos
                                solo dulces, compartimos la memoria de un
                                territorio.
                            </p>
                            <p className="text-cream/80 text-lg leading-relaxed mb-8">
                                Trabajamos de la mano de comunidades andinas,
                                honrando recetas y saberes que pasan de
                                generación en generación. Tradición, color y
                                sabor en cada bocado.
                            </p>
                            <Link
                                href="/nosotros"
                                className="inline-flex items-center gap-2 text-caramel-light font-semibold hover:text-caramel-dim transition-colors"
                            >
                                Conoce nuestra historia
                                <ArrowRight size={18} />
                            </Link>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Value Proposition */}
            <section className="bg-cream py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-5 md:px-16">
                    <Reveal className="text-center mb-14">
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
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Reveal className="flex">
                        <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40 w-full">
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
                        </Reveal>

                        <Reveal className="flex" delay={0.12}>
                        <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40 w-full">
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
                        </Reveal>

                        <Reveal className="flex" delay={0.24}>
                        <div className="bg-white rounded-2xl p-8 text-center border border-cream-darker/40 w-full">
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
                        </Reveal>
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
                <Reveal className="relative max-w-7xl mx-auto px-5 md:px-16 py-20 md:py-28 text-center">
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
                </Reveal>
            </section>
        </>
    );
}
