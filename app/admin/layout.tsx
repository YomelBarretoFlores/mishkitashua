import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Star,
  Users,
  Tag,
  BarChart3,
  Cookie,
  Settings,
  Radio,
  RotateCcw,
  Menu,
  X,
} from "lucide-react";
import { requireAdminPage } from "@/app/lib/auth";

function NavLinks() {
  return (
    <>
      <Link
        href="/admin"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors whitespace-nowrap shrink-0"
      >
        <LayoutDashboard size={16} />
        Dashboard
      </Link>
      <Link
        href="/admin/pedidos"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors whitespace-nowrap shrink-0"
      >
        <ShoppingBag size={16} />
        Pedidos
      </Link>
      <Link
        href="/admin/devoluciones"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors whitespace-nowrap shrink-0"
      >
        <RotateCcw size={16} />
        Devoluciones
      </Link>
      <Link
        href="/admin/productos"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors whitespace-nowrap shrink-0"
      >
        <Cookie size={16} />
        Productos
      </Link>
      <Link
        href="/admin/clientes"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors whitespace-nowrap shrink-0"
      >
        <Users size={16} />
        Clientes
      </Link>
      <Link
        href="/admin/conectados"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors whitespace-nowrap shrink-0"
      >
        <Radio size={16} />
        Conectados
      </Link>
      <Link
        href="/admin/resenas"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors whitespace-nowrap shrink-0"
      >
        <Star size={16} />
        Reseñas
      </Link>
      <Link
        href="/admin/promociones"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors whitespace-nowrap shrink-0"
      >
        <Tag size={16} />
        Promociones
      </Link>
      <Link
        href="/admin/reportes"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors whitespace-nowrap shrink-0"
      >
        <BarChart3 size={16} />
        Reportes
      </Link>
      <Link
        href="/admin/configuracion"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors whitespace-nowrap shrink-0"
      >
        <Settings size={16} />
        Configuración
      </Link>
    </>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protección a nivel de recurso: solo admins ven el panel.
  await requireAdminPage();

  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-cocoa-deep text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center gap-x-5 gap-y-2 flex-wrap min-h-14 py-2.5">
          <Link
            href="/admin"
            className="font-medium text-lg shrink-0 mr-1"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Mishkitashua
          </Link>
          {/* Los enlaces BAJAN DE LÍNEA cuando no caben, en vez de desplazarse
              en horizontal. Con diez secciones no entran en un portátil, y al
              hacer scroll con la barra oculta parecía que "Configuración" no
              existía. Ocupando dos filas siempre se ve todo, sin depender de
              flechas ni de que el navegador anime nada. */}
          {/* `lg:contents` disuelve este contenedor en la fila superior, para
              que los enlaces fluyan junto al logo y no se lleven una fila
              entera para ellos solos. */}
          <div className="hidden lg:contents">
            <NavLinks />
          </div>
          <Link
            href="/"
            className="hidden lg:inline shrink-0 ml-auto text-sm text-white/60 hover:text-caramel-light transition-colors whitespace-nowrap"
          >
            ← Volver al sitio
          </Link>
          <details className="lg:hidden relative group ml-auto">
            <summary className="list-none cursor-pointer p-2">
              <Menu size={20} className="group-open:hidden" />
              <X size={20} className="hidden group-open:block" />
            </summary>
            <div className="absolute right-0 top-full mt-2 bg-cocoa-deep rounded-xl p-4 flex flex-col gap-4 min-w-[190px] shadow-lg z-50">
              <NavLinks />
              <Link
                href="/"
                className="text-sm text-white/60 hover:text-caramel-light transition-colors"
              >
                ← Volver al sitio
              </Link>
            </div>
          </details>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8">{children}</main>
    </div>
  );
}
