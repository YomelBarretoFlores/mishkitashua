import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// Cliente de Mercado Pago (servidor). Pasarela con soporte para Perú:
// tarjetas vía Checkout Pro (hospedado, PCI SAQ-A) y Yape vía Checkout API.
export function mercadoPagoConfigured(): boolean {
  return !!process.env.MP_ACCESS_TOKEN;
}

// Las credenciales de prueba empiezan con "TEST-". Sirve para mostrar avisos
// de entorno de pruebas en la interfaz.
export function mercadoPagoIsTest(): boolean {
  return (process.env.MP_ACCESS_TOKEN ?? "").startsWith("TEST-");
}

let client: MercadoPagoConfig | null = null;
export function getMercadoPago(): MercadoPagoConfig {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MP_ACCESS_TOKEN no configurada");
  if (!client) client = new MercadoPagoConfig({ accessToken });
  return client;
}

export function getPreferenceClient(): Preference {
  return new Preference(getMercadoPago());
}

export function getPaymentClient(): Payment {
  return new Payment(getMercadoPago());
}
