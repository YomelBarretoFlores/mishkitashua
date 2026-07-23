"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import DateRangeFilter from "@/app/admin/_components/date-range-filter";

type ProductOption = { slug: string; name: string };

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  productSlug: string | null;
  createdAt: string;
  customer: { name: string };
  order: { orderNumber: string };
};

export default function ResenasPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [productSlug, setProductSlug] = useState("");
  const [rating, setRating] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("recientes");
  const [products, setProducts] = useState<ProductOption[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]));
  }, []);

  // Mapa slug → nombre para mostrar el producto reseñado.
  const nameBySlug = useMemo(
    () => Object.fromEntries(products.map((p) => [p.slug, p.name])),
    [products]
  );

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20", sort });
    if (productSlug) params.set("productSlug", productSlug);
    if (rating) params.set("rating", rating);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await fetch(`/api/admin/resenas?${params}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, productSlug, rating, from, to, sort]);

  useEffect(() => {
    // Carga inicial de datos: el estado se actualiza tras el await del fetch,
    // no de forma síncrona, pero la regla no puede verlo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  const resetToFirstPage = () => setPage(1);

  // "Limpiar filtros" solo aparece si hay alguno puesto, para no ofrecer un
  // botón que no haría nada.
  const hasFilters =
    productSlug !== "" || rating !== "" || from !== "" || to !== "" || sort !== "recientes";

  const clearFilters = () => {
    setProductSlug("");
    setRating("");
    setFrom("");
    setTo("");
    setSort("recientes");
    setPage(1);
  };

  return (
    <div>
      <h1
        className="text-xl sm:text-2xl font-medium text-cocoa-deep mb-6"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Reseñas
      </h1>

      {/* Filtros. Cada control lleva su etiqueta encima: sin ella, los campos
          de fecha se veían como dos cajas grises vacías sin saber qué pedían. */}
      <div className="bg-white rounded-2xl border border-cream-darker/60 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <label className="block lg:col-span-2">
            <span className="block text-xs font-medium text-on-surface-variant mb-1">
              Producto
            </span>
            <select
              value={productSlug}
              onChange={(e) => { setProductSlug(e.target.value); resetToFirstPage(); }}
              className="w-full px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
            >
              <option value="">Todos los productos</option>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-on-surface-variant mb-1">
              Estrellas
            </span>
            <select
              value={rating}
              onChange={(e) => { setRating(e.target.value); resetToFirstPage(); }}
              className="w-full px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
            >
              <option value="">Todas las estrellas</option>
              <option value="5">5 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="2">2 estrellas</option>
              <option value="1">1 estrella</option>
            </select>
          </label>
          <DateRangeFilter
            from={from}
            to={to}
            onFromChange={(v) => { setFrom(v); resetToFirstPage(); }}
            onToChange={(v) => { setTo(v); resetToFirstPage(); }}
          />
          <label className="block">
            <span className="block text-xs font-medium text-on-surface-variant mb-1">
              Orden
            </span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); resetToFirstPage(); }}
              className="w-full px-3 py-2 bg-cream-dark border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
            >
              <option value="recientes">Más recientes</option>
              <option value="mejor">Mejor valoradas</option>
              <option value="peor">Peor valoradas</option>
            </select>
          </label>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cocoa hover:text-caramel transition-colors"
          >
            <X size={13} />
            Limpiar filtros
          </button>
        )}
      </div>

      <p className="text-sm text-on-surface-variant mb-3">
        {total} reseña{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <p className="text-taupe py-12 text-center">Cargando...</p>
      ) : reviews.length === 0 ? (
        <p className="text-taupe text-center py-12">
          No se encontraron reseñas con estos filtros
        </p>
      ) : (
        <>
          <div className="space-y-4 mb-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-cream-darker/60 p-5"
              >
                <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-cocoa-deep">
                      {review.customer.name}
                    </p>
                    <p className="text-xs text-taupe">
                      {review.productSlug
                        ? nameBySlug[review.productSlug] ?? review.productSlug
                        : "Pedido completo"}{" "}
                      · Pedido {review.order.orderNumber} ·{" "}
                      {new Date(review.createdAt).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={18}
                        className={
                          s <= review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-cream-darker"
                        }
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-on-surface-variant">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-on-surface-variant">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 bg-white border border-cream-darker/60 rounded-lg text-sm text-cocoa-deep hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 bg-white border border-cream-darker/60 rounded-lg text-sm text-cocoa-deep hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
