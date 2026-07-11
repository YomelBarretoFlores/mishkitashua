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

  try {
    const parsed = eventSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const { type, page, productSlug, sessionId, metadata } = parsed.data;

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
    console.error("[analytics] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
