import { cache } from "react";
import { prisma } from "@/app/lib/prisma";

export type SiteSettings = {
  shippingCost: number;
  freeShippingThreshold: number | null;
  deliveryDays: number;
};

const DEFAULTS: SiteSettings = {
  shippingCost: 12.0,
  freeShippingThreshold: null,
  deliveryDays: 3,
};

// Lee la configuración editable del sitio (fila única). Si aún no existe la
// fila, devuelve los valores por defecto — así funciona sin depender del seed.
// cache() deduplica la lectura dentro de una misma petición.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { id: "singleton" },
    });
    if (!row) return DEFAULTS;
    return {
      shippingCost: row.shippingCost,
      freeShippingThreshold: row.freeShippingThreshold,
      deliveryDays: row.deliveryDays,
    };
  } catch (error) {
    // Se avisa: esto corre en pleno cálculo del precio, así que caer a los
    // valores por defecto en silencio significaría cobrar un envío equivocado
    // sin que nadie se entere.
    console.error("[settings] no se pudo leer la configuración:", error);
    return DEFAULTS;
  }
});
