"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Archive, RotateCcw, Upload, X } from "lucide-react";
import ConfirmDialog from "@/app/admin/_components/confirm-dialog";
import Toast, { type ToastMessage } from "@/app/admin/_components/toast";
import { availabilityOf, availabilityClasses } from "@/app/lib/stock";

type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  weight: string;
  description: string;
  longDescription: string;
  ingredients: string[];
  allergens: string | null;
  features: string[];
  image: string;
  images: string[];
  color: string;
  customizable: boolean;
  flavorOptions: string[];
  boxSize: number | null;
  active: boolean;
  stock: number | null;
};

type FormState = {
  id?: string;
  name: string;
  subtitle: string;
  category: string;
  price: string;
  weight: string;
  description: string;
  longDescription: string;
  ingredients: string; // una por línea
  allergens: string;
  features: string; // una por línea
  image: string;
  images: string; // una por línea
  color: string;
  customizable: boolean;
  flavorOptions: string; // una por línea
  boxSize: string;
  stock: string; // vacío = bajo pedido (sin control)
};

const emptyForm: FormState = {
  name: "",
  subtitle: "",
  category: "alfajores",
  price: "",
  weight: "",
  description: "",
  longDescription: "",
  ingredients: "",
  allergens: "",
  features: "",
  image: "",
  images: "",
  color: "#3e2723",
  customizable: false,
  flavorOptions: "",
  boxSize: "",
  stock: "",
};

const lines = (s: string) =>
  s.split("\n").map((x) => x.trim()).filter(Boolean);
const toText = (arr: string[]) => (arr ?? []).join("\n");

function productToForm(p: Product): FormState {
  return {
    id: p.id,
    name: p.name,
    subtitle: p.subtitle,
    category: p.category,
    price: String(p.price),
    weight: p.weight,
    description: p.description,
    longDescription: p.longDescription,
    ingredients: toText(p.ingredients),
    allergens: p.allergens ?? "",
    features: toText(p.features),
    image: p.image,
    images: toText(p.images),
    color: p.color,
    customizable: p.customizable,
    flavorOptions: toText(p.flavorOptions),
    boxSize: p.boxSize ? String(p.boxSize) : "",
    stock: p.stock === null ? "" : String(p.stock),
  };
}

