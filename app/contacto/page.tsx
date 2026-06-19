import type { Metadata } from "next";
import ContactoContent from "./_components/contacto-content";

export const metadata: Metadata = {
  title: "Contacto",
  alternates: { canonical: "/contacto" },
  description:
    "Contáctanos para pedidos personalizados, eventos especiales o consultas. Estamos en Huaraz, Áncash, Perú.",
  openGraph: {
    title: "Contacto | Mishkitashua",
    description:
      "Contáctanos para pedidos personalizados o consultas. Huaraz, Áncash, Perú.",
  },
};

export default function ContactoPage() {
  return <ContactoContent />;
}
