export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  category: "alfajores" | "manjares";
  price: number;
  weight: string;
  description: string;
  longDescription: string;
  ingredients: string[];
  features: string[];
  image: string;
  images: string[];
  color: string;
};

export const products: Product[] = [
  {
    slug: "alfajores-andinos-surtidos",
    name: "Alfajores Andinos Surtidos",
    subtitle: "Caja x 6 unidades",
    category: "alfajores",
    price: 24.0,
    weight: "264g",
    description:
      "3 sabores surtidos, 2 por sabor. Alfajores artesanales rellenos de manjar andino en sabores Tunaluna, Aguaymanto y Muña.",
    longDescription:
      "Nuestra caja insignia reúne la esencia de los Andes en seis alfajores artesanales. Cada par representa un sabor único: la dulzura frutal de la tuna, la frescura herbal de la muña y la dulzura cítrica del aguaymanto. Elaborados con ingredientes seleccionados y horneados con orgullo en los Andes.",
    ingredients: [
      "Harina de trigo sin preparar",
      "Mantequilla",
      "Azúcar impalpable",
      "Manjar saborizado (Tuna, Aguaymanto, Muña)",
      "Huevos",
      "Maicena",
      "Esencia de vainilla",
    ],
    features: [
      "3 sabores surtidos",
      "Hecho con orgullo en los Andes",
      "Ingredientes seleccionados",
    ],
    image: "/images/alfajores-caja-dark.jpg",
    images: [
      "/images/alfajores-caja-dark.jpg",
      "/images/alfajores-productos-light.jpg",
      "/images/alfajores-surtidos.jpg",
    ],
    color: "#3e2723",
  },
  {
    slug: "manjar-tunaluna",
    name: "Tunaluna",
    subtitle: "Manjar saborizado de tuna",
    category: "manjares",
    price: 8.0,
    weight: "300g",
    description:
      "Dulzura frutal de origen andino. Manjar sedoso elaborado con tuna (higo chumbo) de los Andes peruanos.",
    longDescription:
      "Una lujosa delicia andina nacida de la vibrante tuna. Reducido lentamente hasta lograr un manjar aterciopelado y cremoso, Tunaluna equilibra la dulzura natural y vívida de la fruta con profundos matices caramelizados. Perfecto para untar sobre pan artesanal caliente, maridar con quesos maduros o disfrutar a cucharadas.",
    ingredients: [
      "Leche fresca entera",
      "Azúcar blanca",
      "Pulpa de tuna (higo chumbo)",
      "Bicarbonato de sodio",
      "Esencia de vainilla",
    ],
    features: [
      "Ingredientes naturales",
      "Origen andino",
      "Textura suave y cremosa",
    ],
    image: "/images/manjar-tunaluna.jpg",
    images: [
      "/images/manjar-tunaluna.jpg",
      "/images/manjar-tunaluna-2.jpg",
      "/images/tres-manjares.jpg",
    ],
    color: "#7b1fa2",
  },
  {
    slug: "manjar-sol-aguaymanto",
    name: "Sol Aguaymanto",
    subtitle: "Manjar saborizado de aguaymanto",
    category: "manjares",
    price: 8.0,
    weight: "300g",
    description:
      "Dulzura cítrica de origen andino. Manjar dorado con el toque vibrante del aguaymanto peruano.",
    longDescription:
      "El Sol Aguaymanto captura la esencia dorada de los Andes. Elaborado con aguaymanto silvestre, este manjar combina la dulzura clásica del manjar blanco con notas cítricas y tropicales únicas. Su color dorado y su sabor inconfundible lo convierten en un acompañamiento perfecto para postres, panes y creaciones culinarias.",
    ingredients: [
      "Leche fresca entera",
      "Azúcar blanca",
      "Pulpa de aguaymanto",
      "Bicarbonato de sodio",
      "Esencia de vainilla",
    ],
    features: [
      "Ingredientes naturales",
      "Origen andino",
      "Textura suave y cremosa",
    ],
    image: "/images/manjar-sol-aguaymanto.jpg",
    images: [
      "/images/manjar-sol-aguaymanto.jpg",
      "/images/tres-manjares.jpg",
    ],
    color: "#e65100",
  },
  {
    slug: "manjar-muna-andina",
    name: "Muña Andina",
    subtitle: "Manjar saborizado de muña",
    category: "manjares",
    price: 8.0,
    weight: "300g",
    description:
      "Frescura herbal de origen andino. Manjar infusionado con muña, la menta silvestre de los Andes.",
    longDescription:
      "La Muña Andina trae la frescura de las alturas a tu mesa. Infusionado con muña silvestre, esta variedad única de manjar ofrece un equilibrio perfecto entre la cremosidad clásica y un toque herbal refrescante. Una experiencia sensorial que evoca los campos verdes de la sierra peruana.",
    ingredients: [
      "Leche fresca entera",
      "Azúcar blanca",
      "Extracto natural de muña",
      "Bicarbonato de sodio",
      "Esencia de vainilla",
    ],
    features: [
      "Ingredientes naturales",
      "Origen andino",
      "Textura suave y cremosa",
    ],
    image: "/images/manjar-muna-andina.jpg",
    images: [
      "/images/manjar-muna-andina.jpg",
      "/images/tres-manjares.jpg",
    ],
    color: "#2e7d32",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(
  category: "alfajores" | "manjares"
): Product[] {
  return products.filter((p) => p.category === category);
}
