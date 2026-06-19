"use client";

import { useEffect, useState } from "react";
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

export default function ProductReviews({ productSlug }: { productSlug: string }) {
  const [data, setData] = useState<ReviewData | null>(null);

  useEffect(() => {
    fetch(`/api/reviews?productSlug=${productSlug}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ average: 0, count: 0, reviews: [] }));
  }, [productSlug]);

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

      {!data ? (
        <p className="text-sm text-taupe">Cargando reseñas...</p>
      ) : data.count === 0 ? (
        <div className="bg-cream-dark rounded-2xl p-8 text-center">
          <p className="text-on-surface-variant">
            Aún no hay reseñas de este producto. ¡Sé el primero en compartir tu
            experiencia!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.reviews.map((review) => (
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
