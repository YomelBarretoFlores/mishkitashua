import { NextResponse } from "next/server";
import { adminGuard } from "@/app/lib/auth";
import { findBirthdaysToday, sendBirthdayEmails } from "@/app/lib/birthdays";
import { enforceRateLimit } from "@/app/lib/ratelimit";

// Cuántos cumplen años hoy (para mostrarlo antes de enviar).
export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;
  const people = await findBirthdaysToday();
  return NextResponse.json({ birthdays: people.length });
}

// Envío manual del correo de cumpleaños: mismo comportamiento que el cron
// diario, pero al instante. Útil para demostrarlo sin esperar a las 8am.
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  // Aunque solo el admin llega aquí, cada envío consume cuota de Resend.
  const limited = enforceRateLimit(request, "admin-birthdays", 5, 60_000);
  if (limited) return limited;

  try {
    const result = await sendBirthdayEmails();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[admin/birthdays] error:", error);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