export default function ProductosAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  // Id del producto cuyo stock se está moviendo (para no permitir doble clic).
  const [stockBusy, setStockBusy] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<ToastMessage>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    action: () => void | Promise<void>;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/productos");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Carga inicial de datos: el estado se actualiza tras el await del fetch,
    // no de forma síncrona, pero la regla no puede verlo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/productos/upload", {
      method: "POST",
      body: fd,
    });
    setUploading(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      set("image", data.url);
      setToast({ text: "Imagen subida.", kind: "ok" });
    } else {
      setToast({ text: data.error || "No se pudo subir la imagen", kind: "error" });
    }
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const payload = {
      id: form.id,
      name: form.name,
      subtitle: form.subtitle,
      category: form.category,
      price: Number(form.price),
      weight: form.weight,
      description: form.description,
      longDescription: form.longDescription,
      ingredients: lines(form.ingredients),
      allergens: form.allergens || null,
      features: lines(form.features),
      image: form.image,
      images: form.images ? lines(form.images) : form.image ? [form.image] : [],
      color: form.color,
      customizable: form.customizable,
      flavorOptions: lines(form.flavorOptions),
      boxSize: form.boxSize ? Number(form.boxSize) : null,
      // Vacío = "bajo pedido": el producto no lleva control de unidades.
      stock: form.stock.trim() === "" ? null : Number(form.stock),
    };
    const res = await fetch("/api/admin/productos", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setForm(null);
      load();
      setToast({ text: form.id ? "Producto actualizado." : "Producto creado.", kind: "ok" });
    } else {
      setToast({ text: data.error || "No se pudo guardar", kind: "error" });
    }
  };

  // Movimiento rápido de stock desde la lista (venta manual o reposición).
  const moveStock = async (p: Product, delta: number, reason: string) => {
    setStockBusy(p.id);
    const res = await fetch("/api/admin/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: p.id, delta, reason }),
    });
    const data = await res.json().catch(() => ({}));
    setStockBusy(null);
    if (res.ok) {
      load();
      setToast({
        text:
          delta < 0
            ? `Venta manual registrada: ${p.name}`
            : `Reposición registrada: ${p.name}`,
        kind: "ok",
      });
    } else {
      setToast({ text: data.error || "No se pudo actualizar", kind: "error" });
    }
  };

  const archive = (p: Product) => {
    setConfirmState({
      title: "Archivar producto",
      message: `"${p.name}" dejará de mostrarse en la tienda. Los pedidos anteriores no se ven afectados. Puedes reactivarlo después.`,
      confirmLabel: "Archivar",
      danger: true,
      action: async () => {
        await fetch(`/api/admin/productos?id=${p.id}`, { method: "DELETE" });
        load();
        setToast({ text: "Producto archivado.", kind: "ok" });
      },
    });
  };

  const reactivate = async (p: Product) => {
    await fetch("/api/admin/productos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, active: true }),
    });
    load();
    setToast({ text: "Producto reactivado.", kind: "ok" });
  };

  const inputClass =
    "w-full px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1
          className="text-xl sm:text-2xl font-medium text-cocoa-deep"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          Productos
        </h1>
        {!form && (
          <button
            onClick={() => setForm({ ...emptyForm })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cocoa-deep text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        )}
      </div>

      {form && (
        <div className="bg-white rounded-2xl border border-cream-darker/60 p-5 md:p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-cocoa-deep">
              {form.id ? "Editar producto" : "Nuevo producto"}
            </h2>
            <button
              onClick={() => setForm(null)}
              aria-label="Cerrar"
              className="text-taupe hover:text-cocoa-deep transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="block text-cocoa-deep font-medium mb-1">Nombre</span>
              <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-cocoa-deep font-medium mb-1">Subtítulo</span>
              <input className={inputClass} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-cocoa-deep font-medium mb-1">Categoría</span>
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="alfajores">Alfajores</option>
                <option value="manjares">Manjares</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-cocoa-deep font-medium mb-1">Precio (S/)</span>
              <input type="number" step="0.01" className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-cocoa-deep font-medium mb-1">Peso</span>
              <input className={inputClass} value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="300g" />
            </label>
            <label className="text-sm">
              <span className="block text-cocoa-deep font-medium mb-1">Color (hex)</span>
              <input className={inputClass} value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="#3e2723" />
            </label>
            <label className="text-sm">
              <span className="block text-cocoa-deep font-medium mb-1">Stock (unidades)</span>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                placeholder="Vacío = bajo pedido"
              />
              <span className="block text-xs text-taupe mt-1">
                Déjalo vacío si lo preparas por encargo. Con 0 se marca como
                agotado y no se puede comprar.
              </span>
            </label>
          </div>

          <label className="text-sm block mt-4">
            <span className="block text-cocoa-deep font-medium mb-1">Descripción corta</span>
            <input className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </label>
          <label className="text-sm block mt-4">
            <span className="block text-cocoa-deep font-medium mb-1">Descripción larga</span>
            <textarea rows={3} className={inputClass} value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <label className="text-sm">
              <span className="block text-cocoa-deep font-medium mb-1">Ingredientes (uno por línea)</span>
              <textarea rows={4} className={inputClass} value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-cocoa-deep font-medium mb-1">Características (una por línea)</span>
              <textarea rows={4} className={inputClass} value={form.features} onChange={(e) => set("features", e.target.value)} />
            </label>
          </div>

          <label className="text-sm block mt-4">
            <span className="block text-cocoa-deep font-medium mb-1">Alérgenos (opcional)</span>
            <input className={inputClass} value={form.allergens} onChange={(e) => set("allergens", e.target.value)} placeholder="Contiene leche." />
          </label>

          {/* Imagen */}
          <div className="mt-4">
            <span className="block text-cocoa-deep font-medium mb-1 text-sm">Imagen principal</span>
            <div className="flex items-center gap-4 flex-wrap">
              {form.image && (
                <Image src={form.image} alt="" width={64} height={64} className="w-16 h-16 rounded-lg object-cover border border-cream-darker" />
              )}
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cream-darker text-sm text-cocoa-deep hover:bg-cream cursor-pointer">
                <Upload size={15} />
                {uploading ? "Subiendo..." : "Subir imagen"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
              </label>
              <input
                className={inputClass + " flex-1 min-w-[200px]"}
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="/images/... o URL"
              />
            </div>
          </div>

          <label className="text-sm block mt-4">
            <span className="block text-cocoa-deep font-medium mb-1">Galería (una URL por línea, opcional)</span>
            <textarea rows={2} className={inputClass} value={form.images} onChange={(e) => set("images", e.target.value)} />
          </label>

          {/* Personalización */}
          <label className="flex items-center gap-2 mt-4 text-sm text-cocoa-deep">
            <input type="checkbox" checked={form.customizable} onChange={(e) => set("customizable", e.target.checked)} />
            Personalizable (arma tu caja por sabores)
          </label>
          {form.customizable && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <label className="text-sm">
                <span className="block text-cocoa-deep font-medium mb-1">Sabores (uno por línea)</span>
                <textarea rows={3} className={inputClass} value={form.flavorOptions} onChange={(e) => set("flavorOptions", e.target.value)} />
              </label>
              <label className="text-sm">
                <span className="block text-cocoa-deep font-medium mb-1">Unidades por caja</span>
                <input type="number" className={inputClass} value={form.boxSize} onChange={(e) => set("boxSize", e.target.value)} />
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setForm(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant border border-cream-darker/60 hover:bg-cream transition-colors">
              Cancelar
            </button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-cocoa-deep text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-taupe py-12 text-center">Cargando...</p>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-darker/60 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-cream border-b border-cream-darker/60">
              <tr>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Producto</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Categoría</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Precio</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Stock</th>
                <th className="text-left py-3 px-4 text-on-surface-variant font-semibold">Estado</th>
                <th className="text-right py-3 px-4 text-on-surface-variant font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={`border-b border-cream-darker/40 ${p.active ? "" : "opacity-50"}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <Image src={p.image} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-cover border border-cream-darker" />
                      )}
                      <div>
                        <p className="font-medium text-cocoa-deep">{p.name}</p>
                        <p className="text-xs text-taupe">{p.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant capitalize">{p.category}</td>
                  <td className="py-3 px-4 text-cocoa-deep font-semibold">S/ {p.price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    {/* Stock + atajos: −1 registra una venta manual, +1 una
                        reposición. Cada clic deja su movimiento en el historial. */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => moveStock(p, -1, "venta_manual")}
                        disabled={p.stock === null || p.stock <= 0 || stockBusy === p.id}
                        className="w-6 h-6 rounded border border-cream-darker text-cocoa-deep disabled:opacity-30 hover:bg-cream transition-colors"
                        title="Registrar venta manual (−1)"
                      >
                        −
                      </button>
                      <span
                        className={`min-w-[3.5rem] text-center text-xs font-semibold px-2 py-1 rounded-full ${availabilityClasses(availabilityOf(p.stock))}`}
                      >
                        {p.stock === null ? "Bajo pedido" : `${p.stock} u.`}
                      </span>
                      <button
                        onClick={() => moveStock(p, 1, "reposicion")}
                        disabled={p.stock === null || stockBusy === p.id}
                        className="w-6 h-6 rounded border border-cream-darker text-cocoa-deep disabled:opacity-30 hover:bg-cream transition-colors"
                        title="Reponer (+1)"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {p.active ? (
                      <span className="text-xs font-medium text-green-700">Activo</span>
                    ) : (
                      <span className="text-xs text-taupe">Archivado</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setForm(productToForm(p))} className="inline-flex items-center gap-1 text-xs text-cocoa-deep hover:text-caramel transition-colors" title="Editar">
                        <Pencil size={15} /> Editar
                      </button>
                      {p.active ? (
                        <button onClick={() => archive(p)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:opacity-80 transition-opacity" title="Archivar">
                          <Archive size={15} /> Archivar
                        </button>
                      ) : (
                        <button onClick={() => reactivate(p)} className="inline-flex items-center gap-1 text-xs text-green-700 hover:opacity-80 transition-opacity" title="Reactivar">
                          <RotateCcw size={15} /> Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
