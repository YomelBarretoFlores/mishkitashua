// Plantillas de correo. Los clientes de email no soportan hojas de estilo
// externas ni flexbox de forma fiable: todo va en línea y maquetado con tablas.

const BASE = "https://mishkitashua.com";
const COCOA = "#3e2723";
const CARAMEL = "#b06a3b";
const CREAM = "#fbf9f1";
const SAND = "#faf6ee";
const BORDER = "#efe7d9";
const TEXT = "#5b5147";
const MUTED = "#9a8f80";
// Georgia está en Windows, macOS y Android; el serif de la marca no existe en
// el correo, así que se aproxima con la pila de fuentes del sistema.
const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// Escapa lo que viene de la base de datos: un título con "<" rompería el HTML
// del correo, y un <script> o un href ajeno serían inyección directa.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// `unsubscribe` solo lo pasan los correos de marketing (promociones y
// cumpleaños). Los transaccionales (pedido, devolución) no llevan baja: no se
// puede renunciar a que te avisen de tu propia compra.
function layout(inner: string, preheader = "", unsubscribe?: string): string {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light only"/>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:${SANS};-webkit-font-smoothing:antialiased">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:${CREAM}">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${BORDER}">
        <tr><td style="background:${COCOA};padding:28px;text-align:center">
          <div style="color:#ffffff;font-family:${SERIF};font-size:26px;letter-spacing:.4px">Mishkitashua</div>
          <div style="color:#c9ab8d;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;margin-top:6px">Sabores que nacen de nuestra tierra</div>
        </td></tr>
        <tr><td style="padding:36px 32px">${inner}</td></tr>
        <tr><td style="padding:22px 32px;background:${SAND};border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;line-height:1.7;text-align:center">
          Mishkitashua &middot; Huaraz, Áncash, Perú${
            unsubscribe
              ? `<br/><a href="${unsubscribe}" style="color:${CARAMEL};text-decoration:underline">Darte de baja</a> de estos correos.`
              : ""
          }
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

// Botón maquetado con tabla: Outlook ignora el padding de un <a>.
function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto">
    <tr><td align="center" style="background:${COCOA};border-radius:8px">
      <a href="${href}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;font-family:${SANS}">${label}</a>
    </td></tr></table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 14px;color:${COCOA};font-family:${SERIF};font-size:26px;font-weight:400;line-height:1.3;text-align:center">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 18px;color:${TEXT};font-size:15px;line-height:1.7;text-align:center">${text}</p>`;
}

// Recuadro para destacar el dato principal (la oferta, el cupón, el total).
function highlight(label: string, value: string, note = ""): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
    <tr><td align="center" style="background:${SAND};border:1px solid ${BORDER};border-radius:12px;padding:24px">
      <div style="color:${CARAMEL};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase">${label}</div>
      <div style="color:${COCOA};font-family:${SERIF};font-size:32px;line-height:1.2;margin-top:8px">${value}</div>
      ${note ? `<div style="color:${MUTED};font-size:13px;margin-top:8px">${note}</div>` : ""}
    </td></tr></table>`;
}

export function welcomeEmail(name: string): { subject: string; html: string } {
  const inner = `
    ${heading(`Bienvenido, ${esc(name)}`)}
    ${paragraph(
      "Gracias por unirte. Nuestros alfajores y manjares se elaboran en Huaraz con ingredientes andinos: tuna, aguaymanto y muña."
    )}
    ${highlight("Tu primera compra", "Envío gratis", "Se aplica solo, sin códigos")}
    ${paragraph(
      "También te avisaremos de nuestras promociones y te escribiremos el día de tu cumpleaños."
    )}
    <div style="text-align:center;margin-top:26px">${button(`${BASE}/productos`, "Ver productos")}</div>`;
  return {
    subject: "Bienvenido a Mishkitashua",
    html: layout(inner, "Tu primera compra tiene envío gratis"),
  };
}

