import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

// ¿Tiene el cliente su ficha completa? Lo consulta el aviso que le pide
// rellenar sus datos tras registrarse.
//
// Es una consulta deliberadamente barata (solo el userId del token y un
// findUnique) porque se dispara en cada carga de página: usar getCurrentCustomer
// añadiría una llamada a la API de Clerk que aquí no hace falta.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    // Sin sesión no hay nada que completar; no es un error.
    return NextResponse.json({ signedIn: false, complete: true, missing: [] });
  }

  const customer = await prisma.customer.findUnique({
    where: { clerkUserId: userId },
    select: {
      phone: true,
      address: true,
      city: true,
      birthdate: true,
      marketingOptIn: true,
    },
  });

  // Sin fila todavía (recién registrado): falta todo.
  if (!customer) {
    return NextResponse.json({
      signedIn: true,
      complete: false,
      missing: ["teléfono", "dirección", "ciudad", "fecha de nacimiento"],
    });
  }

  const missing: string[] = [];
  if (!customer.phone?.trim()) missing.push("teléfono");
  if (!customer.address?.trim()) missing.push("dirección");
  if (!customer.city?.trim()) missing.push("ciudad");
  // El cumpleaños solo se pide a quien aceptó recibir correos: es el dato que
  // habilita el cupón de cumpleaños, y no tiene sentido reclamárselo a quien
  // no quiere que le escribamos.
  if (!customer.birthdate && customer.marketingOptIn) {
    missing.push("fecha de nacimiento");
  }

  return NextResponse.json({
    signedIn: true,
    complete: missing.length === 0,
    missing,
  });
}
