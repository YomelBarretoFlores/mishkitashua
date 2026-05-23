import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-cream-dark border-t border-cream-darker mt-auto">
      <div className="max-w-7xl mx-auto px-5 md:px-16 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h3 className="font-serif text-xl font-semibold text-cocoa-deep mb-2">
              Mishkitashua
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Sabores que nacen de nuestra tierra. Repostería artesanal con
              identidad andina.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cocoa-deep tracking-wide uppercase mb-3">
              Síguenos
            </h4>
            <div className="space-y-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-on-surface-variant hover:text-caramel transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-on-surface-variant hover:text-caramel transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>

          <div>
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
          </div>
        </div>

        <div className="border-t border-cream-darker mt-10 pt-6">
          <p className="text-xs text-taupe text-center">
            &copy; 2024 Mishkitashua. Hecho a mano con amor en los Andes.
          </p>
        </div>
      </div>
    </footer>
  );
}
