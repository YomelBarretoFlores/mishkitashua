import { Loader2 } from "lucide-react";

export default function ConfirmandoPagoMercadoPago() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-24 md:py-32 text-center">
      <Loader2 size={44} className="text-caramel mx-auto mb-6 animate-spin" />
      <h1
        className="text-2xl md:text-3xl font-medium text-cocoa-deep mb-2"
        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
      >
        Confirmando tu pago…
      </h1>
      <p className="text-on-surface-variant">
        Estamos verificando tu pago con Mercado Pago y registrando tu pedido.
      </p>
    </div>
  );
}
