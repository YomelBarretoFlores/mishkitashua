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
export async function getCampaignAudience(): Promise<Audience> {
  const subscribed = await prisma.customer.findMany({
    where: { marketingOptIn: true, email: { not: "" } },
    select: { email: true },
  });
  const recipients = subscribed
    .map((c) => c.email)
    .filter((e) => isDeliverable(e));
  return { recipients, skipped: subscribed.length - recipients.length };
}
