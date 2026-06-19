import type { Product } from "./products";

const BASE_URL = "https://mishkitashua.com";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "Bakery"],
    name: "Mishkitashua",
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    image: `${BASE_URL}/images/marca-todos-productos.png`,
    description:
      "Repostería artesanal andina. Alfajores y manjares saborizados con ingredientes de los Andes peruanos.",
    telephone: "+51 943 247 410",
    priceRange: "S/ 8 - S/ 15",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Huaraz",
      addressRegion: "Áncash",
      addressCountry: "PE",
    },
    sameAs: [
      "https://www.instagram.com/mishkitashua",
      "https://www.tiktok.com/@mishkitashua",
    ],
  };
}

export function productJsonLd(
  product: Product,
  rating?: { average: number; count: number }
) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${BASE_URL}${product.image}`,
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/productos/${product.slug}`,
      price: product.price.toFixed(2),
      priceCurrency: "PEN",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Mishkitashua",
      },
    },
    brand: {
      "@type": "Brand",
      name: "Mishkitashua",
    },
    weight: {
      "@type": "QuantitativeValue",
      value: parseInt(product.weight),
      unitCode: "GRM",
    },
  };

  // Estrellas en los resultados de Google cuando hay reseñas.
  if (rating && rating.count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.average.toFixed(1),
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return jsonLd;
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo se conservan los alfajores?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nuestros alfajores deben conservarse en un lugar fresco, seco y protegido de la luz solar directa. Se recomienda conservarlos en su empaque original hasta el momento de consumo. Una vez abierto, consumir en el menor tiempo posible.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo se conservan los manjares saborizados?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Los manjares Mishkitashua deben mantenerse cerrados, en un lugar fresco y seco. Después de abrir el frasco, se recomienda refrigerar el producto y consumirlo dentro del periodo indicado en la etiqueta. Aplica para Tunaluna, Sol Aguaymanto y Muña Andina.",
        },
      },
      {
        "@type": "Question",
        name: "¿Los productos contienen alérgenos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Nuestros productos contienen ingredientes de origen lácteo. Los alfajores también pueden contener gluten y huevo, debido a la composición de sus tapas. Recomendamos revisar siempre la etiqueta antes de consumir.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuáles son los tiempos de envío?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lima Metropolitana: entregas en 24 a 48 horas hábiles. Provincias: envíos a través de agencias asociadas con tiempo estimado de 3 a 5 días hábiles.",
        },
      },
    ],
  };
}
