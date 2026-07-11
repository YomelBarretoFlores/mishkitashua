import type { Metadata } from "next";
import { getCurrentCustomer, requireAuthPage } from "@/app/lib/auth";
import AccountForm from "./_components/account-form";
import AccountNav from "./_components/account-nav";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  await requireAuthPage("/cuenta");
  const customer = await getCurrentCustomer();

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
