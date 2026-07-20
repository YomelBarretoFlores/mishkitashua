import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { sendEmail } from "@/app/lib/resend";
import { getCampaignAudience } from "@/app/lib/email-audience";
import { promoCampaignEmail } from "@/app/lib/emails/templates";
import { getProductBySlug } from "@/app/lib/products";
import { enforceRateLimit } from "@/app/lib/ratelimit";
import { unsubscribeUrl, unsubscribeApiUrl } from "@/app/lib/unsubscribe";

const schema = z.object({ promotionId: z.string().min(1).max(60) });

// Los correos se mandan uno a uno, así que el tiempo crece con la lista. Sin
// esto, una audiencia grande cortaba a mitad del envío.
export const maxDuration = 300;

// Envía una promoción por correo a los clientes que aceptaron marketing.
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  // Cada llamada dispara un envío masivo: sin límite, un clic repetido quema
  // la cuota de Resend y arriesga el bloqueo del dominio.
  const limited = enforceRateLimit(request, "admin-campaign", 3, 60_000);
  if (limited) return limited;

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

  // El correo describe la promoción completa: sin el tipo y el valor, un
  // "20% de descuento" llegaba como un título suelto sin la oferta.
  const promoData = {
    title: promo.title,
    description: promo.description,
    type: promo.type,
    value: promo.value,
    minPurchase: promo.minPurchase,
    giftDescription: promo.giftDescription,
    productName: promo.productSlug
      ? ((await getProductBySlug(promo.productSlug))?.name ?? null)
      : null,
    endsAt: promo.endsAt,
  };

  let sent = 0;
  let simulated = false;
  // El correo se arma por destinatario porque el enlace de baja va firmado con
  // su id: no puede ser el mismo HTML para todos.
  for (const r of recipients) {
    const mail = promoCampaignEmail(promoData, unsubscribeUrl(r.id));
    const res = await sendEmail({
      to: r.email,
      ...mail,
      unsubscribeUrl: unsubscribeApiUrl(r.id),
    });
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
