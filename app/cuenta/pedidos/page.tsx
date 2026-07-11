import type { Metadata } from "next";
import Link from "next/link";
import { Package, ArrowRight, Truck, Star } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { requireAuthPage } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { statusBadgeClasses, statusLabel } from "@/app/lib/order-status";
import AccountNav from "../_components/account-nav";

export const metadata: Metadata = {
  title: "Mis pedidos",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MisPedidosPage() {
  await requireAuthPage("/cuenta/pedidos");

  // Rápido: solo el userId del token (sin llamar a la API de Clerk ni upsert).
  // Filtramos los pedidos por el clerkUserId del cliente en una sola consulta.
  const { userId } = await auth();
  const orders = userId
    ? await prisma.order.findMany({
        where: { customer: { clerkUserId: userId } },
        include: { items: true, reviews: { select: { id: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">
      <h1
        className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-2"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Mis pedidos
      </h1>
      <p className="text-on-surface-variant mb-6">
        Revisa el estado y el historial de tus compras.
      </p>

      <AccountNav active="pedidos" />

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-darker/60 p-10 text-center mt-6">
          <Package size={40} className="text-taupe mx-auto mb-4" />
          <p className="text-on-surface-variant mb-6">
            Aún no tienes pedidos. ¡Descubre nuestros dulces andinos!
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-6 py-3 rounded-lg hover:bg-cocoa-deep transition-colors"
          >
            Ver productos <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-cream-darker/60 p-5 md:p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                <div>
                  <p className="font-semibold text-cocoa-deep">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-taupe">
                    {new Date(order.createdAt).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadgeClasses(
                    order.status
                  )}`}
                >
                  {statusLabel(order.status)}
                </span>
              </div>

              <div className="space-y-1.5 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-cocoa-deep">
                      S/ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-cream-darker/60 pt-3">
                <span className="font-semibold text-caramel">
                  Total: S/ {order.total.toFixed(2)}
                </span>
                <div className="flex items-center gap-4">
                  {order.status === "entregado" &&
                    order.reviews.length === 0 && (
                      <Link
                        href={`/confirmacion?order=${order.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa hover:text-cocoa-deep transition-colors"
                      >
                        <Star size={15} />
                        Dejar reseña
                      </Link>
                    )}
                  <Link
                    href={`/seguimiento?q=${order.orderNumber}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa hover:text-cocoa-deep transition-colors"
                  >
                    <Truck size={15} />
                    Ver seguimiento
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
