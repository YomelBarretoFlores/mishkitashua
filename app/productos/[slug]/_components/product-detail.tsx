"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Leaf, Mountain, Droplets, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import type { Product } from "@/app/lib/products";
import { useCart } from "@/app/lib/cart-context";
import { isPromotionActive } from "@/app/lib/promotions";
import { useActivePromotions } from "@/app/lib/promotions-context";
import {
  availabilityOf,
  availabilityLabel,
  availabilityClasses,
} from "@/app/lib/stock";
import ProductReviews from "./product-reviews";

// El producto llega ya resuelto desde el server component (page.tsx), que hace
// notFound() si no existe; aquí siempre está presente.
export default function ProductDetailPage({ product }: { product: Product }) {
  const { addItem } = useCart();
  const disponibilidad = availabilityOf(product.stock);
  const agotado = disponibilidad === "agotado";
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [flavors, setFlavors] = useState<Record<string, number>>({});
  const promos = useActivePromotions();

  const boxSize = product.boxSize ?? 0;
  const flavorTotal = Object.values(flavors).reduce((s, n) => s + n, 0);
  const customizationComplete = !product.customizable || flavorTotal === boxSize;

  const setFlavor = (flavor: string, value: number) => {
    setFlavors((prev) => {
      const next = { ...prev, [flavor]: Math.max(0, value) };
      const others = Object.entries(next)
        .filter(([k]) => k !== flavor)
        .reduce((s, [, n]) => s + n, 0);
      // No permitir exceder el tamaño de la caja.
      if (others + next[flavor] > boxSize) next[flavor] = boxSize - others;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (product.customizable && !customizationComplete) return;
    addItem(
      {
        slug: product.slug,
        name: product.name,
        description: `${product.subtitle}, ${product.weight}`,
        price: product.price,
        image: product.image,
        customization: product.customizable ? { ...flavors } : undefined,
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
          <div className="relative rounded-2xl overflow-hidden mb-4 bg-cream-dark">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              width={800}
              height={1000}
              className="w-full h-auto"
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </div>
          <div className="flex gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-colors ${
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

          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-2xl font-semibold text-cocoa-deep">
              S/ {product.price.toFixed(2)}
            </span>
            <span className="text-sm text-taupe">/ {product.weight}</span>
          </div>

          {/* Disponibilidad: el cliente debe saber si puede comprarlo antes de
              intentarlo, no descubrirlo al pulsar el botón. */}
          <div className="mb-3">
            <span
              className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${availabilityClasses(disponibilidad)}`}
            >
              {availabilityLabel(disponibilidad, product.stock)}
            </span>
          </div>

          {(() => {
            const promo = promos.find(
              (p) =>
                isPromotionActive(p) &&
                (p.type === "flash_discount" || p.type === "buy_x_get_y") &&
                (!p.productSlug || p.productSlug === product.slug)
            );
            if (!promo) return null;
            const label =
              promo.type === "buy_x_get_y"
                ? "2x1"
                : `-${promo.value ?? 0}%`;
            return (
              <div className="inline-flex items-center gap-1.5 bg-caramel-light/30 text-cocoa-deep text-sm font-semibold px-3 py-1.5 rounded-full mb-6">
                <Zap size={14} className="text-caramel" />
                {label} · {promo.title}
              </div>
            );
          })()}

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

          {/* Personalización de sabores */}
          {product.customizable && product.flavorOptions.length > 0 && (
            <div className="mb-6 bg-cream-dark rounded-2xl border border-cream-darker/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-cocoa-deep tracking-wide uppercase">
                  Arma tu caja ({boxSize} unidades)
                </label>
                <span
                  className={`text-sm font-semibold ${
                    customizationComplete ? "text-green-700" : "text-caramel"
                  }`}
                >
                  {flavorTotal}/{boxSize}
                </span>
              </div>
              <div className="space-y-3">
                {product.flavorOptions.map((flavor) => {
                  const value = flavors[flavor] ?? 0;
                  const atMax = flavorTotal >= boxSize;
                  return (
                    <div
                      key={flavor}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-cocoa-deep">{flavor}</span>
                      <div className="inline-flex items-center border border-cream-darker rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() => setFlavor(flavor, value - 1)}
                          disabled={value <= 0}
                          className="p-2 text-cocoa-deep hover:bg-cream-dark transition-colors rounded-l-lg disabled:opacity-30"
                          aria-label={`Quitar ${flavor}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 py-1.5 text-sm font-semibold text-cocoa-deep min-w-[2.5rem] text-center">
                          {value}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFlavor(flavor, value + 1)}
                          disabled={atMax}
                          className="p-2 text-cocoa-deep hover:bg-cream-dark transition-colors rounded-r-lg disabled:opacity-30"
                          aria-label={`Agregar ${flavor}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!customizationComplete && (
                <p className="text-xs text-taupe mt-3">
                  Selecciona {boxSize} unidades en total para continuar.
                </p>
              )}
            </div>
          )}

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
              disabled={!customizationComplete || agotado}
              className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                added
                  ? "bg-green-700 text-white"
                  : "bg-cocoa text-white hover:bg-cocoa-deep"
              }`}
            >
              <ShoppingBag size={18} />
              {agotado
                ? "Agotado"
                : added
                  ? "Agregado al carrito"
                  : "Agregar al Carrito"}
            </button>
            {agotado && (
              <p className="text-xs text-taupe text-center mt-3">
                Se nos acabó por ahora. Escríbenos y te avisamos en cuanto
                volvamos a producir.
              </p>
            )}
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
              Sabor andino en cada presentación
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              {product.longDescription}
            </p>

            <h3 className="text-sm font-semibold text-cocoa-deep tracking-wide uppercase mb-4">
              Ingredientes
            </h3>
            <ul className="space-y-2 mb-6">
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

            {product.allergens && (
              <div>
                <h3 className="text-sm font-semibold text-cocoa-deep tracking-wide uppercase mb-2">
                  Alérgenos
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {product.allergens}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden">
            <Image
              src={product.images[product.images.length - 1]}
              alt={`${product.name} — Mishkitashua`}
              width={800}
              height={800}
              className="w-full h-auto"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Reseñas */}
      <ProductReviews productSlug={product.slug} />
    </div>
  );
}
