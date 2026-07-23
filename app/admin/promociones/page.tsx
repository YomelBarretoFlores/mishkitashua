"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Power, Mail, Cake, Users, X } from "lucide-react";
import ConfirmDialog from "@/app/admin/_components/confirm-dialog";
import Toast, { type ToastMessage } from "@/app/admin/_components/toast";

// Solo se necesita slug + nombre para el selector de producto.
type ProductOption = { slug: string; name: string };

type Promotion = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  value: number | null;
  productSlug: string | null;
  minPurchase: number | null;
  giftDescription: string | null;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  flash_discount: "Descuento flash (%)",
  buy_x_get_y: "2x1",
  free_gift: "Regalo sorpresa",
  free_shipping: "Envío gratis",
};

const emptyForm = {
  title: "",
  description: "",
  type: "flash_discount",
  value: "",
  productSlug: "",
  minPurchase: "",
  giftDescription: "",
  startsAt: "",
  endsAt: "",
};

export default function PromocionesPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [birthdayCount, setBirthdayCount] = useState<number | null>(null);
  const [sendingBirthdays, setSendingBirthdays] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [audience, setAudience] = useState<{ recipients: number } | null>(null);
  const [toast, setToast] = useState<ToastMessage>(null);
  // Panel de "a quién se envió" de una promoción concreta.
  const [sendsFor, setSendsFor] = useState<{
    title: string;
    loading: boolean;
    total: number;
    personas: number;
    rows: {
      customerId: string;
      nombre: string;
      email: string;
      veces: number;
      ultimo: string;
      status: string;
      detail: string | null;
    }[];
  } | null>(null);
  // Confirmación pendiente: qué se preguntó y qué hacer si dice que sí.
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    action: () => void | Promise<void>;
  } | null>(null);

  const load = () => {
    fetch("/api/admin/promociones")
      .then((r) => r.json())
      .then(setPromotions)
      .catch(() => {});
  };

  useEffect(load, []);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]));
    fetch("/api/admin/promociones/birthdays")
      .then((r) => r.json())
      .then((d) => setBirthdayCount(d.birthdays ?? 0))
      .catch(() => setBirthdayCount(null));
    fetch("/api/admin/promociones/audiencia")
      .then((r) => r.json())
      .then((d) => setAudience({ recipients: d.recipients ?? 0 }))
      .catch(() => setAudience(null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/promociones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        value: form.value === "" ? null : Number(form.value),
        minPurchase: form.minPurchase === "" ? null : Number(form.minPurchase),
        productSlug: form.productSlug || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ ...emptyForm });
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Error al crear la promoción");
    }
  };

  const toggleActive = async (promo: Promotion) => {
    await fetch("/api/admin/promociones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: promo.id, active: !promo.active }),
    });
    load();
  };

  const remove = (promo: Promotion) => {
    setConfirmState({
      title: "Eliminar promoción",
      message: `Se eliminará "${promo.title}". Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      danger: true,
      action: async () => {
        await fetch(`/api/admin/promociones?id=${promo.id}`, { method: "DELETE" });
        load();
        setToast({ text: "Promoción eliminada.", kind: "ok" });
      },
    });
  };

  const [sending, setSending] = useState<string | null>(null);
  // Historial del correo de cumpleaños. No cuelga de ninguna promoción, así
  // que se pide por tipo en vez de por id.
  const openBirthdaySends = async () => {
    const title = "Correo de cumpleaños";
    setSendsFor({ title, loading: true, total: 0, personas: 0, rows: [] });
    const res = await fetch("/api/admin/promociones/envios?kind=cumpleanos");
    const data = await res.json().catch(() => ({ rows: [] }));
    setSendsFor({
      title,
      loading: false,
      total: data.total ?? 0,
      personas: data.personas ?? 0,
      rows: data.rows ?? [],
    });
  };

  // Abre el historial de envíos de una promoción.
  const openSends = async (promo: Promotion) => {
    setSendsFor({
      title: promo.title,
      loading: true,
      total: 0,
      personas: 0,
      rows: [],
    });
    const res = await fetch(
      `/api/admin/promociones/envios?promotionId=${promo.id}`
    );
    const data = await res.json().catch(() => ({ rows: [] }));
    setSendsFor({
      title: promo.title,
      loading: false,
      total: data.total ?? 0,
      personas: data.personas ?? 0,
      rows: data.rows ?? [],
    });
  };

  const sendCampaign = (promo: Promotion) => {
    const cuantos = audience
      ? `${audience.recipients} cliente${audience.recipients !== 1 ? "s" : ""}`
      : "los clientes suscritos";
    setConfirmState({
      title: "Enviar campaña",
      message: `Se enviará "${promo.title}" por correo a ${cuantos}.`,
      confirmLabel: "Enviar",
      action: async () => {
        setSending(promo.id);
        const res = await fetch("/api/admin/promociones/campaign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promotionId: promo.id }),
        });
        setSending(null);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setToast({
            text: `Campaña enviada a ${data.sent} de ${data.recipients} clientes${
              data.simulated ? " (modo simulación: revisa la consola)" : ""
            }.`,
            kind: "ok",
          });
        } else {
          setToast({
            text: data.error || "No se pudo enviar la campaña.",
            kind: "error",
          });
        }
      },
    });
  };

  const handleSendBirthdays = () => {
    setConfirmState({
      title: "Enviar cupón de cumpleaños",
      message: `Se enviará ahora mismo a ${birthdayCount} cliente${
        birthdayCount !== 1 ? "s" : ""
      } que cumple${birthdayCount !== 1 ? "n" : ""} años hoy.`,
      confirmLabel: "Enviar",
      action: async () => {
        setSendingBirthdays(true);
        const res = await fetch("/api/admin/promociones/birthdays", {
          method: "POST",
        });
        setSendingBirthdays(false);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setToast({
            text: `Cupón enviado a ${data.sent} de ${data.birthdays} cliente${
              data.birthdays !== 1 ? "s" : ""
            }.`,
            kind: "ok",
          });
        } else {
          setToast({ text: data.error || "No se pudo enviar.", kind: "error" });
        }
      },
    });
  };

  const showValue = form.type === "flash_discount";
  const showProduct = form.type === "flash_discount" || form.type === "buy_x_get_y";
  const showMinPurchase =
    form.type === "free_gift" || form.type === "free_shipping";
  const showGift = form.type === "free_gift";

  return (
    <div>
      <h1
        className="text-xl sm:text-2xl font-medium text-cocoa-deep mb-6"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Promociones
      </h1>

      {/* Correo de cumpleaños: el cron lo manda solo, pero se puede forzar. */}
      <div className="bg-white rounded-2xl border border-cream-darker/60 p-5 md:p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Cake className="w-5 h-5 text-cocoa-deep mt-0.5 shrink-0" aria-hidden />
            <div>
              <h2 className="font-medium text-cocoa-deep">Correo de cumpleaños</h2>
              <p className="text-sm text-on-surface-variant">
                Se envía solo cada día a las 8:00 am. Usa el botón para enviarlo ahora.
              </p>
              <p className="text-sm text-taupe mt-1">
                {birthdayCount === null
                  ? "Consultando…"
                  : birthdayCount === 0
                    ? "Hoy no cumple años nadie."
                    : `Cumplen hoy: ${birthdayCount} cliente${birthdayCount !== 1 ? "s" : ""}.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mismo historial que las promociones: a quién se le mandó el
                cupón de cumpleaños y qué código recibió. */}
            <button
              onClick={openBirthdaySends}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-darker text-cocoa-deep text-sm font-medium hover:bg-cream transition-colors"
            >
              <Users size={16} aria-hidden />
              Ver envíos
            </button>
            <button
              onClick={handleSendBirthdays}
              disabled={sendingBirthdays || !birthdayCount}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cocoa-deep text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Mail size={16} aria-hidden />
              {sendingBirthdays ? "Enviando…" : "Enviar ahora"}
            </button>
          </div>
        </div>
      </div>

      {/* Formulario de creación */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-cream-darker/60 p-5 md:p-6 mb-8 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
              Título
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm focus:outline-none focus:border-cocoa"
              placeholder="¡2x1 en alfajores!"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
              Tipo
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm focus:outline-none focus:border-cocoa"
            >
              {Object.entries(TYPE_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
            Descripción
          </label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm focus:outline-none focus:border-cocoa"
            placeholder="Aprovecha esta semana"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showValue && (
            <div>
              <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                Descuento (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm focus:outline-none focus:border-cocoa"
                placeholder="10"
              />
            </div>
          )}
          {showProduct && (
            <div>
              <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                Producto {form.type === "flash_discount" ? "(opcional)" : ""}
              </label>
              <select
                value={form.productSlug}
                onChange={(e) =>
                  setForm({ ...form, productSlug: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm focus:outline-none focus:border-cocoa"
              >
                <option value="">Todos los productos</option>
                {products.map((p: ProductOption) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {showMinPurchase && (
            <div>
              <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                Compra mínima (S/)
              </label>
              <input
                type="number"
                min={0}
                value={form.minPurchase}
                onChange={(e) =>
                  setForm({ ...form, minPurchase: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm focus:outline-none focus:border-cocoa"
                placeholder="50"
              />
            </div>
          )}
          {showGift && (
            <div>
              <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                Regalo
              </label>
              <input
                value={form.giftDescription}
                onChange={(e) =>
                  setForm({ ...form, giftDescription: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm focus:outline-none focus:border-cocoa"
                placeholder="Mini manjar de cortesía"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
              Inicio
            </label>
            <input
              type="datetime-local"
              required
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm focus:outline-none focus:border-cocoa"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
              Fin
            </label>
            <input
              type="datetime-local"
              required
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm focus:outline-none focus:border-cocoa"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-cocoa text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-cocoa-deep transition-colors disabled:opacity-60"
        >
          <Plus size={16} />
          {saving ? "Guardando..." : "Crear promoción"}
        </button>
      </form>

      {/* Lista de promociones */}
      {promotions.length === 0 ? (
        <p className="text-taupe text-center py-12">
          No hay promociones creadas
        </p>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => {
            const now = new Date();
            const vigente =
              promo.active &&
              new Date(promo.startsAt) <= now &&
              now <= new Date(promo.endsAt);
            return (
              <div
                key={promo.id}
                className="bg-white rounded-2xl border border-cream-darker/60 p-5 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Tag size={15} className="text-caramel shrink-0" />
                    <span className="font-semibold text-cocoa-deep">
                      {promo.title}
                    </span>
                    <span className="text-xs bg-cream-dark text-cocoa-deep px-2 py-0.5 rounded-full">
                      {TYPE_LABELS[promo.type] ?? promo.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        vigente
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {vigente ? "Vigente" : promo.active ? "Programada" : "Inactiva"}
                    </span>
                  </div>
                  {promo.description && (
                    <p className="text-sm text-on-surface-variant mb-1">
                      {promo.description}
                    </p>
                  )}
                  <p className="text-xs text-taupe">
                    {new Date(promo.startsAt).toLocaleString("es-PE")} →{" "}
                    {new Date(promo.endsAt).toLocaleString("es-PE")}
                    {promo.value != null && ` · ${promo.value}%`}
                    {promo.minPurchase != null &&
                      ` · mín. S/ ${promo.minPurchase}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => sendCampaign(promo)}
                    disabled={sending === promo.id}
                    title="Enviar por correo a los clientes"
                    className="p-2 text-cocoa hover:bg-cream-dark rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Mail size={16} />
                  </button>
                  <button
                    onClick={() => openSends(promo)}
                    title="Ver a quién se le envió"
                    className="p-2 text-cocoa hover:bg-cream-dark rounded-lg transition-colors"
                  >
                    <Users size={16} />
                  </button>
                  <button
                    onClick={() => toggleActive(promo)}
                    title={promo.active ? "Desactivar" : "Activar"}
                    className={`p-2 rounded-lg transition-colors ${
                      promo.active
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => remove(promo)}
                    title="Eliminar"
                    className="p-2 text-taupe hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historial de envíos: a quién le llegó esta promoción y cuántas veces */}
      {sendsFor && (
        <div
          className="fixed inset-0 z-50 bg-cocoa-deep/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
          onClick={() => setSendsFor(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-5 border-b border-cream-darker/60">
              <div>
                <h3
                  className="text-lg font-medium text-cocoa-deep"
                  style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                >
                  Envíos de «{sendsFor.title}»
                </h3>
                <p className="text-xs text-taupe mt-0.5">
                  {sendsFor.loading
                    ? "Cargando…"
                    : `${sendsFor.personas} personas · ${sendsFor.total} correos enviados`}
                </p>
              </div>
              <button
                onClick={() => setSendsFor(null)}
                className="p-1.5 text-taupe hover:text-cocoa-deep transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {sendsFor.loading ? (
                <p className="text-sm text-taupe text-center py-8">Cargando…</p>
              ) : sendsFor.rows.length === 0 ? (
                <p className="text-sm text-taupe text-center py-8">
                  Esta promoción todavía no se ha enviado a nadie.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cream-darker/60 text-left">
                      <th className="py-2 pr-3 font-semibold text-on-surface-variant">
                        Cliente
                      </th>
                      <th className="py-2 px-3 font-semibold text-on-surface-variant">
                        Veces
                      </th>
                      <th className="py-2 pl-3 font-semibold text-on-surface-variant">
                        Último envío
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sendsFor.rows.map((r) => (
                      <tr
                        key={r.customerId}
                        className="border-b border-cream-darker/40"
                      >
                        <td className="py-2.5 pr-3">
                          <p className="text-cocoa-deep font-medium">
                            {r.nombre}
                          </p>
                          <p className="text-xs text-taupe">{r.email}</p>
                          {r.detail && (
                            <p className="text-xs text-caramel font-mono mt-0.5">
                              {r.detail}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-on-surface-variant">
                          {r.veces}
                        </td>
                        <td className="py-2.5 pl-3">
                          <p className="text-on-surface-variant">
                            {new Date(r.ultimo).toLocaleDateString("es-PE", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {r.status !== "enviado" && (
                            <span
                              className={`text-xs font-medium ${r.status === "fallido" ? "text-red-600" : "text-amber-600"}`}
                            >
                              {r.status === "simulado"
                                ? "simulado (sin correo real)"
                                : "falló"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
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
