import { NextResponse } from "next/server";
import { sendBirthdayEmails } from "@/app/lib/birthdays";

// Los correos salen uno a uno; con muchos cumpleañeros el envío se alarga.
export const maxDuration = 300;

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

  const result = await sendBirthdayEmails();
  return NextResponse.json({ ok: true, ...result });
}
