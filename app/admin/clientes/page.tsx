"use client";

import { useEffect, useMemo, useState } from "react";
import { UserCheck, User } from "lucide-react";
import SearchInput, { normaliza } from "@/app/admin/_components/search-input";

type Customer = {
  id: string;
  name: string;
  email: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  hasAccount: boolean;
  birthdate: string | null;
};

// "Sin cuenta" = sin clerkUserId ligado. No implica que comprara como invitado:
// el checkout exige sesión. Son datos de demo y filas de cuentas ya borradas.
type Filter = "todos" | "cuenta" | "sin-cuenta";

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // La búsqueda se aplica ANTES que las pestañas, para que sus contadores
  // hablen del resultado que se está mirando y no de la lista entera: "Todos
  // 75" encima de tres filas se lee como que algo está mal.
  const buscados = useMemo(() => {
    const q = normaliza(busqueda);
    if (q === "") return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.city].some((campo) => normaliza(campo ?? "").includes(q))
    );
  }, [customers, busqueda]);

  const conCuenta = useMemo(
    () => buscados.filter((c) => c.hasAccount).length,
    [buscados]
  );

  const visible = useMemo(() => {
    if (filter === "cuenta") return buscados.filter((c) => c.hasAccount);
    if (filter === "sin-cuenta") return buscados.filter((c) => !c.hasAccount);
    return buscados;
  }, [buscados, filter]);

  const TABS: { key: Filter; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: buscados.length },
    { key: "cuenta", label: "Con cuenta", count: conCuenta },
    { key: "sin-cuenta", label: "Sin cuenta", count: buscados.length - conCuenta },
  ];

  if (loading)
    return <p className="text-taupe py-12 text-center">Cargando...</p>;

  return (
    <div>
      <h1
        className="text-xl sm:text-2xl font-medium text-cocoa-deep mb-2"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Clientes
      </h1>
      <p className="text-sm text-on-surface-variant mb-4">
        &quot;Con cuenta&quot; son quienes se registraron. &quot;Sin cuenta&quot; son
        datos de demostración y registros de cuentas ya eliminadas.
      </p>

      <div className="bg-white rounded-2xl border border-cream-darker/60 p-4 mb-4">
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Nombre, correo o ciudad…"
          className="max-w-md"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filter === t.key
                ? "bg-cocoa-deep text-white border-cocoa-deep"
                : "bg-white text-on-surface-variant border-cream-darker/60 hover:bg-cream"
            }`}
          >
            {t.label}{" "}
            <span
              className={
                filter === t.key ? "text-white/70" : "text-taupe"
              }
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-taupe text-center py-12">
          {customers.length === 0
            ? "Aún no hay clientes registrados"
            : busqueda !== ""
              ? `Ningún cliente coincide con "${busqueda}"`
              : "No hay nadie en esta categoría"}
        </p>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-darker/60 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-cream border-b border-cream-darker/60">
              <tr>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Nombre</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Tipo</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Ciudad</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Pedidos</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Total gastado</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Registro</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-cream-darker/40 hover:bg-cream transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-cocoa-deep">{c.name}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{c.email}</td>
                  <td className="py-3 px-4">
                    {c.hasAccount ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cocoa-deep">
                        <UserCheck className="w-3.5 h-3.5" aria-hidden />
                        Con cuenta
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-taupe">
                        <User className="w-3.5 h-3.5" aria-hidden />
                        Sin cuenta
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant">{c.city || "—"}</td>
                  <td className="py-3 px-4 text-cocoa-deep font-semibold">{c.totalOrders}</td>
                  <td className="py-3 px-4 text-cocoa-deep font-semibold">
                    S/ {c.totalSpent.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-taupe text-xs">
                    {new Date(c.createdAt).toLocaleDateString("es-PE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
