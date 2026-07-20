import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { enforceRateLimit } from "@/app/lib/ratelimit";

// Consulta pública de un pedido, por id o por número de orden. La usan la
// página de seguimiento (sin sesión, a propósito: el cliente rastrea con su
// número) y la de confirmación.
//
// Por eso se devuelve una LISTA BLANCA de campos, nunca el pedido entero: el
// número de orden circula por correo y URLs, así que cualquiera que lo tenga
// vería lo que aquí se exponga. Fuera quedan el correo, el teléfono y la fecha
// de nacimiento del cliente, su clerkUserId, y los datos de cobro (chargeId,
// cardLast4). Del cliente solo sale lo que hace falta para mostrar el envío.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = enforceRateLimit(request, "order-lookup", 15, 60_000);
  if (limited) return limited;

  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        discount: true,
        shippingCost: true,
        total: true,
        status: true,
        createdAt: true,
        customer: { select: { name: true, address: true, city: true } },
        items: {
          select: {
            productSlug: true,
            productName: true,
            quantity: true,
            price: true,
            image: true,
            customization: true,
          },
        },
        reviews: { select: { productSlug: true } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[orders/:id GET]", error);
    return NextResponse.json(
      { error: "Error al consultar el pedido" },
      { status: 500 }
    );
  }
}
