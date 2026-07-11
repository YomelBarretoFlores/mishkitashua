"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

type Profile = {
  name: string;
  phone: string;
  address: string;
  city: string;
  birthdate: string;
  marketingOptIn: boolean;
};

export default function AccountForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState<Profile>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof Profile, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        birthdate: form.birthdate || null,
      }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
    else setError("No se pudo guardar. Revisa los datos e inténtalo de nuevo.");
  };

  const input =
    "w-full px-4 py-3 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors";
  const label = "block text-sm font-semibold text-cocoa-deep mb-1.5";

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8 space-y-5"
    >
      <div>
        <label className={label}>Nombre completo</label>
        <input
          className={input}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          placeholder="María Rodríguez"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Teléfono</label>
          <input
            className={input}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+51 999 999 999"
          />
        </div>
        <div>
          <label className={label}>Fecha de nacimiento 🎂</label>
          <input
            type="date"
            className={input}
            value={form.birthdate}
            onChange={(e) => set("birthdate", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={label}>Dirección</label>
        <input
          className={input}
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Av. Libertador 1234"
        />
      </div>

      <div>
        <label className={label}>Ciudad</label>
        <input
          className={input}
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Huaraz"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.marketingOptIn}
          onChange={(e) => set("marketingOptIn", e.target.checked)}
          className="mt-1 w-4 h-4 accent-cocoa"
        />
        <span className="text-sm text-on-surface-variant">
          Quiero recibir promociones, ofertas flash y un regalo en mi cumpleaños
          por correo. (Puedes darte de baja cuando quieras.)
        </span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && (
        <p className="flex items-center gap-2 text-sm text-green-700 font-medium">
          <CheckCircle size={16} /> ¡Datos guardados!
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-cocoa text-white font-semibold px-6 py-3 rounded-lg hover:bg-cocoa-deep transition-colors disabled:opacity-60"
      >
        {saving ? "Guardando..." : "Guardar datos"}
      </button>
    </form>
  );
}
