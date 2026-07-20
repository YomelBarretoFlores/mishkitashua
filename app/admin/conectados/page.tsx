"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, User, Circle } from "lucide-react";

type OnlineCustomer = {
  customerId: string;
  customerName: string;
  page: string | null;
  lastSeen: string;
};

type PresenceData = {
  customers: OnlineCustomer[];
  anonymous: number;
  total: number;
};

function hace(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "hace segundos";
  const m = Math.floor(s / 60);
  return `hace ${m} min`;
}

export default function ConectadosPage() {
  const [data, setData] = useState<PresenceData | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/presence");
      setData(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    // Carga inicial de datos: el estado se actualiza tras el await del fetch,
    // no de forma síncrona, pero la regla no puede verlo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, 20_000); // refresca cada 20s
    return () => clearInterval(t);
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
        <h1
          className="text-xl sm:text-2xl font-medium text-cocoa-deep"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          Conectados ahora
        </h1>
        <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
          <Circle size={9} className="fill-green-500 text-green-500" />
          {data?.total ?? 0} en línea
        </span>
      </div>
      <p className="text-sm text-on-surface-variant mb-6">
        Actividad de los últimos 5 minutos. Se actualiza solo. Útil para
        fidelización: identifica a tus clientes registrados mientras navegan.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-cream-darker/60 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cocoa-deep/10 flex items-center justify-center">
            <User className="text-cocoa-deep" size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-cocoa-deep">
              {data?.customers.length ?? 0}
            </p>
            <p className="text-sm text-on-surface-variant">Clientes con cuenta</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-cream-darker/60 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cocoa-deep/10 flex items-center justify-center">
            <Users className="text-cocoa-deep" size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-cocoa-deep">
              {data?.anonymous ?? 0}
            </p>
            <p className="text-sm text-on-surface-variant">Visitantes anónimos</p>
          </div>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-cocoa-deep mb-3">
        Clientes registrados en línea
      </h2>
      {!data ? (
        <p className="text-taupe py-8 text-center">Cargando...</p>
      ) : data.customers.length === 0 ? (
        <p className="text-taupe text-center py-10 bg-white rounded-2xl border border-cream-darker/60">
          Ningún cliente registrado navegando ahora mismo.
        </p>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-darker/60 overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-cream border-b border-cream-darker/60">
              <tr>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Cliente</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Viendo</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Actividad</th>
              </tr>
            </thead>
            <tbody>
              {data.customers.map((c) => (
                <tr key={c.customerId} className="border-b border-cream-darker/40">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-2 font-medium text-cocoa-deep">
                      <Circle size={8} className="fill-green-500 text-green-500" />
                      {c.customerName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant">
                    {c.page || "—"}
                  </td>
                  <td className="py-3 px-4 text-taupe text-xs">{hace(c.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
