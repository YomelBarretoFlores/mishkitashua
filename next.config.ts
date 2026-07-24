import type { NextConfig } from "next";

// Content-Security-Policy: permite lo propio + Clerk (auth), Mercado Pago
// (pagos) y Google Maps (el mapa de la página de contacto).
// 'unsafe-inline'/'unsafe-eval' son necesarios para Next y los SDKs; el resto
// está restringido a dominios conocidos.
//
// Stripe se retiró de todas las directivas: ya no queda una sola referencia en
// el proyecto, y una política que autoriza dominios que no se usan solo amplía
// la superficie de ataque sin dar nada a cambio.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://sdk.mercadopago.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://img.clerk.com https://http2.mlstatic.com https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clerk.accounts.dev https://clerk-telemetry.com https://*.neon.tech https://api.mercadopago.com",
  // Los checkouts son hospedados (redirección de página completa); form-action los permite.
  "form-action 'self' https://www.mercadopago.com.pe https://www.mercadopago.com",
  // El mapa de /contacto va incrustado en un iframe: sin estos dos orígenes el
  // navegador lo bloquea y en su lugar sale el recuadro gris de documento roto.
  "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://www.mercadopago.com.pe https://maps.google.com https://www.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(self), publickey-credentials-get=(self)",
  },
];

const nextConfig: NextConfig = {
  // No revelar la tecnología del servidor (OWASP: fingerprinting).
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Imágenes de producto subidas a Vercel Blob.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