export function orderConfirmationEmail(order: {
  orderNumber: string;
  items: { productName: string; quantity: number; price?: number }[];
  subtotal?: number;
  discount?: number; // total descontado (promociones + cupón)
  couponDiscount?: number; // la parte que aportó el cupón
  shippingCost?: number;
  total: number;
  paymentMethod?: string;
  couponCode?: string | null;
}): { subject: string; html: string } {
  // Filas de producto con precio unitario y subtotal por línea (comprobante).
  const rows = order.items
    .map((i) => {
      const lineTotal = i.price != null ? i.price * i.quantity : null;
      const detail =
        i.price != null
          ? `${i.quantity} × S/ ${i.price.toFixed(2)}`
          : `× ${i.quantity}`;
      return `<tr>
          <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${TEXT};font-size:14px">
            ${esc(i.productName)}
            <div style="color:${MUTED};font-size:12px;margin-top:2px">${detail}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${TEXT};font-size:14px;text-align:right;white-space:nowrap">${
            lineTotal != null ? `S/ ${lineTotal.toFixed(2)}` : ""
          }</td>
        </tr>`;
    })
    .join("");

  // Fila de resumen (label + monto), opcional.
  const summaryRow = (label: string, value: string, strong = false) =>
    `<tr>
      <td style="padding:6px 0;color:${strong ? COCOA : MUTED};font-size:${strong ? "15px" : "13px"};${strong ? "font-weight:600" : ""}">${esc(label)}</td>
      <td style="padding:6px 0;color:${strong ? COCOA : TEXT};font-size:${strong ? "15px" : "13px"};text-align:right;white-space:nowrap;${strong ? "font-weight:600" : ""}">${esc(value)}</td>
    </tr>`;

  const summary: string[] = [];
  if (order.subtotal != null) summary.push(summaryRow("Subtotal", `S/ ${order.subtotal.toFixed(2)}`));
  // El descuento se desglosa: el de promociones y el del cupón son cosas
  // distintas, y juntarlos bajo el código del cupón daba a entender que el
  // cupón descontaba más de lo que realmente descuenta.
  const couponDiscount = order.couponDiscount ?? 0;
  const promoDiscount = (order.discount ?? 0) - couponDiscount;
  if (promoDiscount > 0) {
    summary.push(summaryRow("Descuento", `- S/ ${promoDiscount.toFixed(2)}`));
  }
  if (couponDiscount > 0) {
    summary.push(
      summaryRow(
        order.couponCode ? `Cupón ${order.couponCode}` : "Cupón",
        `- S/ ${couponDiscount.toFixed(2)}`
      )
    );
  }
  if (order.shippingCost != null) {
    summary.push(summaryRow("Envío", order.shippingCost > 0 ? `S/ ${order.shippingCost.toFixed(2)}` : "Gratis"));
  }
  if (order.paymentMethod) summary.push(summaryRow("Método de pago", order.paymentMethod));

  const inner = `
    ${heading("Pedido confirmado")}
    ${paragraph(`Recibimos tu pedido <strong style="color:${COCOA}">#${esc(order.orderNumber)}</strong>. Lo prepararemos y te avisaremos cuando salga. Este correo es tu comprobante.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
      <tr><td colspan="2" style="padding-bottom:4px;color:${MUTED};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase">Comprobante</td></tr>
      <tr><td colspan="2">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${BORDER}">
          ${rows}
        </table>
      </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px">
      ${summary.join("")}
      <tr>
        <td style="padding:12px 0 0;border-top:1px solid ${BORDER};color:${COCOA};font-size:15px;font-weight:600">Total</td>
        <td style="padding:12px 0 0;border-top:1px solid ${BORDER};color:${COCOA};font-family:${SERIF};font-size:22px;text-align:right;white-space:nowrap">S/ ${order.total.toFixed(2)}</td>
      </tr>
    </table>
    <div style="text-align:center;margin-top:20px">${button(`${BASE}/seguimiento?q=${encodeURIComponent(order.orderNumber)}`, "Seguir mi pedido")}</div>`;
  return {
    subject: `Pedido confirmado #${order.orderNumber}`,
    html: layout(inner, `Tu pedido #${order.orderNumber} está confirmado`),
  };
}

export function birthdayEmail(
  name: string,
  coupon: { code: string; discount: number; validDays: number },
  unsubscribe?: string
): { subject: string; html: string } {
  const inner = `
    ${heading(`Feliz cumpleaños, ${esc(name)}`)}
    ${paragraph(
      "Hoy es tu día y queremos celebrarlo contigo. Este código es solo tuyo:"
    )}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
      <tr><td align="center" style="background:${COCOA};border-radius:12px;padding:26px">
        <div style="color:#c9ab8d;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase">${coupon.discount}% de descuento</div>
        <div style="color:#ffffff;font-family:${SERIF};font-size:30px;letter-spacing:3px;margin:10px 0">${esc(coupon.code)}</div>
        <div style="color:#c9ab8d;font-size:13px">Válido ${coupon.validDays} días · un solo uso</div>
      </td></tr>
    </table>
    ${paragraph("Escríbelo en el checkout, en el campo de cupón, antes de pagar.")}
    <div style="text-align:center;margin-top:26px">${button(`${BASE}/productos`, "Usar mi regalo")}</div>`;
  return {
    subject: `${name}, tu regalo de cumpleaños te espera`,
    html: layout(inner, `${coupon.discount}% de descuento para tu día`, unsubscribe),
  };
}

