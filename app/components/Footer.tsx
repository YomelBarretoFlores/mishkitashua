import Link from "next/link";
import Reveal from "@/app/components/Reveal";
import { BRAND_NAME, SLOGAN } from "@/app/lib/brand";
import InstallAppButton from "@/app/components/InstallAppButton";

export default function Footer() {
  return (
    <footer className="bg-cream-dark border-t border-cream-darker mt-auto">
      <div className="max-w-7xl mx-auto px-5 md:px-16 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <Reveal direction="up">
            <h3 className="font-serif text-xl font-semibold text-cocoa-deep mb-2">
              {BRAND_NAME}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {SLOGAN}.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <h4 className="text-sm font-semibold text-cocoa-deep tracking-wide uppercase mb-3">
              Síguenos
            </h4>
            <div className="space-y-2">
              <a
                href="https://www.instagram.com/mishkitashua"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-on-surface-variant hover:text-caramel transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@mishkitashua"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-on-surface-variant hover:text-caramel transition-colors"
              >
                TikTok
              </a>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <h4 className="text-sm font-semibold text-cocoa-deep tracking-wide uppercase mb-3">
              Legal
            </h4>
            <div className="space-y-2">
              <Link
                href="/ayuda"
                className="block text-sm text-on-surface-variant hover:text-caramel transition-colors"
              >
                Términos de Servicio
              </Link>
              <Link
                href="/ayuda"
                className="block text-sm text-on-surface-variant hover:text-caramel transition-colors"
              >
                Política de Privacidad
              </Link>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.3}>
            <h4 className="text-sm font-semibold text-cocoa-deep tracking-wide uppercase mb-3">
              Aplicación
            </h4>
            <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">
              Instala Mishkitashua en tu teléfono para comprar más rápido.
            </p>
            <InstallAppButton />
          </Reveal>
        </div>

        <div className="border-t border-cream-darker mt-10 pt-6">
          <p className="text-xs text-taupe text-center">
            &copy; {new Date().getFullYear()} {BRAND_NAME}. {SLOGAN}.
          </p>
        </div>
      </div>
    </footer>
  );
}
