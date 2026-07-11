import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import AuthShell from "@/app/components/AuthShell";
import { authAppearance } from "@/app/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export default function RegistroPage() {
  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Regístrate y recibe envío gratis en tu primera compra."
    >
      <SignUp
        appearance={authAppearance}
        signInUrl="/ingresar"
        fallbackRedirectUrl="/cuenta"
      />
    </AuthShell>
  );
}
