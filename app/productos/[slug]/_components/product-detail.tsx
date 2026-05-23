"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Leaf, Mountain, Droplets, Minus, Plus, ShoppingBag } from "lucide-react";
import { getProductBySlug } from "@/app/lib/products";
import { useCart } from "@/app/lib/cart-context";

export default function ProductDetailPage() {
  const params = useParams();
  const product = getProductBySlug(params.slug as string);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-16 py-20 text-center">
        <h1 className="text-2xl font-serif text-cocoa-deep mb-4">
          Producto no encontrado
        </h1>
        <Link href="/productos" className="text-caramel hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(
      {
        slug: product.slug,
        name: product.name,
        description: `${product.subtitle}, ${product.weight}`,
        price: product.price,
        image: product.image,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const featureIcons = [
    <Leaf key="leaf" size={16} />,
    <Mountain key="mountain" size={16} />,
    <Droplets key="droplets" size={16} />,
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-16 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-taupe mb-8">
        <Link href="/" className="hover:text-cocoa-deep transition-colors">
          Inicio
        </Link>
        <ChevronRight size={14} />
        <Link
          href="/productos"
          className="hover:text-cocoa-deep transition-colors"
        >
          Productos
        </Link>
        <ChevronRight size={14} />
        <span className="text-cocoa-deep font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Image Gallery */}
        <div className="lg:col-span-7">
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            <span className="absolute top-4 left-4 bg-cocoa/90 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
              Artesanal
            </span>
          </div>
          <div className="flex gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                  selectedImage === idx
                    ? "border-cocoa"
                    : "border-cream-darker hover:border-taupe"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} vista ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5">
          <h1
            className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-1"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            {product.name}
          </h1>
          <p className="text-on-surface-variant italic mb-4">
            {product.subtitle}
          </p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-semibold text-cocoa-deep">
              S/ {product.price.toFixed(2)}
            </span>
            <span className="text-sm text-taupe">/ {product.weight}</span>
          </div>

          <p className="text-on-surface-variant leading-relaxed mb-6">
            {product.longDescription}
          </p>

          {/* Feature Chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {product.features.map((feature, idx) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1.5 bg-cream-dark text-cocoa-deep text-xs font-semibold px-3 py-2 rounded-full"
              >
                {featureIcons[idx]}
                {feature}
              </span>
            ))}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-cocoa-deep tracking-wide uppercase block mb-2">
                Cantidad
              </label>
              <div className="inline-flex items-center border border-cream-darker rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-cocoa-deep hover:bg-cream-dark transition-colors rounded-l-lg"
                >
                  <Minus size={16} />
                </button>
                <span className="px-5 py-3 text-sm font-semibold text-cocoa-deep min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-cocoa-deep hover:bg-cream-dark transition-colors rounded-r-lg"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-lg transition-colors ${
                added
                  ? "bg-green-700 text-white"
                  : "bg-cocoa text-white hover:bg-cocoa-deep"
              }`}
            >
              <ShoppingBag size={18} />
              {added ? "Agregado al carrito" : "Agregar al Carrito"}
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients & Story */}
      <section className="mt-16 md:mt-24 border-t border-cream-darker pt-12 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2
              className="text-2xl md:text-3xl font-medium text-cocoa-deep mb-6"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              El Arte Detrás del Sabor
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              {product.longDescription}
            </p>

            <h3 className="text-sm font-semibold text-cocoa-deep tracking-wide uppercase mb-4">
              Ingredientes
            </h3>
            <ul className="space-y-2">
              {product.ingredients.map((ing) => (
                <li
                  key={ing}
                  className="flex items-center gap-3 text-sm text-on-surface-variant"
                >
                  <span className="w-2 h-2 rounded-full bg-caramel-light shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-cream-dark rounded-2xl p-8 md:p-12 flex items-center justify-center">
            <blockquote className="text-center">
              <p
                className="text-2xl md:text-3xl font-medium text-cocoa-deep italic leading-relaxed"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                &ldquo;La paciencia es nuestro ingrediente principal.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}
