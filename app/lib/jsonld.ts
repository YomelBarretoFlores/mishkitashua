import type { Product } from "./products";

const BASE_URL = "https://mishkitashua.com";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mishkitashua",
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo-mishkitashua.jpg`,
    description:
      "Repostería artesanal andina. Alfajores y manjares saborizados con ingredientes de los Andes peruanos.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Huaraz",
      addressRegion: "Áncash",
      addressCountry: "PE",
    },
    sameAs: ["https://instagram.com", "https://facebook.com"],
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${BASE_URL}${product.image}`,
    offers: {
      "@type": "Offer",
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
          text: "Nuestros alfajores artesanales están elaborados sin conservantes artificiales. Recomendamos mantenerlos en un lugar fresco y seco, lejos de la luz solar directa. Así conservarán su frescura óptima durante 15 días. Si vives en un clima muy cálido, puedes guardarlos en el refrigerador hasta 30 días.",
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
      {
        "@type": "Question",
        name: "¿De dónde provienen los ingredientes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La esencia de Mishkitashua radica en la riqueza de los Andes. Seleccionamos cuidadosamente cada insumo, trabajando directamente con comunidades locales para garantizar prácticas sostenibles y un sabor auténtico.",
        },
      },
    ],
  };
}
