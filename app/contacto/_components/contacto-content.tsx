"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Clock, Phone, Send, ArrowRight, Camera, Music } from "lucide-react";

export default function ContactoPage() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });
  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/banner-hero-1.png"
          alt="Contacto Mishkitashua"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-cocoa-deep/40" />
        <div className="relative text-center px-5">
          <h1
            className="text-4xl md:text-6xl font-medium text-white mb-4 italic drop-shadow-lg"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Contáctenos
          </h1>
          <p className="text-white/90 max-w-xl mx-auto drop-shadow">
            Ya sea que estés consultando sobre un pedido personalizado, un
            evento especial o simplemente quieras saludarnos, nos encantaría
            saber de ti.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="#fbf9f1" />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 md:px-16 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info */}
          <div className="lg:col-span-5 space-y-6">
            <h2
              className="text-2xl md:text-3xl font-medium text-cocoa-deep mb-6"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Visita Nuestra Panadería
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-caramel" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-taupe uppercase tracking-wide mb-1">
                    Dirección
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Huaraz, Áncash
                  </p>
                  <p className="text-sm text-on-surface-variant">Perú</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-caramel" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-taupe uppercase tracking-wide mb-1">
                    Horarios
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Martes - Viernes: 7am - 5pm
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Sábado - Domingo: 8am - 4pm
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Lunes: Cerrado
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-caramel" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-taupe uppercase tracking-wide mb-1">
                    Teléfono
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    +51 943 247 410
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-cream-darker/60 h-[220px]">
              <iframe
                title="Ubicación Mishkitashua - Huaraz, Áncash"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31228.22508468825!2d-77.53700795!3d-9.5260!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91a90c2a4b3e6e1f%3A0x1234567890abcdef!2sHuaraz%2C%20%C3%81ncash%2C%20Per%C3%BA!5e0!3m2!1ses!2spe!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-cream-darker/60 p-6 md:p-8">
              <h2
                className="text-2xl font-semibold text-cocoa-deep mb-6"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Envíanos un Mensaje
              </h2>

              {sent ? (
                <div className="text-center py-12">
                  <Send size={40} className="text-caramel mx-auto mb-4" />
                  <h3
                    className="text-xl font-semibold text-cocoa-deep mb-2"
                    style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                  >
                    ¡Mensaje enviado!
                  </h3>
                  <p className="text-on-surface-variant">
                    Te responderemos lo más pronto posible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                        placeholder="jane@ejemplo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                      ¿Sobre qué es esto?
                    </label>
                    <select
                      name="asunto"
                      value={form.asunto}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="pedido">Pedido Personalizado</option>
                      <option value="catering">Catering para Eventos</option>
                      <option value="general">Comentarios Generales</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-cocoa-deep mb-1.5">
                      Tu Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      value={form.mensaje}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors resize-none"
                      placeholder="Cuéntanos sobre tus antojos dulces..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-8 py-4 rounded-lg hover:bg-cocoa-deep transition-colors"
                  >
                    Enviar Mensaje
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Section */}
      <section className="bg-cream-dark py-16 border-t border-cream-darker/40">
        <div className="max-w-7xl mx-auto px-5 md:px-16 text-center">
          <h2
            className="text-2xl md:text-3xl font-medium text-cocoa-deep mb-6 italic"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Sigue Nuestro Dulce Viaje
          </h2>
          <div className="flex justify-center gap-4">
            <a
              href="https://www.instagram.com/mishkitashua"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white border border-cream-darker/60 flex items-center justify-center text-cocoa-deep hover:text-caramel hover:border-caramel transition-colors"
              aria-label="Instagram"
            >
              <Camera size={22} />
            </a>
            <a
              href="https://www.tiktok.com/@mishkitashua"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white border border-cream-darker/60 flex items-center justify-center text-cocoa-deep hover:text-caramel hover:border-caramel transition-colors"
              aria-label="TikTok"
            >
              <Music size={22} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
