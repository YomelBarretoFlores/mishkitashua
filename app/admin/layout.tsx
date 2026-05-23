import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Star } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-cocoa text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between h-14">
          <Link href="/admin" className="font-semibold text-lg">
            Mishkitashua Admin
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
            >
              <ShoppingBag size={16} />
              Pedidos
            </Link>
            <Link
              href="/admin/resenas"
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
            >
              <Star size={16} />
              Reseñas
            </Link>
          </div>
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            ← Volver al sitio
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8">{children}</main>
    </div>
  );
}
