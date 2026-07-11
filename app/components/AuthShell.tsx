import Image from "next/image";
import Link from "next/link";
import { Truck, PackageSearch, ShieldCheck } from "lucide-react";
import AuthReloadGuard from "@/app/components/AuthReloadGuard";

const BENEFITS = [
  { icon: Truck, text: "Envío gratis en tu primera compra" },
  { icon: PackageSearch, text: "Sigue el estado de tus pedidos" },
  { icon: ShieldCheck, text: "Pago cifrado y datos protegidos" },
];

// Marco de marca para las páginas de autenticación (ingresar / registro).
// Panel izquierdo con imagen andina + beneficios; panel derecho con el
// encabezado propio y el widget de Clerk que se pasa como children.
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-12 md:py-16">
      <AuthReloadGuard />
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-cream-darker/60 bg-white shadow-xl shadow-cocoa-deep/5 grid md:grid-cols-[0.85fr_1fr]">
        {/* Panel de marca (se oculta en móvil para priorizar el formulario) */}
        <aside className="relative hidden md:block">
          <Image
            src="/images/tunaluna-frasco-paisaje.png"
            alt="Paisaje andino de Mishkitashua"
            fill
            className="object-cover"
            sizes="360px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cocoa-deep/70 via-cocoa-deep/55 to-cocoa-deep/85" />
          <div className="relative h-full flex flex-col justify-between p-8 text-white">
            <div>
              <p
                className="text-2xl font-medium"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Mishkitashua
              </p>
              <p className="text-sm text-white/80 mt-1">
                Sabores que nacen de nuestra tierra
              </p>
            </div>
            <ul className="space-y-3">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                    <Icon size={16} />
                  </span>
                  <span className="text-white/90">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Panel del formulario */}
        <div className="p-7 sm:p-10 flex flex-col justify-center">
          <div className="mb-6 text-center md:text-left">
            <h1
              className="text-3xl font-medium text-cocoa-deep"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              {title}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1.5">{subtitle}</p>
          </div>
          <div className="flex justify-center md:justify-start">{children}</div>
          <p className="mt-6 text-center md:text-left text-xs text-taupe">
            Al continuar aceptas nuestros{" "}
            <Link href="/ayuda" className="underline hover:text-cocoa">
              términos y política de privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
