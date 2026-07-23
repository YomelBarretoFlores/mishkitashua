import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";

// Historial de envíos de una promoción: quién la recibió, cuándo y cuántas
// veces. Responde a "¿a quién le llegó esto?", que antes no se podía saber.
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const promotionId = searchParams.get("promotionId");
  if (!promotionId) {
    return NextResponse.json({ error: "Falta la promoción" }, { status: 400 });
  }

  const sends = await prisma.promotionSend.findMany({
    where: { promotionId },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // Una persona puede haber recibido la misma promoción varias veces (si se
  // reenvió la campaña): se agrupa por cliente y se cuenta.
  const byCustomer = new Map<
    string,
    { email: string; veces: number; ultimo: Date; status: string }
  >();
  for (const s of sends) {
    const prev = byCustomer.get(s.customerId);
    if (prev) {
      prev.veces++;
      if (s.createdAt > prev.ultimo) {
        prev.ultimo = s.createdAt;
        prev.status = s.status;
      }
    } else {
      byCustomer.set(s.customerId, {
        email: s.email,
        veces: 1,
        ultimo: s.createdAt,
        status: s.status,
      });
    }
  }

  // Se añade el nombre del cliente, que no se guarda en el registro (podría
  // haber cambiado) sino que se lee de su ficha actual.
  const ids = [...byCustomer.keys()];
  const customers = ids.length
    ? await prisma.customer.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true },
      })
    : [];
  const names = new Map(customers.map((c) => [c.id, c.name]));

  const rows = [...byCustomer.entries()]
    .map(([customerId, v]) => ({
      customerId,
      nombre: names.get(customerId) ?? "(cliente eliminado)",
      email: v.email,
      veces: v.veces,
      ultimo: v.ultimo,
      status: v.status,
    }))
    .sort((a, b) => b.ultimo.getTime() - a.ultimo.getTime());

  return NextResponse.json({
    total: sends.length,
    personas: rows.length,
    rows,
  });
}
