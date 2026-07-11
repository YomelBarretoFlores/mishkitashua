import Stripe from "stripe";

// Cliente de Stripe (servidor). Si no hay STRIPE_SECRET_KEY, el checkout corre
// en MODO SIMULACIÓN (aprueba el pago) para que la demo no dependa de llaves.
export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

let client: Stripe | null = null;
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY no configurada");
  if (!client) client = new Stripe(key);
  return client;
}
