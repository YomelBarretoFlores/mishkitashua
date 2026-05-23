import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/app/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-cream-darker/60 hover:shadow-lg hover:shadow-cocoa/8 transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <span className="absolute top-3 left-3 bg-cocoa/90 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          {product.category === "alfajores" ? "Alfajores" : "Manjar"}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-serif text-xl font-semibold text-cocoa-deep mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-on-surface-variant italic mb-3">
          {product.subtitle}
        </p>
        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-4">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-caramel">
            S/ {product.price.toFixed(2)}
          </span>
          <span className="text-xs text-taupe">{product.weight}</span>
        </div>
      </div>
    </Link>
  );
}
