import { prisma } from "@/app/lib/prisma";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  customer: { name: string };
  order: { orderNumber: string };
};

export default async function ResenasPage() {
  const reviews: ReviewItem[] = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      order: { select: { orderNumber: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reseñas</h1>

      {reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          Aún no hay reseñas
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.customer.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Pedido {review.order.orderNumber} ·{" "}
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
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
