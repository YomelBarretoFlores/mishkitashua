"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

type ReviewData = {
  average: number;
  count: number;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    customerName: string;
  }[];
};

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-cream-darker"
          }
        />
      ))}
    </div>
  );
}

type StarFilter = "todas" | "5" | "4" | "3" | "2" | "1";
type TimeFilter = "siempre" | "7" | "30" | "90";
type SortFilter = "recientes" | "mejor" | "peor";

export default function ProductReviews({ productSlug }: { productSlug: string }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [star, setStar] = useState<StarFilter>("todas");
  const [time, setTime] = useState<TimeFilter>("siempre");
  const [sort, setSort] = useState<SortFilter>("recientes");

  useEffect(() => {
    // Se traen todas (≤50) una vez; el encabezado muestra el promedio global y
    // los filtros se aplican en memoria para no re-consultar en cada cambio.
    fetch(`/api/reviews?productSlug=${productSlug}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ average: 0, count: 0, reviews: [] }));
  }, [productSlug]);

  const visible = useMemo(() => {
    if (!data) return [];
    let list = [...data.reviews];
    if (star !== "todas") list = list.filter((r) => r.rating === Number(star));
    if (time !== "siempre") {
      const cutoff = Date.now() - Number(time) * 86_400_000;
      list = list.filter((r) => new Date(r.createdAt).getTime() >= cutoff);
    }
    if (sort === "mejor") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "peor") list.sort((a, b) => a.rating - b.rating);
    else
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return list;
  }, [data, star, time, sort]);

  return (
    <section className="mt-16 md:mt-24 border-t border-cream-darker pt-12 md:pt-16">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2
          className="text-2xl md:text-3xl font-medium text-cocoa-deep"
          style={{ fontFamily: "var(--font-eb-garamond), serif" }}
        >
          Reseñas de clientes
        </h2>
        {data && data.count > 0 && (
          <div className="flex items-center gap-3">
            <Stars rating={data.average} size={20} />
            <span className="text-sm text-on-surface-variant">
              {data.average.toFixed(1)} · {data.count} reseña
              {data.count !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {data && data.count > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={star}
            onChange={(e) => setStar(e.target.value as StarFilter)}
            aria-label="Filtrar por estrellas"
            className="px-3 py-2 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
          >
            <option value="todas">Todas las estrellas</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value as TimeFilter)}
            aria-label="Filtrar por tiempo"
            className="px-3 py-2 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
          >
            <option value="siempre">Cualquier fecha</option>
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortFilter)}
            aria-label="Ordenar reseñas"
            className="px-3 py-2 bg-white border border-cream-darker rounded-lg text-sm text-cocoa-deep focus:outline-none focus:border-cocoa"
          >
            <option value="recientes">Más recientes</option>
            <option value="mejor">Mejor valoradas</option>
            <option value="peor">Peor valoradas</option>
          </select>
        </div>
      )}

      {!data ? (
        <p className="text-sm text-taupe">Cargando reseñas...</p>
      ) : data.count === 0 ? (
        <div className="bg-cream-dark rounded-2xl p-8 text-center">
          <p className="text-on-surface-variant">
            Aún no hay reseñas de este producto. ¡Sé el primero en compartir tu
            experiencia!
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-cream-dark rounded-2xl p-8 text-center">
          <p className="text-on-surface-variant">
            Ninguna reseña coincide con estos filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-cream-darker/60 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-cocoa-deep text-sm">
                  {review.customerName}
                </p>
                <Stars rating={review.rating} />
              </div>
              <p className="text-xs text-taupe mb-3">
                {new Date(review.createdAt).toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {review.comment && (
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