// Describe la promoción tal como la aplica el motor (app/lib/promotions.ts):
// sin códigos, en automático al llegar al checkout.
function describePromotion(promo: {
  type: string;
  value?: number | null;
  minPurchase?: number | null;
  giftDescription?: string | null;
  productName?: string | null;
}): { label: string; note: string } {
  const enProducto = promo.productName
    ? `Solo en ${promo.productName}`
    : "En todos los productos";
  switch (promo.type) {
    case "flash_discount":
      return {
        label: `${promo.value ?? 0}% de descuento`,
        note: enProducto,
      };
    case "buy_x_get_y":
      return {
        label: "2 × 1",
        note: promo.productName
          ? `Lleva 2 de ${promo.productName} y paga 1`
          : "Cada 2 unidades, 1 gratis",
      };
    case "free_shipping":
      return {
        label: "Envío gratis",
        note: promo.minPurchase
          ? `En compras desde S/ ${promo.minPurchase.toFixed(2)}`
          : "En tu pedido",
      };
    case "free_gift":
      return {
        label: promo.giftDescription || "Regalo sorpresa",
        note: promo.minPurchase
          ? `En compras desde S/ ${promo.minPurchase.toFixed(2)}`
          : "Con tu pedido",
      };
    default:
      return { label: "Oferta especial", note: enProducto };
  }
}

export function promoCampaignEmail(promo: {
  title: string;
  description?: string | null;
  type: string;
  value?: number | null;
  minPurchase?: number | null;
  giftDescription?: string | null;
  productName?: string | null;
  endsAt?: Date | string | null;
}, unsubscribe?: string): { subject: string; html: string } {
  const offer = describePromotion(promo);
  const hasta = promo.endsAt
    ? new Date(promo.endsAt).toLocaleDateString("es-PE", {
        day: "numeric",
        month: "long",
        timeZone: "America/Lima",
      })
    : null;

  const inner = `
    ${heading(esc(promo.title))}
    ${promo.description ? paragraph(esc(promo.description)) : ""}
    ${highlight("Promoción", esc(offer.label), esc(offer.note))}
    ${paragraph(
      `Se aplica sola al finalizar tu compra, sin códigos.${
        hasta ? ` Válida hasta el ${hasta}.` : ""
      }`
    )}
    <div style="text-align:center;margin-top:26px">${button(`${BASE}/productos`, "Comprar ahora")}</div>`;

  // Si el título ya dice la oferta ("Envío gratis"), repetirla sobra.
  const sameAsTitle =
    promo.title.trim().toLowerCase() === offer.label.trim().toLowerCase();
  return {
    subject: sameAsTitle ? promo.title : `${promo.title} — ${offer.label}`,
    html: layout(inner, promo.description || offer.note, unsubscribe),
  };
}

// Confirmación al cliente de que recibimos su solicitud de devolución.
export function returnRequestedEmail(data: {
  orderNumber: string;
}): { subject: string; html: string } {
  const inner = `
    ${heading("Solicitud de devolución recibida")}
    ${paragraph(
      `Recibimos tu solicitud de devolución para el pedido <strong style="color:${COCOA}">#${esc(data.orderNumber)}</strong>. La revisaremos y te avisaremos por este medio cuando tengamos una respuesta.`
    )}
    ${paragraph("Gracias por tu paciencia.")}
    <div style="text-align:center;margin-top:26px">${button(`${BASE}/cuenta/devoluciones`, "Ver mis devoluciones")}</div>`;
  return {
    subject: `Devolución recibida · Pedido #${data.orderNumber}`,
    html: layout(inner, "Estamos revisando tu solicitud"),
  };
}

