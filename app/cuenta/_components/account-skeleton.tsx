import AccountNav from "./account-nav";

// Esqueleto de carga del área de cuenta. Mantiene el encabezado y la
// sub-navegación visibles para que el cambio de pestaña se sienta instantáneo.
export default function AccountSkeleton({
  title,
  active,
}: {
  title: string;
  active: "datos" | "pedidos" | "devoluciones";
}) {
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">
      <h1
        className="text-3xl md:text-4xl font-medium text-cocoa-deep mb-2"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        {title}
      </h1>
      <div className="h-4 w-64 max-w-full bg-cream-dark rounded mb-6 animate-pulse" />
      <AccountNav active={active} />
      <div className="space-y-4 mt-6 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-cream-darker/60 p-5 md:p-6"
          >
            <div className="h-4 w-40 bg-cream-dark rounded mb-4" />
            <div className="h-3 w-full bg-cream-dark rounded mb-2" />
            <div className="h-3 w-2/3 bg-cream-dark rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
