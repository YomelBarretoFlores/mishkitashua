import type { Metadata } from "next";
import { EB_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { CartProvider } from "@/app/lib/cart-context";
import { organizationJsonLd } from "@/app/lib/jsonld";
import WhatsAppButton from "@/app/components/WhatsAppButton";
import Chatbot from "@/app/components/Chatbot";
import WelcomePopup from "@/app/components/WelcomePopup";
import PageTracker from "@/app/components/PageTracker";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mishkitashua.com"),
  title: {
    default: "Mishkitashua — Sabores que nacen de nuestra tierra",
    template: "%s | Mishkitashua",
  },
  description:
    "Repostería artesanal andina. Alfajores y manjares saborizados con ingredientes de los Andes peruanos: Tunaluna, Sol Aguaymanto y Muña Andina.",
  keywords: [
    "alfajores artesanales",
    "manjares andinos",
    "repostería peruana",
    "Mishkitashua",
    "dulces peruanos",
    "tunaluna",
    "aguaymanto",
    "muña",
    "Huaraz",
    "dulce de leche",
  ],
  authors: [{ name: "Mishkitashua" }],
  creator: "Mishkitashua",
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Mishkitashua",
    title: "Mishkitashua — Sabores que nacen de nuestra tierra",
    description:
      "Repostería artesanal andina. Alfajores y manjares saborizados con ingredientes de los Andes peruanos.",
    images: [
      {
        url: "/images/marca-todos-productos.png",
        width: 1200,
        height: 630,
        alt: "Mishkitashua — Tres sabores, una misma identidad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mishkitashua — Sabores que nacen de nuestra tierra",
    description:
      "Alfajores artesanales y manjares saborizados de los Andes peruanos.",
    images: ["/images/marca-todos-productos.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo-colibri.jpg",
    apple: "/images/logo-colibri.jpg",
  },
  other: {
    "theme-color": "#3e2723",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${ebGaramond.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <CartProvider>
          <PageTracker />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
          <Chatbot />
          <WelcomePopup />
        </CartProvider>
      </body>
    </html>
  );
}
