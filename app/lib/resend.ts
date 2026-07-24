import { Resend } from "resend";

// Envío de correos con Resend. Si no hay RESEND_API_KEY, entra en MODO
// SIMULACIÓN (registra en consola) para que la demo no se rompa.
const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Mishkitashua <onboarding@resend.dev>";
// El dominio solo tiene envío habilitado, no recepción: las respuestas de los
// clientes se redirigen a una bandeja real (Gmail) vía Reply-To.
const REPLY_TO = process.env.EMAIL_REPLY_TO;

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(opts: {
  /**
   * Uno o varios destinatarios. Se admite lista separada por comas para poder
   * configurar por variable de entorno que un aviso llegue a dos bandejas
   * (p. ej. la dueña del negocio y quien la ayuda) sin tocar código.
   */
  to: string | string[];
  subject: string;
  html: string;
  // Enlace de baja para los correos de marketing. Gmail y Yahoo exigen la
  // cabecera List-Unsubscribe a quien envía en volumen; sin ella, las campañas
  // acaban marcadas como spam.
  unsubscribeUrl?: string;
  // Sobrescribe el Reply-To por defecto. Lo usa el formulario de contacto para
  // que al responder en la bandeja se le escriba al cliente, no a la marca.
  replyTo?: string;
}): Promise<{ ok: boolean; simulated: boolean; error?: string }> {
  // "a@x.com, b@y.com" -> ["a@x.com", "b@y.com"]. Resend acepta ambas formas,
  // pero normalizarlo aquí evita mandarle una cadena con comas como si fuera
  // una sola dirección, que falla en silencio.
  const destinatarios = (Array.isArray(opts.to) ? opts.to : opts.to.split(","))
    .map((d) => d.trim())
    .filter(Boolean);
  if (destinatarios.length === 0) {
    return { ok: false, simulated: false, error: "sin destinatario" };
  }

  if (!resend) {
    console.log(
      `[email:SIMULADO] Para: ${destinatarios.join(", ")} · Asunto: "${opts.subject}"`
    );
    return { ok: true, simulated: true };
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: destinatarios,
      ...(opts.replyTo || REPLY_TO
        ? { replyTo: opts.replyTo ?? REPLY_TO! }
        : {}),
      subject: opts.subject,
      html: opts.html,
      ...(opts.unsubscribeUrl
        ? {
            headers: {
              "List-Unsubscribe": `<${opts.unsubscribeUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          }
        : {}),
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, simulated: false, error: String(error) };
    }
    return { ok: true, simulated: false };
  } catch (err) {
    console.error("[email] error:", err);
    return { ok: false, simulated: false, error: "send failed" };
  }
}
