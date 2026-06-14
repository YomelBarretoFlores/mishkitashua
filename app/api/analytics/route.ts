import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { type, page, productSlug, sessionId, metadata } =
      await request.json();

    // type es obligatorio; sin él no hay evento que registrar.
    if (!type) {
      return NextResponse.json(
        { error: "type es requerido" },
        { status: 400 }
      );
    }

    await prisma.analyticsEvent.create({
      // sessionId es obligatorio en el schema: usamos "anonymous" como red de
      // seguridad para que datos incompletos no generen un 500.
      data: {
        type,
        page,
        productSlug,
        sessionId: sessionId || "anonymous",
        metadata,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[analytics] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
