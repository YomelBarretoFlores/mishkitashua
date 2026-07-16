import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { birthdayEmail } from "@/app/lib/emails/templates";

// Cron diario: envía un cupón de cumpleaños a los clientes que cumplen HOY y
// aceptaron marketing. Vercel Cron incluye "Authorization: Bearer $CRON_SECRET".
export async function GET(request: Request) {
  // Falla cerrado: sin CRON_SECRET el endpoint queda bloqueado, nunca abierto.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/birthdays] CRON_SECRET no configurada; endpoint bloqueado");
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const today = new Date();
  const m = today.getMonth();
  const d = today.getDate();

  const candidates = await prisma.customer.findMany({
    where: { marketingOptIn: true, birthdate: { not: null }, email: { not: "" } },
    select: { name: true, email: true, birthdate: true },
  });

  const birthdayPeople = candidates.filter((c) => {
    const b = c.birthdate!;
    return b.getMonth() === m && b.getDate() === d;
  });

  let sent = 0;
  for (const person of birthdayPeople) {
    const code = `CUMPLE-${Math.abs(hash(person.email)) % 10000}`
      .padEnd(11, "0")
      .slice(0, 11);
    const mail = birthdayEmail(person.name.split(" ")[0] || person.name, code);
    const r = await sendEmail({ to: person.email, ...mail });
    if (r.ok) sent++;
  }

  return NextResponse.json({ ok: true, birthdays: birthdayPeople.length, sent });
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
