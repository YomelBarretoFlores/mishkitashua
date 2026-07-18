import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, ArrowRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { requireAuthPage } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { returnBadgeClasses, returnStatusLabel } from "@/app/lib/return-status";
import AccountNav from "../_components/account-nav";

export const metadata: Metadata = {
  title: "Mis devoluciones",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DevolucionesPage() {
  await requireAuthPage("/cuenta/devoluciones");
  const { userId } = await auth();

  const returns = userId
    ? await prisma.return.findMany({
        where: { order: { customer: { clerkUserId: userId } } },
        include: { order: { select: { orderNumber: true, total: true } } },
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
        Mis devoluciones
      </h1>
      <p className="text-on-surface-variant mb-6">
        Estado de tus solicitudes de devolución.
      </p>

      <AccountNav active="devoluciones" />

      {returns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-darker/60 p-10 text-center mt-6">
          <RotateCcw size={40} className="text-taupe mx-auto mb-4" />
          <p className="text-on-surface-variant mb-6">
            No tienes solicitudes de devolución. Puedes solicitar una desde tus
            pedidos entregados.
          </p>
          <Link
            href="/cuenta/pedidos"
            className="inline-flex items-center gap-2 bg-cocoa text-white font-semibold px-6 py-3 rounded-lg hover:bg-cocoa-deep transition-colors"
          >
            Ver mis pedidos <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {returns.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-cream-darker/60 p-5 md:p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                <div>
                  <p className="font-semibold text-cocoa-deep">
                    Pedido {r.order.orderNumber}
                  </p>
                  <p className="text-xs text-taupe">
                    Solicitada el{" "}
                    {new Date(r.createdAt).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${returnBadgeClasses(
                    r.status
                  )}`}
                >
                  {returnStatusLabel(r.status)}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">
                <span className="text-cocoa-deep font-medium">Motivo:</span>{" "}
                {r.reason}
              </p>
              {r.adminNote && (
                <p className="text-sm text-on-surface-variant mt-2">
                  <span className="text-cocoa-deep font-medium">Respuesta:</span>{" "}
                  {r.adminNote}
                </p>
              )}
              {r.status === "reembolsada" && r.refundAmount != null && (
                <p className="text-sm text-green-700 font-medium mt-2">
                  Reembolsado: S/ {r.refundAmount.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
