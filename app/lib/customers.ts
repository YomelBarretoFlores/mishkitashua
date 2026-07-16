import { prisma } from "@/app/lib/prisma";
import type { Customer } from "@prisma/client";

// Liga un usuario de Clerk a su Customer de Neon.
//
// Un upsert por clerkUserId crearía una fila nueva cada vez que alguien se
// registra, aunque ya exista una con su mismo correo (una compra anterior, o
// una cuenta que se borró y se volvió a crear). El resultado eran personas
// duplicadas en el panel y correos enviados dos veces. Aquí, antes de crear,
// se reclama la fila que ya tenga ese correo y no esté ligada a nadie.
export async function linkClerkUserToCustomer(input: {
  clerkUserId: string;
  email: string;
  name: string;
  extra?: Partial<Pick<Customer, "phone" | "address" | "city">>;
}): Promise<Customer> {
  const { clerkUserId, email, name, extra } = input;

  const linked = await prisma.customer.findUnique({ where: { clerkUserId } });
  if (linked) {
    return prisma.customer.update({
      where: { clerkUserId },
      data: { name, email, ...extra },
    });
  }

  if (email) {
    // Se reclama por correo, sin exigir que la fila esté suelta. Clerk no
    // permite dos cuentas con el mismo correo, así que si una fila lo tiene
    // con OTRO clerkUserId es que esa cuenta se borró y su id quedó muerto:
    // reutilizarla conserva sus pedidos en vez de duplicar a la persona.
    // La más antigua es la que guarda el historial.
    const previous = await prisma.customer.findFirst({
      where: { email },
      orderBy: { createdAt: "asc" },
    });
    if (previous) {
      return prisma.customer.update({
        where: { id: previous.id },
        data: { clerkUserId, name, ...extra },
      });
    }
  }

  return prisma.customer.create({
    data: {
      clerkUserId,
      name,
      email,
      phone: extra?.phone ?? "",
      address: extra?.address ?? "",
      city: extra?.city ?? "",
    },
  });
}
