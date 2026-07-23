"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Truck, Package, Store, ShoppingCart, Search, Star, X } from "lucide-react";
import { type Product } from "@/app/lib/products";
import { useCart } from "@/app/lib/cart-context";
import {
  availabilityOf,
  availabilityLabel,
  availabilityClasses,
} from "@/app/lib/stock";
import Reveal from "@/app/components/Reveal";

type RatingSummary = Record<string, { average: number; count: number }>;

function CardStars({ rating, count }: { rating: number; count: number }) {
  if (!count) return null;
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={13}
            className={
              s <= Math.round(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-cream-darker"
            }
          />
        ))}
      </div>
      <span className="text-xs text-taupe">
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

function AddToCartCard({
  product,
  rating,
}: {
  product: Product;
  rating?: { average: number; count: number };
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const disponibilidad = availabilityOf(product.stock);
  const agotado = disponibilidad === "agotado";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (agotado) return;
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
      className="group bg-white rounded-2xl overflow-hidden border border-cream-darker/60 hover:shadow-lg hover:shadow-cocoa/8 transition-all duration-300 flex flex-col w-full"
    >
      <div className="relative h-[250px] sm:h-[300px] md:h-[350px] overflow-hidden bg-cream-dark">
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
        {/* Disponibilidad: solo se muestra cuando dice algo útil, para no
            poner "Disponible" en todas las tarjetas y añadir ruido. */}
        {disponibilidad !== "disponible" && (
          <span
            className={`absolute top-3 right-3 text-[12px] font-semibold px-3 py-1 rounded-full ${availabilityClasses(disponibilidad)}`}
          >
            {availabilityLabel(disponibilidad, product.stock)}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3
          className="text-xl font-semibold text-cocoa-deep mb-1"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          {product.name}
        </h3>
        {rating && <CardStars rating={rating.average} count={rating.count} />}
        <p className="text-sm text-on-surface-variant leading-relaxed mb-4 flex-grow line-clamp-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-cream-darker/60">
          <span className="text-lg font-semibold text-caramel">
            S/ {product.price.toFixed(2)}
          </span>
          {agotado ? (
            <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-cream-dark text-taupe">
              Agotado
            </span>
          ) : product.customizable ? (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-cocoa text-white group-hover:bg-cocoa-deep transition-colors">
              <ShoppingCart size={14} />
              Personalizar
            </span>
          ) : (
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
          )}
        </div>
      </div>
    </Link>
  );
}

function AlfajorHeroCard({
  product,
  rating,
}: {
  product: Product;
  rating?: { average: number; count: number };
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const disponibilidad = availabilityOf(product.stock);
  const agotado = disponibilidad === "agotado";

  const handleAdd = () => {
    if (agotado) return;
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
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-caramel-light text-cocoa-deep text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Cajas
          </span>
          {disponibilidad !== "disponible" && (
            <span
              className={`text-[12px] font-semibold px-3 py-1 rounded-full ${availabilityClasses(disponibilidad)}`}
            >
              {availabilityLabel(disponibilidad, product.stock)}
            </span>
          )}
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
        {rating && <CardStars rating={rating.average} count={rating.count} />}
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
          {agotado ? (
            <span className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-cream-dark text-taupe">
              Agotado
            </span>
          ) : product.customizable ? (
            <Link
              href={`/productos/${product.slug}`}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-cocoa text-white hover:bg-cocoa-deep transition-colors"
            >
              <ShoppingCart size={16} />
              Personalizar caja
            </Link>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

type SortOption = "destacados" | "precio-asc" | "precio-desc" | "mejor-valorados";
type CategoryFilter = "todos" | "alfajores" | "manjares";

function FilterBar({
  query,
  setQuery,
  category,
  setCategory,
  sort,
  setSort,
  onClear,
  active,
  resultCount,
}: {
  query: string;
  setQuery: (v: string) => void;
  category: CategoryFilter;
  setCategory: (v: CategoryFilter) => void;
  sort: SortOption;
  setSort: (v: SortOption) => void;
  onClear: () => void;
  active: boolean;
  resultCount: number;
}) {
  const categories: { value: CategoryFilter; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "alfajores", label: "Alfajores" },
    { value: "manjares", label: "Manjares" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-16 mb-10">
      <div className="bg-white rounded-2xl border border-cream-darker/60 p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-10 pr-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
          />
        </div>

        {/* Categorías */}
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                category === c.value
                  ? "bg-cocoa text-white border-cocoa"
                  : "bg-white text-cocoa-deep border-cream-darker hover:border-cocoa-light"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Orden */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-4 py-2.5 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa transition-colors"
        >
          <option value="destacados">Destacados</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="mejor-valorados">Mejor valorados</option>
        </select>

        {active && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-cocoa hover:text-cocoa-deep transition-colors"
          >
            <X size={15} />
            Limpiar
          </button>
        )}
      </div>
      {active && (
        <p className="text-sm text-taupe mt-3 px-1">
          {resultCount} producto{resultCount !== 1 ? "s" : ""} encontrado
          {resultCount !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export default function ProductosContent({
  products,
}: {
  products: Product[];
}) {
  const alfajores = products.filter((p) => p.category === "alfajores");
  const manjares = products.filter((p) => p.category === "manjares");

  const [ratings, setRatings] = useState<RatingSummary>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("todos");
  const [sort, setSort] = useState<SortOption>("destacados");

  useEffect(() => {
    fetch("/api/reviews/summary")
      .then((r) => r.json())
      .then(setRatings)
      .catch(() => {});
  }, []);

  const filtersActive =
    query.trim() !== "" || category !== "todos" || sort !== "destacados";

  const filtered = useMemo(() => {
    let list: Product[] = [...products];
    if (category !== "todos") list = list.filter((p) => p.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (sort === "precio-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "precio-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "mejor-valorados")
      list.sort(
        (a, b) =>
          (ratings[b.slug]?.average ?? 0) - (ratings[a.slug]?.average ?? 0)
      );
    return list;
  }, [products, query, category, sort, ratings]);

  const clearFilters = () => {
    setQuery("");
    setCategory("todos");
    setSort("destacados");
  };

  return (
    <>
      {/* Header */}
      <Reveal className="max-w-7xl mx-auto px-5 md:px-16 py-12 md:py-20 text-center">
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
      </Reveal>

      <FilterBar
        query={query}
        setQuery={setQuery}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        onClear={clearFilters}
        active={filtersActive}
        resultCount={filtered.length}
      />

      {/* Vista filtrada (grilla unificada) */}
      {filtersActive ? (
        <section className="max-w-7xl mx-auto px-5 md:px-16 mb-20 md:mb-28">
          {filtered.length === 0 ? (
            <div className="bg-cream-dark rounded-3xl p-12 text-center">
              <p className="text-on-surface-variant">
                No encontramos productos con esos filtros.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <div key={product.slug} className="flex w-full">
                  <AddToCartCard product={product} rating={ratings[product.slug]} />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <DefaultCatalog
          alfajores={alfajores}
          manjares={manjares}
          ratings={ratings}
        />
      )}

      {/* Shipping Info */}
      <ShippingInfo />
    </>
  );
}

function DefaultCatalog({
  alfajores,
  manjares,
  ratings,
}: {
  alfajores: Product[];
  manjares: Product[];
  ratings: RatingSummary;
}) {
  return (
    <>
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

        {alfajores.map((product, i) => (
          <Reveal key={product.slug} direction="up" delay={i * 0.08}>
            <AlfajorHeroCard product={product} rating={ratings[product.slug]} />
          </Reveal>
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
          {manjares.map((product, i) => (
            <Reveal key={product.slug} className="flex" delay={i * 0.08}>
              <div className="w-full">
                <AddToCartCard product={product} rating={ratings[product.slug]} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

function ShippingInfo() {
  return (
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
            <Reveal className="flex" direction="up">
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center text-center border border-cream-darker/40 hover:border-caramel-light transition-colors w-full">
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
            </Reveal>

            <Reveal className="flex" direction="up" delay={0.1}>
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center text-center border border-cream-darker/40 hover:border-caramel-light transition-colors w-full">
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
            </Reveal>

            <Reveal className="flex" direction="up" delay={0.2}>
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center text-center border border-cream-darker/40 hover:border-caramel-light transition-colors w-full">
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
            </Reveal>
          </div>
        </div>
      </section>
  );
}
