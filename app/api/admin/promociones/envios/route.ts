import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";

// Historial de envíos: quién lo recibió, cuándo y cuántas veces.
//
// Sirve para los dos tipos de envío masivo:
//   ?promotionId=xxx  → los de una promoción concreta
//   ?kind=cumpleanos  → los del correo de cumpleaños (no cuelgan de ninguna)
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const promotionId = searchParams.get("promotionId");
  const kind = searchParams.get("kind");

  if (!promotionId && kind !== "cumpleanos") {
    return NextResponse.json(
      { error: "Indica una promoción o el tipo de envío" },
      { status: 400 }
    );
  }

  const sends = await prisma.promotionSend.findMany({
    where: promotionId ? { promotionId } : { kind: "cumpleanos" },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // Una persona puede haber recibido lo mismo varias veces (una campaña
  // reenviada, o el cumpleaños de cada año): se agrupa por cliente y se cuenta.
  const byCustomer = new Map<
    string,
    {
      email: string;
      veces: number;
      ultimo: Date;
      status: string;
      detail: string | null;
    }
  >();
  for (const s of sends) {
    const prev = byCustomer.get(s.customerId);
    if (prev) {
      prev.veces++;
      if (s.createdAt > prev.ultimo) {
        prev.ultimo = s.createdAt;
        prev.status = s.status;
        prev.detail = s.detail;
      }
    } else {
      byCustomer.set(s.customerId, {
        email: s.email,
        veces: 1,
        ultimo: s.createdAt,
        status: s.status,
        detail: s.detail,
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
      detail: v.detail,
    }))
    .sort((a, b) => b.ultimo.getTime() - a.ultimo.getTime());

  return NextResponse.json({
    total: sends.length,
    personas: rows.length,
    rows,
  });
}
