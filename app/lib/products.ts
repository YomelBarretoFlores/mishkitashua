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
    allergens?: string;
    features: string[];
    image: string;
    images: string[];
    color: string;
};

export const products: Product[] = [
    {
        slug: "alfajores-andinos-surtidos",
        name: "Alfajores Andinos",
        subtitle: "Caja x 6 unidades",
        category: "alfajores",
        price: 8.0,
        weight: "264g",
        description:
            "Caja surtida de 6 alfajores con tres sabores andinos: tuna, aguaymanto y muña.",
        longDescription:
            "Nuestra caja insignia reúne tres sabores andinos en una presentación comercial de 6 alfajores. Las tapas son elaboradas a base de harina de mashua negra y se combinan con rellenos de manjar saborizado de tuna, aguaymanto y muña. Cada variedad se diferencia por su relleno, color característico y perfil de sabor, creando una experiencia visual y sensorial atractiva.",
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
        price: 15.0,
        weight: "300g",
        description:
            "Manjar saborizado elaborado con pulpa de tuna, variedad frutal de la línea Mishkitashua. Frasco de 300 g.",
        longDescription:
            "Tunaluna combina la suavidad tradicional del manjar con el sabor frutal de la tuna. Su presentación en frasco permite conservar mejor el producto y facilita su uso en desayunos, postres, repostería o acompañamientos dulces.",
        ingredients: [
            "Leche fresca entera",
            "Leche condensada",
            "Concentrado de tuna roja",
            "Estabilizante permitido",
            "Conservante permitido",
        ],
        allergens: "Contiene leche.",
        features: [
            "Ingredientes naturales",
            "Origen andino",
            "Textura suave y cremosa",
        ],
        image: "/images/manjar-tunaluna.jpg",
        images: ["/images/manjar-tunaluna.jpg"],
        color: "#7b1fa2",
    },
    {
        slug: "manjar-sol-aguaymanto",
        name: "Sol Aguaymanto",
        subtitle: "Manjar saborizado de aguaymanto",
        category: "manjares",
        price: 15.0,
        weight: "300g",
        description:
            "Manjar saborizado elaborado con concentrado de aguaymanto, variedad cítrica de la línea Mishkitashua. Frasco de 300 g.",
        longDescription:
            "Sol Aguaymanto combina una base cremosa de manjar con concentrado de aguaymanto, logrando un sabor dulce con ligera acidez frutal. Su textura untable y color dorado lo convierten en una opción ideal para panes, postres y preparaciones de repostería.",
        ingredients: [
            "Leche fresca entera",
            "Leche condensada",
            "Concentrado de aguaymanto",
            "Estabilizante permitido",
            "Conservante permitido",
        ],
        allergens: "Contiene leche.",
        features: [
            "Ingredientes naturales",
            "Origen andino",
            "Textura suave y cremosa",
        ],
        image: "/images/manjar-sol-aguaymanto.jpg",
        images: ["/images/manjar-sol-aguaymanto.jpg"],
        color: "#e65100",
    },
    {
        slug: "manjar-muna-andina",
        name: "Muña Andina",
        subtitle: "Manjar saborizado de muña",
        category: "manjares",
        price: 15.0,
        weight: "300g",
        description:
            "Manjar saborizado elaborado con muña micronizada, variedad herbal de la línea Mishkitashua. Frasco de 300 g.",
        longDescription:
            "Muña Andina combina una base cremosa de manjar con muña micronizada, logrando un sabor dulce-herbal, fresco y aromático. Su textura untable y perfil diferente la convierten en una opción ideal para panes, postres y preparaciones de repostería.",
        ingredients: [
            "Leche fresca entera",
            "Leche condensada",
            "Muña micronizada",
            "Estabilizante permitido",
            "Conservante permitido",
        ],
        allergens: "Contiene leche.",
        features: [
            "Ingredientes naturales",
            "Origen andino",
            "Textura suave y cremosa",
        ],
        image: "/images/manjar-muna-andina.jpg",
        images: ["/images/manjar-muna-andina.jpg"],
        color: "#2e7d32",
    },
];

export function getProductBySlug(slug: string): Product | undefined {
    return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(
    category: "alfajores" | "manjares",
): Product[] {
    return products.filter((p) => p.category === category);
}
