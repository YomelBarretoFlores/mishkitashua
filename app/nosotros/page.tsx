import type { Metadata } from "next";
import Image from "next/image";
import {
  Leaf,
  ClipboardList,
  PackageCheck,
  Target,
  Eye,
  Heart,
  Sparkles,
  Users,
} from "lucide-react";
import Reveal from "@/app/components/Reveal";
import SectionNav, { type Section } from "@/app/components/SectionNav";
import Timeline from "@/app/nosotros/_components/Timeline";

export const metadata: Metadata = {
  title: "Nosotros",
  alternates: { canonical: "/nosotros" },
  description:
    "Quiénes somos, nuestra historia, esencia, misión, valores, ingredientes, proceso y empaques. Repostería andina desde Huaraz, Áncash.",
  openGraph: {
    title: "Nosotros | Mishkitashua",
    description:
      "Un legado de calidez, tradición y la búsqueda de la repostería perfecta desde los Andes peruanos.",
    images: [{ url: "/images/banner-hero-2.png", width: 1200, height: 630 }],
  },
};

// El índice lateral se arma desde aquí para que el orden del menú y el de las
// secciones no puedan desincronizarse.
const SECTIONS: Section[] = [
  { id: "quienes-somos", label: "Quiénes somos" },
  { id: "nuestra-historia", label: "Nuestra historia" },
  { id: "nuestra-esencia", label: "Nuestra esencia" },
  { id: "mision-vision", label: "Misión y visión" },
  { id: "valores", label: "Nuestros valores" },
  { id: "ingredientes", label: "Ingredientes y calidad" },
  { id: "proceso", label: "Nuestro proceso" },
  { id: "empaques", label: "Empaques con propósito" },
];

const VALORES = [
  {
    icon: Sparkles,
    title: "Identidad andina",
    text: "Trabajamos con insumos de nuestra región y los ponemos en valor, sin esconder de dónde vienen.",
  },
  {
    icon: PackageCheck,
    title: "Calidad",
    text: "Formulaciones definidas y control en cada lote, para que el sabor y la textura sean siempre los mismos.",
  },
  {
    icon: Leaf,
    title: "Sostenibilidad",
    text: "Empaques funcionales pensados para reducir el impacto y compras directas a productores de la zona.",
  },
  {
    icon: Heart,
    title: "Cercanía con el cliente",
    text: "Atención directa, respuesta rápida y una política de devoluciones clara y sin letra pequeña.",
  },
];

