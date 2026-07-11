import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false, follow: false },
};

export default function IngresarPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-16 md:py-24 flex justify-center">
      <SignIn
        appearance={{
          variables: { colorPrimary: "#3e2723" },
        }}
        signUpUrl="/registro"
        fallbackRedirectUrl="/cuenta"
      />
    </div>
  );
}
