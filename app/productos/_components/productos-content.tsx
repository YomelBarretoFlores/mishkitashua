"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Truck, Package, Store, ShoppingCart } from "lucide-react";
import { products, type Product } from "@/app/lib/products";
import { useCart } from "@/app/lib/cart-context";

function AddToCartCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      slug: product.slug,
      name: product.name,
      description: `${product.subtitle}, ${product.weight}`,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-cream-darker/60 hover:shadow-lg hover:shadow-cocoa/8 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-[350px] overflow-hidden bg-cream-dark">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className="absolute top-3 left-3 bg-caramel-light text-cocoa-deep text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Nuevo
        </span>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3
          className="text-xl font-semibold text-cocoa-deep mb-1"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          {product.name}
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-4 flex-grow line-clamp-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-cream-darker/60">
          <span className="text-lg font-semibold text-caramel">
            S/ {product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              added
                ? "bg-green-700 text-white"
                : "bg-cocoa text-white hover:bg-cocoa-deep"
            }`}
          >
            <ShoppingCart size={14} />
            {added ? "Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </Link>
  );
}

function AlfajorHeroCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      slug: product.slug,
      name: product.name,
      description: `${product.subtitle}, ${product.weight}`,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl overflow-hidden border border-cream-darker/60 shadow-[0_4px_20px_rgba(62,39,35,0.04)] hover:shadow-[0_8px_30px_rgba(62,39,35,0.08)] transition-all duration-300">
      <Link
        href={`/productos/${product.slug}`}
        className="relative overflow-hidden bg-cream-dark"
      >
        <Image
          src={product.image}
          alt={product.name}
          width={800}
          height={1000}
          className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-caramel-light text-cocoa-deep text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Cajas
          </span>
        </div>
      </Link>
      <div className="p-6 md:p-10 flex flex-col justify-center">
        <Link href={`/productos/${product.slug}`}>
          <h3
            className="text-2xl md:text-3xl font-medium text-cocoa-deep mb-2 hover:text-caramel transition-colors"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            {product.name}
          </h3>
        </Link>
        <p className="text-on-surface-variant italic mb-4">
          {product.subtitle}
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-6">
          {product.longDescription}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {product.features.map((f) => (
            <span
              key={f}
              className="bg-cream-dark text-cocoa-deep text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-cream-darker/60">
          <span className="text-2xl font-medium text-caramel">
            S/ {product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              added
                ? "bg-green-700 text-white"
                : "bg-cocoa text-white hover:bg-cocoa-deep"
            }`}
          >
            <ShoppingCart size={16} />
            {added ? "Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductosContent() {
  const alfajores = products.filter((p) => p.category === "alfajores");
  const manjares = products.filter((p) => p.category === "manjares");

  return (
    <>
      {/* Header */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 py-12 md:py-20 text-center">
        <h1
          className="text-4xl md:text-[64px] font-medium text-cocoa-deep mb-6"
          style={{
            fontFamily: "var(--font-eb-garamond), serif",
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
          }}
        >
          Nuestros productos
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Descubre el portafolio Mishkitashua: alfajores andinos y manjares
          saborizados con presentaciones modernas, sabores diferenciados y una
          identidad visual inspirada en los Andes.
        </p>
      </section>

      {/* Alfajores Section */}
      <section
        className="max-w-7xl mx-auto px-5 md:px-16 mb-20 md:mb-28"
        id="alfajores"
      >
        <div className="mb-10">
          <h2
            className="text-3xl md:text-[40px] font-medium text-cocoa-deep mb-3"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Alfajores Andinos
          </h2>
          <p className="text-on-surface-variant max-w-xl">
            Nuestros alfajores andinos se presentan en una caja surtida de 6
            unidades, con sabores de tuna, aguaymanto y muña. Cada variedad se
            diferencia por su relleno, color característico y perfil de sabor,
            creando una experiencia visual y sensorial atractiva.
          </p>
        </div>

        {alfajores.map((product) => (
          <AlfajorHeroCard key={product.slug} product={product} />
        ))}
      </section>

      {/* Manjares Section */}
      <section
        className="max-w-7xl mx-auto px-5 md:px-16 mb-20 md:mb-28"
        id="manjares"
      >
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-[40px] font-medium text-cocoa-deep mb-4"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Manjares Saborizados
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Descubre nuestra línea de manjares con sabores únicos de origen
            andino, perfectos para acompañar tus momentos especiales.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {manjares.map((product) => (
            <AddToCartCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Shipping Info */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 mb-20 md:mb-28">
        <div className="bg-cream-dark rounded-3xl p-8 md:p-12 border border-cream-darker/60">
          <div className="text-center mb-10">
            <h2
              className="text-2xl md:text-[32px] font-medium text-cocoa-deep mb-4"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              Información de Envío
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Llevamos el sabor artesanal directamente a tu puerta, cuidando
              cada detalle para que tus productos lleguen en perfectas
              condiciones.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center text-center border border-cream-darker/40 hover:border-caramel-light transition-colors">
              <div className="w-16 h-16 rounded-full bg-caramel-light/30 flex items-center justify-center mb-4">
                <Truck size={28} className="text-caramel" />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-2"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Envíos Nacionales
              </h3>
              <p className="text-sm text-on-surface-variant">
                Realizamos envíos a todo el país. Los pedidos se despachan en
                24-48 horas hábiles para garantizar la frescura.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl flex flex-col items-center text-center border border-cream-darker/40 hover:border-caramel-light transition-colors">
              <div className="w-16 h-16 rounded-full bg-caramel-light/30 flex items-center justify-center mb-4">
                <Package size={28} className="text-caramel" />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-2"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Empaque Seguro
              </h3>
              <p className="text-sm text-on-surface-variant">
                Utilizamos empaques térmicos y protectores especiales para que
                los productos no sufran alteraciones durante el viaje.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl flex flex-col items-center text-center border border-cream-darker/40 hover:border-caramel-light transition-colors">
              <div className="w-16 h-16 rounded-full bg-caramel-light/30 flex items-center justify-center mb-4">
                <Store size={28} className="text-caramel" />
              </div>
              <h3
                className="text-xl font-semibold text-cocoa-deep mb-2"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Retiro en Tienda
              </h3>
              <p className="text-sm text-on-surface-variant">
                ¿Estás cerca? Puedes seleccionar la opción de retiro por
                nuestra boutique sin costo adicional.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