// Resolución de una devolución: aprobada, rechazada o reembolsada.
export function returnResolvedEmail(data: {
  orderNumber: string;
  status: "aprobada" | "rechazada" | "reembolsada";
  adminNote?: string | null;
  refundAmount?: number | null;
}): { subject: string; html: string } {
  const map = {
    aprobada: {
      title: "Devolución aprobada",
      body: "Tu solicitud de devolución fue aprobada. Procesaremos el reembolso a la brevedad y te avisaremos cuando esté hecho.",
      highlightLabel: "Estado",
      highlightValue: "Aprobada",
    },
    rechazada: {
      title: "Sobre tu solicitud de devolución",
      body: "Tras revisar tu solicitud, no pudimos aprobar la devolución en esta ocasión.",
      highlightLabel: "Estado",
      highlightValue: "No aprobada",
    },
    reembolsada: {
      title: "Reembolso realizado",
      body: "Procesamos el reembolso de tu pedido. Según tu banco o método de pago, puede tardar unos días en reflejarse.",
      highlightLabel: "Reembolso",
      highlightValue: data.refundAmount != null
        ? `S/ ${data.refundAmount.toFixed(2)}`
        : "Realizado",
    },
  }[data.status];

  const inner = `
    ${heading(map.title)}
    ${paragraph(`Pedido <strong style="color:${COCOA}">#${esc(data.orderNumber)}</strong>.`)}
    ${paragraph(map.body)}
    ${highlight(map.highlightLabel, esc(map.highlightValue))}
    ${data.adminNote ? paragraph(`Nota: ${esc(data.adminNote)}`) : ""}
    <div style="text-align:center;margin-top:26px">${button(`${BASE}/cuenta/devoluciones`, "Ver mis devoluciones")}</div>`;
  return {
    subject: `Devolución ${data.status} · Pedido #${data.orderNumber}`,
    html: layout(inner, map.title),
  };
}

// Aviso de cambio de estado del pedido. Es transaccional (sin enlace de baja):
// forma parte de la compra, igual que el comprobante.
export function orderStatusEmail(data: {
  orderNumber: string;
  status: "preparando" | "enviado" | "entregado";
}): { subject: string; html: string } {
  const map = {
    preparando: {
      title: "Tu pedido está en preparación",
      body: "Ya estamos preparando tu pedido con todo el cuidado. Te avisamos en cuanto salga.",
      value: "En preparación",
    },
    enviado: {
      title: "Tu pedido va en camino",
      body: "Tu pedido ya salió hacia la dirección que nos diste. Puedes seguirlo desde la web.",
      value: "Enviado",
    },
    entregado: {
      title: "Tu pedido fue entregado",
      body: "¡Que lo disfrutes! Si algo no salió como esperabas, cuéntanos: puedes solicitar una devolución desde tu cuenta.",
      value: "Entregado",
    },
  }[data.status];

  const inner = `
    ${heading(map.title)}
    ${paragraph(`Pedido <strong style="color:${COCOA}">#${esc(data.orderNumber)}</strong>.`)}
    ${paragraph(map.body)}
    ${highlight("Estado", esc(map.value))}
    <div style="text-align:center;margin-top:26px">${button(`${BASE}/seguimiento?q=${encodeURIComponent(data.orderNumber)}`, "Ver seguimiento")}</div>`;
  return {
    subject: `${map.value} · Pedido #${data.orderNumber}`,
    html: layout(inner, map.title),
  };
}

// Mensaje del formulario de contacto, reenviado a la bandeja de la marca.
// No lleva enlace de baja: no es marketing, es correspondencia entrante.
export function contactMessageEmail(data: {
  nombre: string;
  email: string;
  asunto?: string | null;
  mensaje: string;
}): { subject: string; html: string } {
  const asunto = data.asunto?.trim() || "Consulta general";
  const inner = `
    ${heading("Nuevo mensaje de contacto")}
    ${paragraph(`Alguien escribió desde la web. Responde a este correo y le llegará directamente.`)}
    ${highlight("Asunto", esc(asunto))}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px">
      <tr>
        <td style="padding:6px 0;color:${MUTED};font-size:13px;width:90px">Nombre</td>
        <td style="padding:6px 0;color:${TEXT};font-size:13px">${esc(data.nombre)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${MUTED};font-size:13px">Correo</td>
        <td style="padding:6px 0;color:${TEXT};font-size:13px">${esc(data.email)}</td>
      </tr>
    </table>
    <div style="background:${SAND};border:1px solid ${BORDER};border-radius:12px;padding:20px">
      <div style="color:${MUTED};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;margin-bottom:8px">Mensaje</div>
      <div style="color:${TEXT};font-size:14px;line-height:1.7;white-space:pre-wrap">${esc(data.mensaje)}</div>
    </div>`;
  return {
    subject: `Contacto web: ${asunto} — ${data.nombre}`,
    html: layout(inner, `${data.nombre}: ${data.mensaje.slice(0, 80)}`),
  };
}
