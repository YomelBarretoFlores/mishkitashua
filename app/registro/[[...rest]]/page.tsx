import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export default function RegistroPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-16 md:py-24 flex justify-center">
      <SignUp
        appearance={{
          variables: { colorPrimary: "#3e2723" },
        }}
        signInUrl="/ingresar"
        fallbackRedirectUrl="/cuenta"
      />
    </div>
  );
}