const PROCESO = [
  {
    step: "01",
    title: "Selección de insumos",
    text: "Se reciben la mashua negra, la tuna, el aguaymanto y la muña, y se revisa su estado antes de entrar a producción.",
  },
  {
    step: "02",
    title: "Formulación",
    text: "Cada receta sigue una formulación fija: proporciones, tiempos y temperaturas definidos por producto.",
  },
  {
    step: "03",
    title: "Elaboración por lotes",
    text: "Se produce en lotes identificables, lo que permite rastrear cualquier incidencia hasta su origen.",
  },
  {
    step: "04",
    title: "Control de calidad",
    text: "Se verifican sabor, textura, color y presentación. El lote que no cumple no sale a la venta.",
  },
  {
    step: "05",
    title: "Envasado y etiquetado",
    text: "Envasado en su presentación final con la información de ingredientes, alérgenos y consumo preferente.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src="/images/banner-hero-2.png"
          alt="Nosotros"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-deep/70 via-cocoa-deep/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-5">
          <Reveal>
            <h1
              className="text-4xl md:text-6xl font-medium text-white mb-4 italic"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Sobre Mishkitashua
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Sabores andinos en una propuesta moderna.
            </p>
          </Reveal>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
          >
            <path
              d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
              fill="#fbf9f1"
            />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 md:px-16 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-16 items-start">
          <SectionNav sections={SECTIONS} />

          {/* scroll-mt en cada sección: deja hueco para el navbar fijo al saltar */}
          <div className="min-w-0 space-y-16 md:space-y-24">
            {/* 1. Quiénes somos */}
            <section id="quienes-somos" className="scroll-mt-28">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                <Reveal direction="right">
                  <p className="text-sm font-semibold text-caramel tracking-widest uppercase mb-3">
                    Quiénes somos
                  </p>
                  <h2
                    className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-6"
                    style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                  >
                    Sabores andinos en una propuesta moderna
                  </h2>
                  <p className="text-on-surface-variant leading-relaxed mb-4">
                    Mishkitashua es un emprendimiento peruano de repostería
                    andina con base en Huaraz, Áncash. Transformamos
                    ingredientes representativos de los Andes en productos
                    dulces con identidad cultural, atractivos y listos para el
                    mercado.
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Nuestro portafolio está conformado por dos líneas
                    principales: alfajores andinos y manjares saborizados,
                    desarrollados en tres sabores: tuna, aguaymanto y muña. Cada
                    producto combina identidad regional, presentación cuidada y
                    una experiencia de consumo diferente.
                  </p>
                </Reveal>
                <Reveal direction="left" delay={0.1}>
                  <div className="rounded-2xl overflow-hidden">
                    <Image
                      src="/images/marca-catalogo.png"
                      alt="Portafolio Mishkitashua"
                      width={800}
                      height={800}
                      className="w-full h-auto"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </Reveal>
              </div>
            </section>

            {/* 2. Nuestra historia */}
            <section id="nuestra-historia" className="scroll-mt-28">
              <Reveal>
                <p className="text-sm font-semibold text-caramel tracking-widest uppercase mb-3">
                  Nuestra historia
                </p>
                <h2
                  className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-6"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Nuestra trayectoria
                </h2>
                <p className="text-on-surface-variant leading-relaxed mb-10 max-w-2xl">
                  Mishkitashua une tradición e innovación en una línea de
                  productos pensada para consumidores que buscan algo diferente:
                  dulces con identidad peruana, sabores reconocibles y una
                  presentación moderna.
                </p>
              </Reveal>
              <Timeline />
            </section>

            {/* 3. Nuestra esencia */}
            <section id="nuestra-esencia" className="scroll-mt-28">
              <Reveal>
                <p className="text-sm font-semibold text-caramel tracking-widest uppercase mb-3">
                  Nuestra esencia
                </p>
                <h2
                  className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-6"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Qué representa la marca
                </h2>
                <div className="max-w-2xl space-y-4">
                  <p className="text-on-surface-variant leading-relaxed">
                    Mishkitashua busca revalorar ingredientes andinos como la
                    mashua negra, la tuna, el aguaymanto y la muña,
                    integrándolos en productos dulces con mayor valor agregado.
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    La marca no solo se enfoca en ofrecer un sabor distinto,
                    sino también en construir una propuesta visual, comercial y
                    productiva coherente. Por eso, cada alfajor y cada manjar ha
                    sido pensado desde su formulación hasta su empaque, cuidando
                    el sabor, la textura, el color y la presentación final.
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Lo que nos diferencia es esa combinación: un ingrediente que
                    casi nadie usa en repostería, tratado con un estándar de
                    producto terminado y no de dulce casero.
                  </p>
                </div>
              </Reveal>
            </section>

            {/* 4. Misión y visión */}
            <section id="mision-vision" className="scroll-mt-28">
              <Reveal>
                <p className="text-sm font-semibold text-caramel tracking-widest uppercase mb-3">
                  Misión y visión
                </p>
                <h2
                  className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-8"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Hacia dónde vamos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-7 border border-cream-darker/40">
                    <div className="w-12 h-12 bg-caramel-light/25 rounded-full flex items-center justify-center mb-4">
                      <Target className="text-caramel" size={22} />
                    </div>
                    <h3
                      className="text-xl font-semibold text-cocoa-deep mb-3"
                      style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                    >
                      Misión
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Llevar la repostería andina a más hogares del Perú a
                      través de una tienda en línea sencilla y confiable,
                      ofreciendo productos con identidad regional, calidad
                      constante y una entrega puntual.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-7 border border-cream-darker/40">
                    <div className="w-12 h-12 bg-caramel-light/25 rounded-full flex items-center justify-center mb-4">
                      <Eye className="text-caramel" size={22} />
                    </div>
                    <h3
                      className="text-xl font-semibold text-cocoa-deep mb-3"
                      style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                    >
                      Visión
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Ser la marca de referencia en repostería andina del país y
                      consolidar el comercio electrónico como nuestro principal
                      canal de venta, llegando a todo el Perú sin perder el
                      carácter artesanal del producto.
                    </p>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* 5. Nuestros valores */}
            <section id="valores" className="scroll-mt-28">
              <Reveal>
                <p className="text-sm font-semibold text-caramel tracking-widest uppercase mb-3">
                  Nuestros valores
                </p>
                <h2
                  className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-8"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  En qué creemos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {VALORES.map((v) => (
                    <div
                      key={v.title}
                      className="bg-white rounded-2xl p-6 border border-cream-darker/40 flex gap-4"
                    >
                      <span className="w-11 h-11 shrink-0 bg-caramel-light/25 rounded-full flex items-center justify-center">
                        <v.icon className="text-caramel" size={20} />
                      </span>
                      <div>
                        <h3 className="font-semibold text-cocoa-deep mb-1.5">
                          {v.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {v.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="bg-white rounded-2xl p-6 border border-cream-darker/40 flex gap-4 sm:col-span-2">
                    <span className="w-11 h-11 shrink-0 bg-caramel-light/25 rounded-full flex items-center justify-center">
                      <Users className="text-caramel" size={20} />
                    </span>
                    <div>
                      <h3 className="font-semibold text-cocoa-deep mb-1.5">
                        Innovación
                      </h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        Probamos combinaciones que no existen en el mercado —
                        como una tapa de alfajor a base de mashua negra — y las
                        llevamos hasta que funcionan como producto real, no como
                        experimento.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* 6. Ingredientes y calidad */}
            <section id="ingredientes" className="scroll-mt-28">
              <Reveal>
                <p className="text-sm font-semibold text-caramel tracking-widest uppercase mb-3">
                  Ingredientes y calidad
                </p>
                <h2
                  className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-6"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Ingredientes reales, de origen andino
                </h2>
                <p className="text-on-surface-variant leading-relaxed mb-8 max-w-2xl">
                  Trabajamos con productores de la región para obtener insumos
                  representativos de nuestra identidad. Estos son los cuatro que
                  definen el sabor de Mishkitashua:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    {
                      n: "Mashua negra",
                      d: "Tubérculo andino con el que elaboramos la harina de las tapas de nuestros alfajores. Le da su color y su carácter.",
                    },
                    {
                      n: "Tuna",
                      d: "Fruto de penca con sabor suave y dulce. Base de nuestro manjar Tunaluna.",
                    },
                    {
                      n: "Aguaymanto",
                      d: "Fruto ácido y aromático, rico en vitamina C. Da el contraste de nuestro manjar Sol Aguaymanto.",
                    },
                    {
                      n: "Muña",
                      d: "Hierba aromática de altura, de perfil mentolado. Protagonista del manjar Muña Andina.",
                    },
                  ].map((i) => (
                    <div
                      key={i.n}
                      className="bg-white rounded-2xl p-6 border border-cream-darker/40"
                    >
                      <h3 className="font-semibold text-cocoa-deep mb-1.5">
                        {i.n}
                      </h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {i.d}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-cream-dark/40 rounded-2xl p-6 border border-cream-darker/40">
                  <h3 className="font-semibold text-cocoa-deep mb-2">
                    Sobre alérgenos
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Nuestros productos contienen ingredientes de origen lácteo.
                    Los alfajores también pueden contener gluten y huevo por la
                    composición de sus tapas. Recomendamos revisar siempre la
                    etiqueta antes de consumir.
                  </p>
                </div>
              </Reveal>
            </section>

            {/* 7. Nuestro proceso */}
            <section id="proceso" className="scroll-mt-28">
              <Reveal>
                <p className="text-sm font-semibold text-caramel tracking-widest uppercase mb-3">
                  Nuestro proceso
                </p>
                <h2
                  className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-6"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  De la materia prima al frasco
                </h2>
                <p className="text-on-surface-variant leading-relaxed mb-8 max-w-2xl">
                  Producimos por lotes con formulaciones definidas y criterios de
                  uniformidad. Así es como se elabora cada producto:
                </p>
                <ol className="space-y-4">
                  {PROCESO.map((p) => (
                    <li
                      key={p.step}
                      className="bg-white rounded-2xl p-6 border border-cream-darker/40 flex gap-5"
                    >
                      <span
                        className="text-2xl text-caramel/60 shrink-0"
                        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                      >
                        {p.step}
                      </span>
                      <div>
                        <h3 className="font-semibold text-cocoa-deep mb-1.5">
                          {p.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {p.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 flex items-start gap-3 bg-cream-dark/40 rounded-2xl p-6 border border-cream-darker/40">
                  <ClipboardList
                    className="text-caramel shrink-0 mt-0.5"
                    size={20}
                  />
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Producir por lotes identificables nos permite rastrear
                    cualquier incidencia hasta su origen: si un cliente reporta
                    un problema, sabemos exactamente de qué producción vino.
                  </p>
                </div>
              </Reveal>
            </section>

            {/* 8. Empaques con propósito */}
            <section id="empaques" className="scroll-mt-28">
              <Reveal>
                <p className="text-sm font-semibold text-caramel tracking-widest uppercase mb-3">
                  Empaques con propósito
                </p>
                <h2
                  className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-6"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  El empaque también cuenta la historia
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <p className="text-on-surface-variant leading-relaxed">
                      Cuidamos cada presentación con empaques funcionales,
                      atractivos y pensados para reducir el impacto ambiental.
                      Los manjares se presentan en frascos de 300 g reutilizables
                      y los alfajores en cajas que protegen el producto durante
                      el transporte.
                    </p>
                    <p className="text-on-surface-variant leading-relaxed">
                      El diseño recoge la iconografía textil andina y la paleta
                      de nuestros propios ingredientes. No es decoración: es la
                      forma de que el producto se reconozca como peruano antes
                      incluso de abrirlo.
                    </p>
                    <div className="bg-white rounded-2xl p-6 border border-cream-darker/40">
                      <h3 className="font-semibold text-cocoa-deep mb-2">
                        Qué encuentras en la etiqueta
                      </h3>
                      <ul className="text-sm text-on-surface-variant leading-relaxed space-y-1.5">
                        <li>• Lista completa de ingredientes</li>
                        <li>• Declaración de alérgenos</li>
                        <li>• Peso neto y fecha de consumo preferente</li>
                        <li>• Recomendaciones de conservación</li>
                      </ul>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden">
                    <Image
                      src="/images/marca-todos-productos.png"
                      alt="Empaques de Mishkitashua"
                      width={800}
                      height={800}
                      className="w-full h-auto"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </Reveal>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
