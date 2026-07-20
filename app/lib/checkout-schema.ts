import { z } from "zod";

// Forma del cuerpo que aceptan las rutas de checkout. Vive aquí para que la
// transferencia y Mercado Pago validen exactamente lo mismo: cuando estaba
// duplicado, /api/orders acabó sin validar nada.
//
// Los precios NO viajan en el cuerpo: los recalcula priceCheckout en servidor.
export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().email(),
    phone: z.string().trim().min(6).max(30),
    address: z.string().trim().min(3).max(200),
    city: z.string().trim().min(2).max(100),
  }),
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        quantity: z.number().int().min(1).max(99),
        customization: z.record(z.string(), z.number()).nullable().optional(),
      })
    )
    .min(1),
  sessionId: z.string().max(100).optional(),
  couponCode: z.string().trim().max(40).nullable().optional(),
});

export type CheckoutBody = z.infer<typeof checkoutSchema>;
