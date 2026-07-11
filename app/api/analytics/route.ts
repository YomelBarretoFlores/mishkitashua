import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { enforceRateLimit } from "@/app/lib/ratelimit";

const eventSchema = z.object({
  type: z.enum([
    "page_view",
    "add_to_cart",
    "checkout_start",
    "purchase",
    "chatbot_open",
  ]),
  page: z.string().max(300).optional().nullable(),
  productSlug: z.string().max(120).optional().nullable(),
  sessionId: z.string().max(100).optional().nullable(),
  metadata: z.string().max(2000).optional().nullable(),
});

export async function POST(request: Request) {
  // Límite generoso: se dispara en cada page view.
  const limited = enforceRateLimit(request, "analytics", 60, 60_000);
  if (limited) return limited;

  // Entrada del cliente: JSON malformado o esquema inválido → 400 (no es un
  // fallo del servidor, sino una petición mal formada).
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { type, page, productSlug, sessionId, metadata } = parsed.data;

  try {
    await prisma.analyticsEvent.create({
      data: {
        type,
        page: page ?? undefined,
        productSlug: productSlug ?? undefined,
        sessionId: sessionId || "anonymous",
        metadata: metadata ?? undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // La analítica es best-effort: si la BD está despertando, no devolvemos 500
    // (no debe afectar la navegación ni ensuciar la consola del cliente).
    console.error("[analytics] no registrado (BD no disponible):", error);
    return NextResponse.json({ ok: false });
  }
}
