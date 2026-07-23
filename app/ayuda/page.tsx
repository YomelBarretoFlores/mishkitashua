import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Snowflake,
  Leaf,
  Truck,
  Store,
  Info,
  AlertTriangle,
  RotateCcw,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  Search,
  Wallet,
  MessageCircle,
} from "lucide-react";
import { faqJsonLd } from "@/app/lib/jsonld";
import SectionNav, { type Section } from "@/app/components/SectionNav";
import { RETURN_WINDOW_DAYS } from "@/app/lib/return-status";

export const metadata: Metadata = {
  title: "Ayuda, envíos y políticas",
  alternates: { canonical: "/ayuda" },
  description:
    "Conservación, ingredientes, envíos, política de cambios y devoluciones, términos de servicio y política de privacidad de Mishkitashua.",
  openGraph: {
    title: "Ayuda, envíos y políticas | Mishkitashua",
    description:
      "Conservación, ingredientes, envíos, devoluciones y políticas de Mishkitashua.",
  },
};

const SECTIONS: Section[] = [
  { id: "productos", label: "Productos y conservación" },
  { id: "envios", label: "Envíos y entregas" },
  { id: "devoluciones", label: "Cambios y devoluciones" },
  { id: "terminos", label: "Términos de servicio" },
  { id: "privacidad", label: "Política de privacidad" },
  { id: "mayoristas", label: "Ventas al por mayor" },
];

// Los cuatro pasos que sigue una devolución, en el mismo orden en que los
// procesa el sistema (solicitada → aprobada → reembolsada).
const PASOS_DEVOLUCION = [
  {
    icon: MessageCircle,
    title: "1. Nos avisas",
    text: `Entra en "Mi cuenta → Mis pedidos" y pulsa "Solicitar devolución" en el pedido, contándonos qué pasó. Tienes ${RETURN_WINDOW_DAYS} días desde que lo recibes.`,
  },
  {
    icon: Camera,
    title: "2. Adjuntas la evidencia",
    text: "Nos envías por WhatsApp o correo una foto del producto y de su empaque, y el número de pedido. Sin evidencia no podemos evaluar el caso.",
  },
  {
    icon: Search,
    title: "3. Revisamos el caso",
    text: "Respondemos en un plazo máximo de 3 días hábiles. Contrastamos con el lote de producción para saber qué ocurrió.",
  },
  {
    icon: Wallet,
    title: "4. Reponemos o devolvemos",
    text: "Si se aprueba, eliges entre la reposición del producto o el reembolso del importe. Te avisamos por correo en cada cambio de estado.",
  },
];

