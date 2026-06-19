import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/carrito",
        "/checkout",
        "/confirmacion",
        "/seguimiento",
        "/admin",
        "/api",
      ],
    },
    sitemap: "https://mishkitashua.com/sitemap.xml",
  };
}
