import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";

// Ventana de "conectado": actividad en los últimos 5 minutos.
const WINDOW_MS = 5 * 60_000;
// Pasado este tiempo la fila ya no sirve para nada y se borra. Sin esto la
// tabla crecería para siempre: cada pestaña de cada visitante deja una fila.
const PURGE_MS = 24 * 60 * 60_000;

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const now = Date.now();

    // Limpieza oportunista: es telemetría efímera, no datos de negocio.
    await prisma.presence.deleteMany({
      where: { lastSeen: { lt: new Date(now - PURGE_MS) } },
    });

    const since = new Date(now - WINDOW_MS);
    const rows = await prisma.presence.findMany({
      where: { lastSeen: { gte: since } },
      orderBy: { lastSeen: "desc" },
    });

    // Clientes con nombre (registrados) vs visitantes anónimos.
    // Se deduplica por cliente: un mismo cliente puede tener varias pestañas.
    const byCustomer = new Map<
      string,
      { customerId: string; customerName: string; page: string | null; lastSeen: Date }
    >();
    let anonymous = 0;
    for (const r of rows) {
      if (r.customerId && r.customerName) {
        const existing = byCustomer.get(r.customerId);
        if (!existing || r.lastSeen > existing.lastSeen) {
          byCustomer.set(r.customerId, {
            customerId: r.customerId,
            customerName: r.customerName,
            page: r.page,
            lastSeen: r.lastSeen,
          });
        }
      } else {
        anonymous++;
      }
    }

    const customers = [...byCustomer.values()].sort(
      (a, b) => b.lastSeen.getTime() - a.lastSeen.getTime()
    );

    return NextResponse.json({
      customers,
      anonymous,
      total: customers.length + anonymous,
    });
  } catch {
    return NextResponse.json({ customers: [], anonymous: 0, total: 0 });
  }
}