export default function AyudaPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-16 py-12 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />

      {/* Header */}
      <div className="text-center mb-10 md:mb-14">
        <h1
          className="text-3xl md:text-[56px] font-medium text-cocoa-deep mb-4"
          style={{
            fontFamily: "var(--font-eb-garamond), serif",
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
          }}
        >
          Ayuda y políticas
        </h1>
        <p className="text-on-surface-variant max-w-3xl mx-auto">
          Conservación, ingredientes, envíos, devoluciones y las condiciones de
          compra de Mishkitashua. Usa el índice para ir directo a lo que buscas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-16 items-start">
        <SectionNav sections={SECTIONS} />

        <div className="min-w-0 space-y-14 md:space-y-20">
          {/* ── Productos y conservación ── */}
          <section id="productos" className="scroll-mt-28">
            <h2
              className="text-2xl md:text-3xl font-medium text-cocoa-deep mb-6"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Productos y conservación
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-cream-dark rounded-2xl p-6 md:p-8">
                <div className="flex gap-3 items-start mb-5">
                  <div className="w-10 h-10 bg-cocoa/10 rounded-full flex items-center justify-center shrink-0">
                    <Snowflake size={20} className="text-cocoa" />
                  </div>
                  <h3
                    className="text-lg md:text-xl font-semibold text-cocoa-deep"
                    style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                  >
                    ¿Cómo se conservan los alfajores?
                  </h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed mb-4">
                  Nuestros alfajores deben conservarse en un lugar fresco, seco y
                  protegido de la luz solar directa. Para mantener mejor su
                  textura y presentación, se recomienda conservarlos en su
                  empaque original hasta el momento de consumo.
                </p>
                <p className="text-on-surface-variant leading-relaxed">
                  Una vez abierto el empaque, consumir en el menor tiempo posible
                  y evitar la exposición a humedad, calor o manipulación directa.
                </p>
              </div>

              <div className="lg:col-span-5 bg-cream-dark rounded-2xl p-6 md:p-8">
                <div className="flex gap-3 items-start mb-5">
                  <div className="w-10 h-10 bg-cocoa/10 rounded-full flex items-center justify-center shrink-0">
                    <Snowflake size={20} className="text-cocoa" />
                  </div>
                  <h3
                    className="text-lg font-semibold text-cocoa-deep"
                    style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                  >
                    ¿Y los manjares saborizados?
                  </h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                  Los manjares Mishkitashua deben mantenerse cerrados, en un
                  lugar fresco y seco. Después de abrir el frasco, se recomienda
                  refrigerar el producto y consumirlo dentro del periodo indicado
                  en la etiqueta.
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Esta recomendación aplica para nuestras tres variedades:
                  Tunaluna, Sol Aguaymanto y Muña Andina.
                </p>
              </div>

              <div className="lg:col-span-7 bg-cream-dark rounded-2xl p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-6">
                  <div>
                    <div className="flex gap-3 items-start mb-5">
                      <div className="w-10 h-10 bg-cocoa/10 rounded-full flex items-center justify-center shrink-0">
                        <Leaf size={20} className="text-cocoa" />
                      </div>
                      <h3
                        className="text-lg md:text-xl font-semibold text-cocoa-deep"
                        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                      >
                        Ingredientes de origen andino
                      </h3>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed mb-5">
                      La identidad de Mishkitashua se basa en insumos
                      representativos de los Andes peruanos: harina de mashua
                      negra para la línea de alfajores y sabores diferenciados a
                      base de tuna roja, aguaymanto y muña para los manjares.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Mashua negra", "Tuna roja", "Aguaymanto", "Muña"].map(
                        (tag) => (
                          <span
                            key={tag}
                            className="bg-white text-cocoa-deep text-sm font-medium px-4 py-2 rounded-full border border-cream-darker/60"
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="relative h-[180px] md:h-full rounded-xl overflow-hidden hidden md:block">
                    <Image
                      src="/images/ingredientes-andinos.png"
                      alt="Ingredientes andinos Mishkitashua"
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white rounded-2xl border border-cream-darker/60 p-6">
                <div className="flex gap-3 items-start mb-4">
                  <AlertTriangle
                    size={20}
                    className="text-caramel shrink-0 mt-0.5"
                  />
                  <h3
                    className="text-lg font-semibold text-cocoa-deep"
                    style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                  >
                    ¿Contienen alérgenos?
                  </h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Sí. Nuestros productos contienen ingredientes de origen lácteo.
                  Los alfajores también pueden contener gluten y huevo, debido a
                  la composición de sus tapas. Recomendamos revisar siempre la
                  etiqueta antes de consumir.
                </p>
              </div>
            </div>
          </section>

          {/* ── Envíos ── */}
          <section id="envios" className="scroll-mt-28">
            <h2
              className="text-2xl md:text-3xl font-medium text-cocoa-deep mb-6"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Envíos y entregas
            </h2>

            <div className="bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8">
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
                    Huaraz y Lima Metropolitana
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Entregas en 24 a 48 horas hábiles tras la confirmación del
                    pedido.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-cocoa-deep text-sm mb-1">
                    Provincias (nivel nacional)
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Envíos a través de agencias asociadas. Tiempo estimado de 3 a
                    5 días hábiles, dependiendo del destino.
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
                    perfectas condiciones. Puedes seguir tu pedido en cualquier
                    momento desde{" "}
                    <Link href="/seguimiento" className="underline">
                      Mi pedido
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Cambios y devoluciones ── */}
          <section id="devoluciones" className="scroll-mt-28">
            <h2
              className="text-2xl md:text-3xl font-medium text-cocoa-deep mb-2"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Política de cambios, devoluciones y reembolsos
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Trabajamos con productos alimenticios, así que las condiciones son
              distintas a las de una tienda de ropa. Aquí está todo, sin letra
              pequeña.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="bg-white rounded-2xl border border-cream-darker/60 p-6">
                <div className="flex gap-2.5 items-center mb-4">
                  <CheckCircle2 size={20} className="text-green-700 shrink-0" />
                  <h3 className="font-semibold text-cocoa-deep">
                    Sí aceptamos devolución si…
                  </h3>
                </div>
                <ul className="text-sm text-on-surface-variant leading-relaxed space-y-2">
                  <li>• El producto llegó dañado, roto o con el frasco abierto.</li>
                  <li>• Recibiste un producto distinto al que pediste.</li>
                  <li>• Falta un producto o una unidad de tu pedido.</li>
                  <li>
                    • El producto llegó fuera de su fecha de consumo preferente.
                  </li>
                  <li>
                    • El producto presenta un defecto de elaboración (sabor,
                    textura o aspecto que no corresponde).
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-cream-darker/60 p-6">
                <div className="flex gap-2.5 items-center mb-4">
                  <XCircle size={20} className="text-red-600 shrink-0" />
                  <h3 className="font-semibold text-cocoa-deep">
                    No aceptamos devolución si…
                  </h3>
                </div>
                <ul className="text-sm text-on-surface-variant leading-relaxed space-y-2">
                  <li>
                    • El producto fue abierto o consumido y no presenta ningún
                    defecto: por seguridad alimentaria no podemos revenderlo.
                  </li>
                  <li>
                    • Se trata de un simple cambio de opinión sobre el sabor
                    elegido.
                  </li>
                  <li>
                    • El daño se produjo por una mala conservación después de la
                    entrega (calor, humedad o golpes).
                  </li>
                  <li>
                    • Pasó el plazo de {RETURN_WINDOW_DAYS} días desde la
                    entrega.
                  </li>
                  <li>• Se trata de un pedido personalizado ya elaborado.</li>
                </ul>
              </div>
            </div>

            <div className="bg-cream-dark rounded-2xl p-6 md:p-8 mb-6">
              <div className="flex gap-2.5 items-center mb-5">
                <Clock size={20} className="text-cocoa shrink-0" />
                <h3
                  className="text-lg font-semibold text-cocoa-deep"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Cómo funciona, paso a paso
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {PASOS_DEVOLUCION.map((p) => (
                  <div key={p.title} className="flex gap-3">
                    <span className="w-9 h-9 shrink-0 bg-white rounded-full flex items-center justify-center">
                      <p.icon size={17} className="text-caramel" />
                    </span>
                    <div>
                      <h4 className="font-semibold text-cocoa-deep text-sm mb-1">
                        {p.title}
                      </h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {p.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-cream-darker/60 p-6">
                <h3 className="font-semibold text-cocoa-deep mb-3">
                  Forma de reembolso
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                  Puedes elegir entre <strong>reposición</strong> del producto en
                  tu siguiente envío o <strong>reembolso</strong> del importe.
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  El reembolso se hace por el mismo medio con el que pagaste. Si
                  pagaste con Yape o transferencia, se devuelve a la misma
                  cuenta. El abono puede tardar unos días hábiles en reflejarse,
                  según tu banco. Los gastos de envío se devuelven solo cuando el
                  error fue nuestro.
                </p>
              </div>
              <div className="bg-cocoa rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-3">Canal de contacto</h3>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  Para cualquier incidencia, escríbenos por WhatsApp o desde el
                  formulario de contacto. Ten a mano tu número de pedido: es lo
                  primero que te pediremos.
                </p>
                <Link
                  href="/contacto"
                  className="text-sm font-semibold text-caramel-light hover:underline"
                >
                  Ir a contacto →
                </Link>
              </div>
            </div>
          </section>

          {/* ── Términos de servicio ── */}
          <section id="terminos" className="scroll-mt-28">
            <div className="bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8">
              <div className="flex gap-3 items-center mb-5">
                <FileText size={22} className="text-caramel shrink-0" />
                <h2
                  className="text-2xl md:text-3xl font-medium text-cocoa-deep"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Términos de servicio
                </h2>
              </div>

              <div className="space-y-5 text-sm text-on-surface-variant leading-relaxed">
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Quiénes somos
                  </h3>
                  <p>
                    Mishkitashua es un emprendimiento de repostería andina con
                    sede en Huaraz, Áncash (Perú). Estas condiciones regulan las
                    compras realizadas a través de mishkitashua.com.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Productos y precios
                  </h3>
                  <p>
                    Todos los precios se muestran en soles peruanos (S/) e
                    incluyen impuestos. El precio final de tu pedido siempre se
                    calcula en nuestro servidor al momento de la compra. Podemos
                    modificar precios y disponibilidad en cualquier momento, pero
                    nunca después de que confirmes un pedido.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Pedidos y pagos
                  </h3>
                  <p>
                    Un pedido se considera confirmado cuando recibimos el pago o,
                    en el caso de transferencia y Yape, cuando verificamos el
                    abono. Aceptamos Mercado Pago (tarjeta y Yape) y
                    transferencia bancaria. Recibirás un comprobante por correo
                    con el detalle completo de tu compra. Nos reservamos el
                    derecho de cancelar un pedido si detectamos un error evidente
                    de precio o si el producto ya no está disponible; en ese caso
                    se devuelve el importe íntegro.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Entregas
                  </h3>
                  <p>
                    Los plazos indicados son estimados y se cuentan en días
                    hábiles desde la confirmación del pedido. No respondemos por
                    retrasos causados por la agencia de transporte, por
                    direcciones incompletas o por ausencia en el domicilio de
                    entrega.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Cuentas de usuario
                  </h3>
                  <p>
                    Eres responsable de la veracidad de los datos que registras y
                    de la seguridad de tu cuenta. Podemos suspender cuentas que
                    hagan un uso fraudulento de la tienda, de las promociones o
                    de los cupones.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Promociones y cupones
                  </h3>
                  <p>
                    Los cupones son personales, de un solo uso y tienen fecha de
                    caducidad. No son canjeables por dinero ni acumulables con
                    otras promociones salvo que se indique expresamente.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Reseñas
                  </h3>
                  <p>
                    Solo pueden dejar reseña los clientes que compraron el
                    producto. Podemos retirar reseñas con contenido ofensivo,
                    falso o ajeno al producto.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Devoluciones
                  </h3>
                  <p>
                    Se rigen por nuestra{" "}
                    <Link href="/ayuda#devoluciones" className="underline">
                      política de cambios y devoluciones
                    </Link>
                    , que forma parte de estas condiciones.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Ley aplicable
                  </h3>
                  <p>
                    Estas condiciones se rigen por la legislación peruana de
                    protección al consumidor. Ante cualquier controversia,
                    intentaremos siempre una solución directa antes de acudir a
                    la vía administrativa.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Política de privacidad ── */}
          <section id="privacidad" className="scroll-mt-28">
            <div className="bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8">
              <div className="flex gap-3 items-center mb-5">
                <ShieldCheck size={22} className="text-caramel shrink-0" />
                <h2
                  className="text-2xl md:text-3xl font-medium text-cocoa-deep"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Política de privacidad
                </h2>
              </div>

              <div className="space-y-5 text-sm text-on-surface-variant leading-relaxed">
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Qué datos recogemos
                  </h3>
                  <p>
                    Tu nombre, correo, teléfono y dirección de envío, para poder
                    prepararte y entregarte el pedido. Si nos la das, también tu
                    fecha de nacimiento, únicamente para enviarte un regalo por
                    tu cumpleaños. Guardamos además el historial de tus pedidos y
                    tus reseñas.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Qué NO guardamos
                  </h3>
                  <p>
                    <strong>
                      No almacenamos los datos de tu tarjeta en ningún momento.
                    </strong>{" "}
                    El pago se procesa íntegramente en la pasarela (Mercado
                    Pago); nosotros solo conservamos una referencia de la
                    operación y los últimos cuatro dígitos, para poder
                    identificarla ante una devolución.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Para qué los usamos
                  </h3>
                  <p>
                    Para procesar tus pedidos, atender devoluciones, avisarte del
                    estado de tu compra y, si lo autorizas, enviarte promociones.
                    También usamos estadísticas de navegación de forma agregada
                    para mejorar la tienda.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Con quién los compartimos
                  </h3>
                  <p>
                    Solo con los servicios necesarios para que la tienda
                    funcione: la pasarela de pago, el servicio de envío de
                    correos y la agencia de transporte que te lleva el pedido.
                    Nunca vendemos ni cedemos tus datos a terceros con fines
                    publicitarios.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Correos promocionales
                  </h3>
                  <p>
                    Solo te escribimos si lo autorizaste. Puedes darte de baja
                    cuando quieras desde el enlace que aparece al final de cada
                    correo o desde{" "}
                    <Link href="/cuenta" className="underline">
                      Mi cuenta
                    </Link>
                    . Los correos de tus pedidos y devoluciones seguirán
                    llegando, porque forman parte de la compra.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Tus derechos
                  </h3>
                  <p>
                    Puedes pedirnos en cualquier momento acceder a tus datos,
                    corregirlos o eliminarlos, escribiéndonos desde{" "}
                    <Link href="/contacto" className="underline">
                      contacto
                    </Link>
                    . Ten en cuenta que la información de facturación de pedidos
                    ya realizados debemos conservarla por obligación contable.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cocoa-deep mb-1.5">
                    Seguridad
                  </h3>
                  <p>
                    La tienda funciona íntegramente sobre conexión cifrada
                    (HTTPS) y el acceso a tu cuenta está protegido por un
                    proveedor de identidad externo. Ni siquiera nosotros vemos tu
                    contraseña.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Mayoristas ── */}
          <section id="mayoristas" className="scroll-mt-28">
            <div className="bg-cocoa rounded-2xl p-6 md:p-8 text-white">
              <div className="flex gap-3 items-start mb-4">
                <Store size={22} className="text-caramel-light shrink-0 mt-0.5" />
                <h2
                  className="text-xl md:text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Ventas al por mayor
                </h2>
              </div>
              <p className="text-sm text-white/80 leading-relaxed mb-5 max-w-2xl">
                ¿Interesado en distribuir nuestros productos en tu cafetería,
                tienda boutique o para eventos corporativos? Ofrecemos
                condiciones especiales para compras por volumen.
              </p>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-caramel-light hover:underline"
              >
                <RotateCcw size={15} className="rotate-180" />
                Solicitar catálogo corporativo
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
