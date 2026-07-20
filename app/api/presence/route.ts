import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { enforceRateLimit } from "@/app/lib/ratelimit";

const schema = z.object({
  sessionId: z.string().min(1).max(100),
  page: z.string().max(300).optional().nullable(),
});

// Latido de presencia. El cliente manda su sessionId y la página actual; si hay
// sesión Clerk, el servidor añade el nombre del cliente (para fidelización).
// El sessionId nunca identifica a nadie por sí solo: la identidad la pone el
// servidor desde la sesión autenticada, no el cliente.
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "presence", 30, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { sessionId, page } = parsed.data;

  let customerId: string | null = null;
  let customerName: string | null = null;
  try {
    const { userId } = await auth();
    if (userId) {
      // Se guarda el Customer.id de nuestra base, no el userId de Clerk: en el
      // resto del esquema "customerId" significa eso, y así el panel puede
      // cruzar al cliente con sus pedidos. Una sola consulta a nuestra BD, sin
      // llamar a la API de Clerk (esto corre cada 45 s por visitante).
      const customer = await prisma.customer.findUnique({
        where: { clerkUserId: userId },
        select: { id: true, name: true },
      });
      if (customer) {
        customerId = customer.id;
        customerName = customer.name || "Cliente";
      }
    }
  } catch {
    // Sin sesión válida: se registra como anónimo.
  }

  try {
    await prisma.presence.upsert({
      where: { sessionId },
      create: { sessionId, customerId, customerName, page: page ?? null },
      update: {
        customerId,
        customerName,
        page: page ?? null,
        lastSeen: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Best-effort: no romper la navegación si la BD está despertando.
    return NextResponse.json({ ok: false });
  }
}
