import { createHmac, timingSafeEqual } from "node:crypto";

const BASE_URL = "https://mishkitashua.com";

// Baja de marketing con un enlace firmado. Hace falta porque el pie de los
// correos apuntaba a /cuenta, que exige iniciar sesión: quien compró como
// invitado recibía campañas y no tenía forma de darse de baja.
//
// El token es un HMAC del id del cliente, así que nadie puede dar de baja a
// otro cambiando el id de la URL, y no hay que guardar nada extra en la base.
function secret(): string {
  // Se reutiliza un secreto que ya existe en producción, con un prefijo propio
  // para que estos tokens no valgan en ningún otro sitio.
  return (
    process.env.EMAIL_UNSUBSCRIBE_SECRET ||
    process.env.CRON_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "mishkitashua-dev"
  );
}

export function unsubscribeToken(customerId: string): string {
  return createHmac("sha256", secret())
    .update(`unsubscribe:${customerId}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyUnsubscribeToken(
  customerId: string,
  token: string
): boolean {
  const expected = unsubscribeToken(customerId);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Enlace visible en el pie del correo (abre una página con confirmación).
export function unsubscribeUrl(customerId: string): string {
  return `${BASE_URL}/baja?c=${customerId}&t=${unsubscribeToken(customerId)}`;
}

// Endpoint para la cabecera List-Unsubscribe: lo llama el cliente de correo
// por POST, sin interfaz, así que apunta a la API y no a la página.
export function unsubscribeApiUrl(customerId: string): string {
  return `${BASE_URL}/api/baja?c=${customerId}&t=${unsubscribeToken(customerId)}`;
}
