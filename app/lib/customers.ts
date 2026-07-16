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
    // La más antigua conserva el historial de pedidos y reseñas.
    const orphan = await prisma.customer.findFirst({
      where: { email, clerkUserId: null },
      orderBy: { createdAt: "asc" },
    });
    if (orphan) {
      return prisma.customer.update({
        where: { id: orphan.id },
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
