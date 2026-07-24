"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, User, Mail, X, Send } from "lucide-react";
import ConfirmDialog from "@/app/admin/_components/confirm-dialog";
import SearchInput, { normaliza } from "@/app/admin/_components/search-input";
import Toast, { type ToastMessage } from "@/app/admin/_components/toast";

type Miembro = {
  clerkUserId: string;
  nombre: string;
  email: string;
  rol: "admin" | "cliente";
  esTu: boolean;
  ultimoAcceso: string | null;
};

type Invitacion = {
  id: string;
  email: string;
  rol: "admin" | "cliente";
  creada: string;
};

export default function UsuariosPage() {
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [adminsTotales, setAdminsTotales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [rolInvitado, setRolInvitado] = useState<"admin" | "cliente">("admin");
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState<ToastMessage>(null);
  const [busqueda, setBusqueda] = useState("");
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    action: () => void | Promise<void>;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/usuarios");
    const data = await res.json().catch(() => ({}));
    setMiembros(data.miembros ?? []);
    setInvitaciones(data.invitaciones ?? []);
    setAdminsTotales(data.adminsTotales ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Carga inicial: el estado se actualiza tras el await del fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const cambiarRol = async (m: Miembro, rol: "admin" | "cliente") => {
    setBusy(m.clerkUserId);
    const res = await fetch("/api/admin/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkUserId: m.clerkUserId, rol }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok) {
      load();
      setToast({
        text:
          rol === "admin"
            ? `${m.nombre} ya es administrador.`
            : `${m.nombre} vuelve a ser cliente.`,
        kind: "ok",
      });
    } else {
      setToast({ text: data.error || "No se pudo cambiar el rol", kind: "error" });
    }
  };

  const confirmarCambio = (m: Miembro, rol: "admin" | "cliente") => {
    setConfirmState({
      title: rol === "admin" ? "Dar acceso de administrador" : "Quitar acceso",
      message:
        rol === "admin"
          ? `${m.nombre} podrá ver y modificar pedidos, productos, precios, promociones y devoluciones. Dale este rol solo a quien gestione el negocio.`
          : `${m.nombre} dejará de tener acceso al panel. Seguirá pudiendo comprar como cliente.`,
      confirmLabel: rol === "admin" ? "Dar acceso" : "Quitar acceso",
      danger: rol !== "admin",
      action: () => cambiarRol(m, rol),
    });
  };

  const invitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const res = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, rol: rolInvitado }),
    });
    const data = await res.json().catch(() => ({}));
    setEnviando(false);
    if (res.ok) {
      setEmail("");
      load();
      setToast({ text: `Invitación enviada a ${email}.`, kind: "ok" });
    } else {
      setToast({ text: data.error || "No se pudo invitar", kind: "error" });
    }
  };

  const anular = (inv: Invitacion) => {
    setConfirmState({
      title: "Anular invitación",
      message: `Se anulará la invitación a ${inv.email}. El enlace que recibió dejará de funcionar.`,
      confirmLabel: "Anular",
      danger: true,
      action: async () => {
        const res = await fetch(`/api/admin/usuarios?id=${inv.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          load();
          setToast({ text: "Invitación anulada.", kind: "ok" });
        } else {
          setToast({ text: "No se pudo anular", kind: "error" });
        }
      },
    });
  };

  // Se busca sobre la lista ya cargada (Clerk devuelve el lote entero), así que
  // filtrar aquí es inmediato. Se aplica a los dos grupos por igual: buscar a
  // alguien sin saber de antemano si es admin o cliente es el caso normal.
  const encontrados = (() => {
    const q = normaliza(busqueda);
    if (q === "") return miembros;
    return miembros.filter((m) =>
      [m.nombre, m.email].some((campo) => normaliza(campo ?? "").includes(q))
    );
  })();

  const admins = encontrados.filter((m) => m.rol === "admin");
  const clientes = encontrados.filter((m) => m.rol === "cliente");

  return (
    <div>
      <h1
        className="text-xl sm:text-2xl font-medium text-cocoa-deep mb-2"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Usuarios y roles
      </h1>
      <p className="text-sm text-on-surface-variant mb-6 max-w-2xl">
        Quién puede entrar al panel. Un administrador ve y modifica pedidos,
        productos, precios, promociones y devoluciones; un cliente solo compra.
      </p>

      {/* Invitar */}
      <form
        onSubmit={invitar}
        className="bg-white rounded-2xl border border-cream-darker/60 p-4 md:p-5 mb-6"
      >
        <h2 className="font-semibold text-cocoa-deep mb-1">Invitar a alguien</h2>
        <p className="text-xs text-taupe mb-4">
          Le llega un correo para crear su cuenta. Elige su propia contraseña:
          nosotros nunca la vemos ni la guardamos.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-on-surface-variant mb-1">
              Correo
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="persona@ejemplo.com"
              className="w-full px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-on-surface-variant mb-1">
              Rol
            </span>
            <select
              value={rolInvitado}
              onChange={(e) =>
                setRolInvitado(e.target.value as "admin" | "cliente")
              }
              className="w-full px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
            >
              <option value="admin">Administrador</option>
              <option value="cliente">Cliente</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={enviando}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cocoa-deep text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send size={15} />
              {enviando ? "Enviando…" : "Enviar invitación"}
            </button>
          </div>
        </div>
      </form>

      {/* Invitaciones pendientes */}
      {invitaciones.length > 0 && (
        <section className="mb-6">
          <h2 className="font-semibold text-cocoa-deep mb-3">
            Invitaciones sin aceptar
          </h2>
          <div className="space-y-2">
            {invitaciones.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-xl border border-cream-darker/60 p-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Mail size={16} className="text-taupe shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-cocoa-deep truncate">
                      {inv.email}
                    </p>
                    <p className="text-xs text-taupe">
                      {inv.rol === "admin" ? "Administrador" : "Cliente"} ·
                      enviada el{" "}
                      {new Date(inv.creada).toLocaleDateString("es-PE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => anular(inv)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:opacity-80 transition-opacity"
                >
                  <X size={13} />
                  Anular
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <p className="text-taupe text-center py-12">Cargando…</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-cream-darker/60 p-4 mb-6">
            <SearchInput
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Nombre o correo…"
              className="max-w-md"
            />
          </div>

          {/* Administradores */}
          <section className="mb-8">
            <h2 className="font-semibold text-cocoa-deep mb-3">
              Administradores ({admins.length})
            </h2>
            <div className="space-y-2">
              {admins.map((m) => (
                <div
                  key={m.clerkUserId}
                  className="bg-white rounded-xl border border-cream-darker/60 p-4 flex items-center justify-between gap-4 flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 shrink-0 rounded-full bg-caramel-light/30 flex items-center justify-center">
                      <ShieldCheck size={17} className="text-caramel" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-cocoa-deep truncate">
                        {m.nombre}
                        {m.esTu && (
                          <span className="ml-2 text-xs font-normal text-taupe">
                            (tú)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-taupe truncate">{m.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmarCambio(m, "cliente")}
                    disabled={
                      m.esTu || adminsTotales <= 1 || busy === m.clerkUserId
                    }
                    title={
                      m.esTu
                        ? "No puedes quitarte tu propio acceso"
                        : adminsTotales <= 1
                          ? "Debe quedar al menos un administrador"
                          : "Quitar acceso al panel"
                    }
                    className="text-xs font-medium text-red-600 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                  >
                    Quitar acceso
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Clientes con cuenta */}
          <section>
            <h2 className="font-semibold text-cocoa-deep mb-1">
              Clientes con cuenta ({clientes.length})
            </h2>
            <p className="text-xs text-taupe mb-3">
              Puedes ascender a cualquiera a administrador.
            </p>
            {clientes.length === 0 ? (
              <p className="text-taupe text-sm py-6 text-center bg-white rounded-xl border border-cream-darker/60">
                {busqueda !== ""
                  ? `Ningún cliente coincide con "${busqueda}".`
                  : "Todavía no hay clientes con cuenta."}
              </p>
            ) : (
              <div className="space-y-2">
                {clientes.map((m) => (
                  <div
                    key={m.clerkUserId}
                    className="bg-white rounded-xl border border-cream-darker/60 p-4 flex items-center justify-between gap-4 flex-wrap"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 shrink-0 rounded-full bg-cream-dark flex items-center justify-center">
                        <User size={16} className="text-taupe" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-cocoa-deep truncate">
                          {m.nombre}
                        </p>
                        <p className="text-xs text-taupe truncate">{m.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => confirmarCambio(m, "admin")}
                      disabled={busy === m.clerkUserId}
                      className="text-xs font-medium text-cocoa hover:text-caramel disabled:opacity-40 transition-colors"
                    >
                      Hacer administrador
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.title ?? ""}
        message={confirmState?.message ?? ""}
        confirmLabel={confirmState?.confirmLabel}
        danger={confirmState?.danger}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          const pending = confirmState;
          setConfirmState(null);
          void pending?.action();
        }}
      />
      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
