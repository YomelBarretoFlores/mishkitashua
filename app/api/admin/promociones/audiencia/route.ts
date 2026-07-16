import { NextResponse } from "next/server";
import { adminGuard } from "@/app/lib/auth";
import { getCampaignAudience } from "@/app/lib/email-audience";

// Cuántos recibirán una campaña y cuántos se omiten por correo no entregable.
// Se consulta antes de enviar, para no disparar a ciegas.
export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;
  const { recipients, skipped } = await getCampaignAudience();
  return NextResponse.json({ recipients: recipients.length, skipped });
}
