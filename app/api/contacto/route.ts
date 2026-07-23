import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/app/lib/resend";
import { contactMessageEmail } from "@/app/lib/emails/templates";
import { enforceRateLimit } from "@/app/lib/ratelimit";

const schema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().email().max(160),
  asunto: z.string().trim().max(80).optional().nullable(),
  mensaje: z.string().trim().min(5).max(2000),
});

// Recibe el formulario de contacto y lo reenvía a la bandeja de la marca.
// Antes el formulario solo mostraba "enviado" y descartaba el texto: nunca
// llegaba nada a ninguna parte.
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "contacto", 5, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa tu nombre, correo y mensaje (mínimo 5 caracteres)" },
      { status: 400 }
    );
  }
  const { nombre, email, asunto, mensaje } = parsed.data;

  // Destino: la bandeja real que ya se usa para las respuestas de clientes.
  const destino = process.env.CONTACT_INBOX || process.env.EMAIL_REPLY_TO;
  if (!destino) {
    console.error("[contacto] sin CONTACT_INBOX ni EMAIL_REPLY_TO configurados");
    return NextResponse.json(
      { error: "El formulario no está disponible ahora mismo" },
      { status: 503 }
    );
  }

  // A diferencia de otros correos, aquí se responde AL CLIENTE: el Reply-To es
  // su dirección, así que basta con darle a "responder" en la bandeja.
  const result = await sendEmail({
    to: destino,
    replyTo: email,
    ...contactMessageEmail({ nombre, email, asunto, mensaje }),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje. Escríbenos por WhatsApp." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
