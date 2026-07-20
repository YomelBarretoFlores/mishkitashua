import type { Metadata } from "next";
import Link from "next/link";
import { MailX, CheckCircle2 } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { verifyUnsubscribeToken } from "@/app/lib/unsubscribe";

export const metadata: Metadata = {
  title: "Baja de correos",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Baja de marketing sin necesidad de iniciar sesión: quien compró como invitado
// no tiene cuenta, así que enlazar a /cuenta lo dejaba sin salida. El enlace
// llega firmado desde el pie de los correos.
export default async function BajaPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; t?: string }>;
}) {
  const { c: customerId, t: token } = await searchParams;

  let done = false;
  if (customerId && token && verifyUnsubscribeToken(customerId, token)) {
    // updateMany: si el id no existe simplemente no actualiza nada, sin lanzar.
    const res = await prisma.customer.updateMany({
      where: { id: customerId },
      data: { marketingOptIn: false },
    });
    done = res.count > 0;
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-20 text-center">
      {done ? (
        <>
          <CheckCircle2 size={40} className="text-green-700 mx-auto mb-5" />
          <h1
            className="text-2xl md:text-3xl font-medium text-cocoa-deep mb-3"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Listo, te diste de baja
          </h1>
          <p className="text-on-surface-variant">
            No volverás a recibir promociones ni el saludo de cumpleaños. Los
            correos de tus pedidos y devoluciones sí seguirán llegando, porque
            son parte de tu compra.
          </p>
        </>
      ) : (
        <>
          <MailX size={40} className="text-taupe mx-auto mb-5" />
          <h1
            className="text-2xl md:text-3xl font-medium text-cocoa-deep mb-3"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            No pudimos procesar la baja
          </h1>
          <p className="text-on-surface-variant">
            El enlace no es válido o ya caducó. Escríbenos y lo hacemos nosotros.
          </p>
        </>
      )}

      <Link
        href="/"
        className="inline-block mt-8 text-sm font-semibold text-cocoa hover:text-cocoa-deep transition-colors"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}
