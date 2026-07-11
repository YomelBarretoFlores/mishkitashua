import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import AuthShell from "@/app/components/AuthShell";
import { authAppearance } from "@/app/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false, follow: false },
};

export default function IngresarPage() {
  return (
    <AuthShell
      title="Bienvenido de vuelta"
      subtitle="Ingresa para seguir tus pedidos y aprovechar tus beneficios."
    >
      <SignIn
        appearance={authAppearance}
        signUpUrl="/registro"
        fallbackRedirectUrl="/cuenta"
      />
    </AuthShell>
  );
}
