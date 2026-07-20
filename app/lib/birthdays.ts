import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { isDeliverable } from "@/app/lib/email-audience";
import { unsubscribeUrl, unsubscribeApiUrl } from "@/app/lib/unsubscribe";
import { birthdayEmail } from "@/app/lib/emails/templates";
import {
  issueBirthdayCoupon,
  BIRTHDAY_DISCOUNT,
  BIRTHDAY_VALID_DAYS,
} from "@/app/lib/coupons";

// `simulated` avisa de que no salió ningún correo real (falta RESEND_API_KEY):
// sin ese dato, el panel decía "enviados: 3" sin haber enviado nada.
export type BirthdayRun = {
  birthdays: number;
  sent: number;
  simulated: boolean;
};

// La fecha de nacimiento se guarda como medianoche UTC ("YYYY-MM-DD"), así que
// se compara en UTC. "Hoy" es el día en Perú (UTC-5, sin horario de verano):
// el servidor corre en UTC y de otro modo adelantaría el cumpleaños 5 horas.
function peruMonthDay(): { month: number; day: number } {
  const peru = new Date(Date.now() - 5 * 60 * 60 * 1000);
  return { month: peru.getUTCMonth(), day: peru.getUTCDate() };
}

export async function findBirthdaysToday() {
  const { month, day } = peruMonthDay();
  const candidates = await prisma.customer.findMany({
    where: { marketingOptIn: true, birthdate: { not: null }, email: { not: "" } },
    select: { id: true, name: true, email: true, birthdate: true },
  });
  const hoy = candidates.filter((c) => {
    const b = c.birthdate!;
    return b.getUTCMonth() === month && b.getUTCDate() === day;
  });
  // Una persona puede tener varias filas (una compra antigua y su cuenta
  // actual): sin deduplicar recibiría el mismo cupón varias veces.
  const unique = new Map<string, (typeof hoy)[number]>();
  for (const c of hoy) {
    const key = c.email.trim().toLowerCase();
    if (!unique.has(key)) unique.set(key, c);
  }
  // Mismo filtro que las campañas: los clientes de ejemplo (@demo…) tienen
  // correos que no existen, y escribirles cada año genera rebotes duros que
  // acaban dañando la reputación del dominio de envío.
  return [...unique.values()].filter((c) => isDeliverable(c.email));
}

// Envía el cupón a quienes cumplen años hoy. Lo usan el cron diario y el botón
// de envío manual del admin, para que ambos se comporten igual.
export async function sendBirthdayEmails(): Promise<BirthdayRun> {
  const people = await findBirthdaysToday();
  let sent = 0;
  let simulated = false;
  for (const person of people) {
    // El cupón se emite ANTES de escribir: si algo falla al enviar, el cliente
    // conserva su regalo y el reenvío reutiliza el mismo código.
    const code = await issueBirthdayCoupon(person.id);
    const mail = birthdayEmail(
      person.name.split(" ")[0] || person.name,
      { code, discount: BIRTHDAY_DISCOUNT, validDays: BIRTHDAY_VALID_DAYS },
      unsubscribeUrl(person.id)
    );
    const r = await sendEmail({
      to: person.email,
      ...mail,
      unsubscribeUrl: unsubscribeApiUrl(person.id),
    });
    if (r.simulated) simulated = true;
    if (r.ok) sent++;
  }
  return { birthdays: people.length, sent, simulated };
}
