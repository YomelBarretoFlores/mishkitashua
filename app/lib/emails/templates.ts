// Plantillas de correo con estilos en línea (requisito de los clientes de email).
// Estética tipo Temu/AliExpress: color de marca, oferta destacada y CTA grande.

const BASE = "https://mishkitashua.com";
const COCOA = "#3e2723";
const CARAMEL = "#b06a3b";
const CREAM = "#fbf9f1";

function layout(inner: string, preheader = ""): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${CREAM};font-family:Segoe UI,Arial,sans-serif;">
  <span style="display:none;opacity:0;color:${CREAM}">${preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:24px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #efe7d9">
        <tr><td style="background:${COCOA};padding:22px 28px;text-align:center">
          <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:.5px">Mishkitashua</span>
          <div style="color:#e9c9a8;font-size:12px;margin-top:2px">Sabores que nacen de nuestra tierra</div>
        </td></tr>
        <tr><td style="padding:32px 28px">${inner}</td></tr>
        <tr><td style="padding:20px 28px;background:#faf6ee;color:#9a8f80;font-size:12px;text-align:center">
          Mishkitashua · Huaraz, Áncash, Perú<br/>
          <a href="${BASE}/cuenta" style="color:${CARAMEL}">Gestiona tus preferencias de correo</a> para darte de baja.
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${COCOA};color:#fff;text-decoration:none;font-weight:700;padding:14px 30px;border-radius:10px;font-size:15px">${label}</a>`;
}

export function welcomeEmail(name: string): { subject: string; html: string } {
  const inner = `
    <h1 style="color:${COCOA};font-size:24px;margin:0 0 12px">¡Bienvenido/a, ${name}! 🎉</h1>
    <p style="color:#5b5147;font-size:15px;line-height:1.6">
      Gracias por unirte a la familia Mishkitashua. Ya puedes comprar nuestros
      alfajores andinos y manjares artesanales, y recibirás <b>ofertas exclusivas</b>,
      promociones flash y un <b>regalo en tu cumpleaños</b> 🎂.
    </p>
    <div style="background:#fdf0e2;border-radius:12px;padding:18px;margin:20px 0;text-align:center">
      <div style="color:${CARAMEL};font-size:13px;font-weight:700;text-transform:uppercase">Tu primer pedido</div>
      <div style="color:${COCOA};font-size:26px;font-weight:800;margin:4px 0">¡Envío GRATIS! 🚚</div>
    </div>
    <div style="text-align:center;margin-top:8px">${button(`${BASE}/productos`, "Explorar productos")}</div>`;
  return { subject: "¡Bienvenido/a a Mishkitashua! 🎉", html: layout(inner, "Tu dulce andino te espera") };
}

export function orderConfirmationEmail(order: {
  orderNumber: string;
  total: number;
  items: { productName: string; quantity: number }[];
}): { subject: string; html: string } {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;color:#5b5147;font-size:14px">${i.productName} × ${i.quantity}</td></tr>`
    )
    .join("");
  const inner = `
    <h1 style="color:${COCOA};font-size:22px;margin:0 0 8px">¡Gracias por tu compra! ✅</h1>
    <p style="color:#5b5147;font-size:15px;line-height:1.6">Tu pedido <b>#${order.orderNumber}</b> está confirmado. Lo prepararemos con mucho cariño.</p>
    <table width="100%" style="margin:16px 0;border-top:1px solid #efe7d9">${rows}</table>
    <div style="text-align:right;color:${COCOA};font-weight:800;font-size:18px">Total: S/ ${order.total.toFixed(2)}</div>
    <div style="text-align:center;margin-top:20px">${button(`${BASE}/seguimiento?q=${order.orderNumber}`, "Seguir mi pedido")}</div>`;
  return {
    subject: `Pedido confirmado #${order.orderNumber} 🧾`,
    html: layout(inner, "Tu pedido está en camino"),
  };
}

export function birthdayEmail(name: string, code: string): { subject: string; html: string } {
  const inner = `
    <div style="text-align:center;font-size:44px">🎂🎁</div>
    <h1 style="color:${COCOA};font-size:24px;margin:8px 0;text-align:center">¡Feliz cumpleaños, ${name}!</h1>
    <p style="color:#5b5147;font-size:15px;line-height:1.6;text-align:center">
      En Mishkitashua queremos celebrarte con un dulce regalo. Usa este código y date un gusto andino 🍮
    </p>
    <div style="background:${COCOA};border-radius:12px;padding:22px;margin:20px 0;text-align:center">
      <div style="color:#e9c9a8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Cupón de cumpleaños</div>
      <div style="color:#fff;font-size:30px;font-weight:800;letter-spacing:2px;margin-top:6px">${code}</div>
      <div style="color:#e9c9a8;font-size:13px;margin-top:6px">15% de descuento · válido 7 días</div>
    </div>
    <div style="text-align:center">${button(`${BASE}/productos`, "Reclamar mi regalo")}</div>`;
  return { subject: `🎉 ${name}, tu regalo de cumpleaños te espera`, html: layout(inner, "Un regalo dulce para ti") };
}

export function promoCampaignEmail(promo: {
  title: string;
  description?: string | null;
}): { subject: string; html: string } {
  const inner = `
    <div style="text-align:center;font-size:40px">🔥</div>
    <h1 style="color:${COCOA};font-size:26px;margin:8px 0;text-align:center">${promo.title}</h1>
    ${promo.description ? `<p style="color:#5b5147;font-size:15px;line-height:1.6;text-align:center">${promo.description}</p>` : ""}
    <div style="background:#fdf0e2;border-radius:12px;padding:18px;margin:20px 0;text-align:center">
      <div style="color:${CARAMEL};font-size:15px;font-weight:800">¡Solo por tiempo limitado! ⏳</div>
    </div>
    <div style="text-align:center">${button(`${BASE}/productos`, "Comprar ahora")}</div>`;
  return { subject: `🔥 ${promo.title}`, html: layout(inner, promo.description || "Oferta por tiempo limitado") };
}
