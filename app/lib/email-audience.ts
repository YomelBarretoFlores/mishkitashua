import { prisma } from "@/app/lib/prisma";

// Dominios que no existen: enviarles correo genera rebotes, y una tasa alta de
// rebotes hace que el proveedor (Amazon SES) suspenda el dominio. Se excluyen
// de toda campaña.
const TEST_DOMAINS = new Set([
  "demo.mishkitashua.com",
  "example.com",
  "example.org",
  "test.com",
  "localhost",
]);

export function isDeliverable(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  if (TEST_DOMAINS.has(domain)) return false;
  if (domain.endsWith(".test") || domain.endsWith(".invalid")) return false;
  return true;
}

export type Audience = {
  recipients: string[];
  skipped: number;
};

// Destinatarios de una campaña: suscritos a marketing y con correo entregable.
// Se deduplica por correo: una misma persona puede tener varias filas (p. ej.
// una compra antigua y su cuenta actual) y recibiría el mismo envío dos veces.
export async function getCampaignAudience(): Promise<Audience> {
  const subscribed = await prisma.customer.findMany({
    where: { marketingOptIn: true, email: { not: "" } },
    select: { email: true },
  });
  const unique = new Map<string, string>();
  for (const c of subscribed) {
    const key = c.email.trim().toLowerCase();
    if (!unique.has(key)) unique.set(key, c.email);
  }
  const recipients = [...unique.values()].filter(isDeliverable);
  return { recipients, skipped: unique.size - recipients.length };
}
