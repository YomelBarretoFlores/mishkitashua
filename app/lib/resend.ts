import { Resend } from "resend";

// Envío de correos con Resend. Si no hay RESEND_API_KEY, entra en MODO
// SIMULACIÓN (registra en consola) para que la demo no se rompa.
const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Mishkitashua <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
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
      subject: opts.subject,
      html: opts.html,
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
