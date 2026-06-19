"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Power } from "lucide-react";
import { products } from "@/app/lib/products";

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

  const load = () => {
    fetch("/api/admin/promociones")
      .then((r) => r.json())
      .then(setPromotions)
      .catch(() => {});
  };

  useEffect(load, []);

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

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta promoción?")) return;
    await fetch(`/api/admin/promociones?id=${id}`, { method: "DELETE" });
    load();
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
                {products.map((p) => (
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
                    onClick={() => remove(promo.id)}
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
    </div>
  );
}
