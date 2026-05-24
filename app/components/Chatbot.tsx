"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ArrowRight } from "lucide-react";
import Link from "next/link";
import { products } from "@/app/lib/products";
import { trackEvent } from "@/app/lib/analytics";

type Message = {
  from: "bot" | "user";
  text: string;
  options?: { label: string; key: string }[];
  link?: { label: string; href: string };
};

const productList = products
  .map((p) => `• ${p.name}: S/ ${p.price.toFixed(2)} (${p.weight})`)
  .join("\n");

const ingredientsList = products
  .map(
    (p) =>
      `${p.name}:\n${p.ingredients.map((i) => `  - ${i}`).join("\n")}${p.allergens ? `\n  Alérgenos: ${p.allergens}` : ""}`
  )
  .join("\n\n");

const MENU_OPTIONS = [
  { label: "Productos y precios", key: "productos" },
  { label: "Ingredientes y alérgenos", key: "ingredientes" },
  { label: "Envíos y entregas", key: "envios" },
  { label: "Métodos de pago", key: "pagos" },
  { label: "Horarios y contacto", key: "horarios" },
  { label: "Hacer un pedido", key: "pedido" },
];

function getResponse(key: string): Message {
  switch (key) {
    case "productos":
      return {
        from: "bot",
        text: `Nuestros productos:\n\n${productList}\n\nTodos elaborados con ingredientes andinos seleccionados.`,
        link: { label: "Ver productos", href: "/productos" },
        options: [{ label: "← Volver al menú", key: "menu" }],
      };
    case "ingredientes":
      return {
        from: "bot",
        text: `Ingredientes por producto:\n\n${ingredientsList}`,
        link: { label: "Más info en Ayuda", href: "/ayuda" },
        options: [{ label: "← Volver al menú", key: "menu" }],
      };
    case "envios":
      return {
        from: "bot",
        text: "Tiempos de envío:\n\n• Lima Metropolitana: 24 a 48 horas hábiles\n• Provincias: 3 a 5 días hábiles (por agencias asociadas)\n\nEl costo de envío se calcula en el checkout según tu ubicación.",
        link: { label: "Más info en Ayuda", href: "/ayuda" },
        options: [{ label: "← Volver al menú", key: "menu" }],
      };
    case "pagos":
      return {
        from: "bot",
        text: "Métodos de pago aceptados:\n\n• Tarjeta de crédito / débito\n• Transferencia bancaria\n\nTodas las transacciones son seguras.",
        link: { label: "Ir a comprar", href: "/productos" },
        options: [{ label: "← Volver al menú", key: "menu" }],
      };
    case "horarios":
      return {
        from: "bot",
        text: "Horarios de atención:\n\n• Martes a Viernes: 7am - 5pm\n• Sábado y Domingo: 8am - 4pm\n• Lunes: Cerrado\n\nUbicación: Huaraz, Áncash, Perú\nTeléfono: +51 943 247 410",
        link: { label: "Página de contacto", href: "/contacto" },
        options: [{ label: "← Volver al menú", key: "menu" }],
      };
    case "pedido":
      return {
        from: "bot",
        text: "Para hacer un pedido:\n\n1. Elige tus productos en nuestra tienda\n2. Agrégalos al carrito\n3. Completa el checkout con tus datos\n4. Recibirás un número de seguimiento\n\n¿Listo para empezar?",
        link: { label: "Ir a la tienda", href: "/productos" },
        options: [{ label: "← Volver al menú", key: "menu" }],
      };
    case "menu":
      return {
        from: "bot",
        text: "¿En qué más puedo ayudarte?",
        options: MENU_OPTIONS,
      };
    default:
      return {
        from: "bot",
        text: "No entendí tu consulta. Puedes elegir una opción del menú o contactarnos directamente por WhatsApp.",
        options: MENU_OPTIONS,
      };
  }
}

function matchKeyword(text: string): string {
  const lower = text.toLowerCase();
  if (
    lower.includes("precio") ||
    lower.includes("producto") ||
    lower.includes("cuesta") ||
    lower.includes("alfajor") ||
    lower.includes("manjar")
  )
    return "productos";
  if (
    lower.includes("ingrediente") ||
    lower.includes("alérgen") ||
    lower.includes("leche") ||
    lower.includes("gluten")
  )
    return "ingredientes";
  if (
    lower.includes("envío") ||
    lower.includes("envio") ||
    lower.includes("delivery") ||
    lower.includes("entrega")
  )
    return "envios";
  if (
    lower.includes("pago") ||
    lower.includes("tarjeta") ||
    lower.includes("transferencia")
  )
    return "pagos";
  if (
    lower.includes("horario") ||
    lower.includes("dirección") ||
    lower.includes("ubicación") ||
    lower.includes("contacto") ||
    lower.includes("teléfono")
  )
    return "horarios";
  if (
    lower.includes("pedido") ||
    lower.includes("comprar") ||
    lower.includes("ordenar")
  )
    return "pedido";
  return "unknown";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "¡Hola! Soy el asistente de Mishkitashua. ¿En qué puedo ayudarte?",
      options: MENU_OPTIONS,
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpen = () => {
    setOpen(true);
    trackEvent("chatbot_open");
  };

  const handleOption = (key: string) => {
    if (key === "menu") {
      setMessages((prev) => [...prev, getResponse("menu")]);
      return;
    }
    const optionLabel =
      MENU_OPTIONS.find((o) => o.key === key)?.label || key;
    setMessages((prev) => [
      ...prev,
      { from: "user", text: optionLabel },
      getResponse(key),
    ]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = { from: "user", text: input };
    const key = matchKeyword(input);
    setMessages((prev) => [...prev, userMsg, getResponse(key)]);
    setInput("");
  };

  return (
    <>
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-cocoa-deep text-white rounded-full flex items-center justify-center shadow-lg hover:bg-cocoa transition-all duration-300 hover:scale-110"
          aria-label="Abrir chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 left-6 z-50 w-[340px] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-cream-darker/60">
          {/* Header */}
          <div className="bg-cocoa-deep text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span
                className="font-medium"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Asistente Mishkitashua
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-cream">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.from === "bot"
                      ? "bg-white text-cocoa-deep border border-cream-darker/40"
                      : "bg-cocoa text-white ml-auto"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.link && (
                  <Link
                    href={msg.link.href}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1 text-xs text-caramel font-semibold mt-1.5 ml-1 hover:underline"
                  >
                    {msg.link.label}
                    <ArrowRight size={12} />
                  </Link>
                )}
                {msg.options && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => handleOption(opt.key)}
                        className="text-xs bg-cream-dark text-cocoa-deep border border-cream-darker/60 px-3 py-1.5 rounded-full hover:bg-caramel-light hover:text-cocoa-deep transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="px-3 py-2 border-t border-cream-darker/60 bg-white flex gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
            />
            <button
              type="submit"
              className="p-2 bg-cocoa text-white rounded-lg hover:bg-cocoa-deep transition-colors"
              aria-label="Enviar mensaje"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
