import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { type, page, productSlug, sessionId, metadata } =
      await request.json();

    await prisma.analyticsEvent.create({
      data: { type, page, productSlug, sessionId, metadata },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
