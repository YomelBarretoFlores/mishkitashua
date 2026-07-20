import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentCustomer } from "@/app/lib/auth";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  return NextResponse.json(customer);
}

const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  birthdate: z.string().optional().nullable(), // YYYY-MM-DD
  marketingOptIn: z.boolean().optional(),
});

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const data = parsed.data;

  // Asegura que exista el Customer ligado a este usuario.
  await getCurrentCustomer();

  const updated = await prisma.customer.update({
    where: { clerkUserId: userId },
    data: {
      name: data.name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      birthdate: data.birthdate ? new Date(data.birthdate) : null,
      // Si el campo no viene, se deja como está. Con `?? true` una petición
      // que solo cambiara la dirección volvía a apuntar a marketing a alguien
      // que se había dado de baja.
      ...(data.marketingOptIn !== undefined
        ? { marketingOptIn: data.marketingOptIn }
        : {}),
    },
  });

  return NextResponse.json(updated);
}
