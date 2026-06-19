import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Star,
  Users,
  Tag,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

function NavLinks() {
  return (
    <>
      <Link
        href="/admin"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors"
      >
        <LayoutDashboard size={16} />
        Dashboard
      </Link>
      <Link
        href="/admin/pedidos"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors"
      >
        <ShoppingBag size={16} />
        Pedidos
      </Link>
      <Link
        href="/admin/clientes"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors"
      >
        <Users size={16} />
        Clientes
      </Link>
      <Link
        href="/admin/resenas"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors"
      >
        <Star size={16} />
        Reseñas
      </Link>
      <Link
        href="/admin/promociones"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors"
      >
        <Tag size={16} />
        Promociones
      </Link>
      <Link
        href="/admin/reportes"
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-caramel-light transition-colors"
      >
        <BarChart3 size={16} />
        Reportes
      </Link>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-cocoa-deep text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between h-14">
          <Link
            href="/admin"
            className="font-medium text-lg"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Mishkitashua
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>
          <Link
            href="/"
            className="hidden md:inline text-sm text-white/60 hover:text-caramel-light transition-colors"
          >
            ← Volver al sitio
          </Link>
          <details className="md:hidden relative group">
            <summary className="list-none cursor-pointer p-2">
              <Menu size={20} className="group-open:hidden" />
              <X size={20} className="hidden group-open:block" />
            </summary>
            <div className="absolute right-0 top-full mt-2 bg-cocoa-deep rounded-xl p-4 flex flex-col gap-4 min-w-[180px] shadow-lg z-50">
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
