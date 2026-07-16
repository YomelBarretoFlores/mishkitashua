import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { sendEmail } from "@/app/lib/resend";
import { getCampaignAudience } from "@/app/lib/email-audience";
import { promoCampaignEmail } from "@/app/lib/emails/templates";

const schema = z.object({ promotionId: z.string().min(1).max(60) });

// Envía una promoción por correo a los clientes que aceptaron marketing.
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const promo = await prisma.promotion.findUnique({
    where: { id: parsed.data.promotionId },
  });
  if (!promo) {
    return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 });
  }

  const { recipients, skipped } = await getCampaignAudience();

  const mail = promoCampaignEmail({
    title: promo.title,
    description: promo.description,
  });

  let sent = 0;
  let simulated = false;
  for (const email of recipients) {
    const res = await sendEmail({ to: email, ...mail });
    if (res.ok) sent++;
    if (res.simulated) simulated = true;
  }

  return NextResponse.json({
    ok: true,
    recipients: recipients.length,
    skipped,
    sent,
    simulated,
  });
}
