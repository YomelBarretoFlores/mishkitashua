import type { Metadata } from "next";
import { Gift } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getCurrentCustomer, requireAuthPage } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getActiveCoupons } from "@/app/lib/coupons";
import AccountForm from "./_components/account-form";
import AccountNav from "./_components/account-nav";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  await requireAuthPage("/cuenta");

  // Camino rápido: leer el cliente directo por el userId del token (sin llamar a
  // la API de Clerk). Solo si la fila no existe se usa getCurrentCustomer, que
  // sí consulta Clerk y la crea. Esto acelera mucho el cambio de pestaña.
  const { userId } = await auth();
  let customer = userId
    ? await prisma.customer.findUnique({ where: { clerkUserId: userId } })
    : null;
  if (!customer) customer = await getCurrentCustomer();

  const coupons = customer ? await getActiveCoupons(customer.id) : [];

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-12 md:py-16">
      <h1
        className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-2"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Mi cuenta
      </h1>
      <p className="text-on-surface-variant mb-6">
        Completa tus datos para agilizar tus compras y recibir promociones
        exclusivas. 🎁
      </p>

      <div className="mb-8">
        <AccountNav active="datos" />
      </div>

      {coupons.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-cocoa-deep mb-3 flex items-center gap-2">
            <Gift size={16} className="text-caramel" />
            Tus cupones
          </h2>
          <ul className="space-y-2">
            {coupons.map((c) => (
              <li
                key={c.code}
                className="bg-white rounded-xl border border-cream-darker/60 p-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div>
                  <p className="font-mono font-semibold text-cocoa-deep tracking-wide">
                    {c.code}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {c.type === "free_shipping"
                      ? "Envío gratis"
                      : `${c.value ?? 0}% de descuento`}
                    {" · vence el "}
                    {new Date(c.expiresAt).toLocaleDateString("es-PE", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
                <span className="text-xs text-taupe">
                  Escríbelo al pagar
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AccountForm
        initial={{
          name: customer?.name ?? "",
          phone: customer?.phone ?? "",
          address: customer?.address ?? "",
          city: customer?.city ?? "",
          birthdate: customer?.birthdate
            ? new Date(customer.birthdate).toISOString().slice(0, 10)
            : "",
          marketingOptIn: customer?.marketingOptIn ?? true,
        }}
      />
    </div>
  );
}
