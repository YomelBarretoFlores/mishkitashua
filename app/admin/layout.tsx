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
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center gap-4 h-14">
          <Link
            href="/admin"
            className="font-medium text-lg shrink-0"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Mishkitashua
          </Link>
          {/* Nav en línea: ocupa el espacio disponible y hace scroll horizontal
              si no cabe (con 10 secciones ya no entran todas). */}
          <div className="hidden lg:flex items-center gap-5 overflow-x-auto min-w-0 flex-1 no-scrollbar">
            <NavLinks />
          </div>
          <Link
            href="/"
            className="hidden lg:inline shrink-0 text-sm text-white/60 hover:text-caramel-light transition-colors whitespace-nowrap"
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
