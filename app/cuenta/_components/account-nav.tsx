import Link from "next/link";
import { User, Package, RotateCcw } from "lucide-react";

// Sub-navegación del área de cuenta. `active` marca la pestaña actual.
export default function AccountNav({
  active,
}: {
  active: "datos" | "pedidos" | "devoluciones";
}) {
  const tabs = [
    { key: "datos", label: "Mis datos", href: "/cuenta", icon: User },
    { key: "pedidos", label: "Mis pedidos", href: "/cuenta/pedidos", icon: Package },
    { key: "devoluciones", label: "Devoluciones", href: "/cuenta/devoluciones", icon: RotateCcw },
  ] as const;

  return (
    <div className="flex gap-2 border-b border-cream-darker/60">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            active === t.key
              ? "border-cocoa text-cocoa-deep"
              : "border-transparent text-taupe hover:text-cocoa-deep"
          }`}
        >
          <t.icon size={16} />
          {t.label}
        </Link>
      ))}
    </div>
  );
}
