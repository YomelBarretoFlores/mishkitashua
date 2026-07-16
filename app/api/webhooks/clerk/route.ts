import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { prisma } from "@/app/lib/prisma";
import { linkClerkUserToCustomer } from "@/app/lib/customers";
import { sendEmail } from "@/app/lib/resend";
import { welcomeEmail } from "@/app/lib/emails/templates";

// Webhook de Clerk. Al crearse un usuario: crea/actualiza el Customer en Neon y
// envía el correo de bienvenida.
// El secreto va en CLERK_WEBHOOK_SIGNING_SECRET: ese nombre exacto lo lee
// verifyWebhook() internamente, no es configurable desde aquí.
export async function POST(request: NextRequest) {
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
    console.error(
      "[clerk webhook] falta CLERK_WEBHOOK_SIGNING_SECRET: no se enviará el correo de bienvenida"
    );
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

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
      await linkClerkUserToCustomer({ clerkUserId: data.id, email, name });

      if (email) {
        const mail = welcomeEmail(name);
        await sendEmail({ to: email, ...mail });
      }
    } catch (err) {
      console.error("[clerk webhook] error procesando user.created:", err);
    }
  }

  // Al borrarse una cuenta, su fila conservaría un clerkUserId que ya no existe
  // y quedaría bloqueada: nadie podría reclamarla. Se suelta, manteniendo los
  // pedidos. Requiere suscribir el evento "user.deleted" en el panel de Clerk.
  if (evt.type === "user.deleted" && evt.data.id) {
    try {
      await prisma.customer.updateMany({
        where: { clerkUserId: evt.data.id },
        data: { clerkUserId: null },
      });
    } catch (err) {
      console.error("[clerk webhook] error procesando user.deleted:", err);
    }
  }

  return NextResponse.json({ received: true });
}
