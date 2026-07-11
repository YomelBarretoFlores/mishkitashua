import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { welcomeEmail } from "@/app/lib/emails/templates";

// Webhook de Clerk. Al crearse un usuario: crea/actualiza el Customer en Neon y
// envía el correo de bienvenida. Requiere CLERK_WEBHOOK_SECRET.
export async function POST(request: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(request);
  } catch (err) {
    console.error("[clerk webhook] verificación fallida:", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const data = evt.data;
    const email =
      data.email_addresses?.find(
        (e) => e.id === data.primary_email_address_id
      )?.email_address ??
      data.email_addresses?.[0]?.email_address ??
      "";
    const name =
      [data.first_name, data.last_name].filter(Boolean).join(" ") ||
      email ||
      "Cliente";

    try {
      await prisma.customer.upsert({
        where: { clerkUserId: data.id },
        update: { name, email },
        create: {
          clerkUserId: data.id,
          name,
          email,
          phone: "",
          address: "",
          city: "",
        },
      });

      if (email) {
        const mail = welcomeEmail(name);
        await sendEmail({ to: email, ...mail });
      }
    } catch (err) {
      console.error("[clerk webhook] error procesando user.created:", err);
    }
  }

  return NextResponse.json({ received: true });
}
