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
  to: string;
  subject: string;
  html: string;
  // Enlace de baja para los correos de marketing. Gmail y Yahoo exigen la
  // cabecera List-Unsubscribe a quien envía en volumen; sin ella, las campañas
  // acaban marcadas como spam.
  unsubscribeUrl?: string;
}): Promise<{ ok: boolean; simulated: boolean; error?: string }> {
  if (!resend) {
    console.log(
      `[email:SIMULADO] Para: ${opts.to} · Asunto: "${opts.subject}"`
    );
    return { ok: true, simulated: true };
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
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
