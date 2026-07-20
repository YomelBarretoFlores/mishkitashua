import { NextResponse } from "next/server";

// Rate limiting simple (ventana fija) en memoria POR INSTANCIA. En serverless
// cada instancia lleva su propio contador, así que el límite efectivo es
// aproximado (N instancias → hasta N×límite) y se reinicia en cada arranque en
// frío. Frena el abuso casual; para un límite estricto haría falta un store
// compartido (Redis) o el WAF de Vercel.
// OWASP A04/A07: mitiga fuerza bruta, scraping y abuso de endpoints sensibles.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Limpieza perezosa para no crecer sin límite.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, b] of buckets) if (b.resetAt < now) buckets.delete(key);
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfter: number; // segundos
};

export function rateLimit(
  identifier: string,
  limit = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(identifier);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

// Obtiene la IP del request (para identificar al cliente).
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// Helper: aplica el límite y devuelve una respuesta 429 si se excede, o null.
export function enforceRateLimit(
  request: Request,
  scope: string,
  limit = 10,
  windowMs = 60_000
): NextResponse | null {
  const id = `${scope}:${getClientIp(request)}`;
  const result = rateLimit(id, limit, windowMs);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Inténtalo más tarde." },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
    );
  }
  return null;
}
