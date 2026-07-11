# Seguridad — Mishkitashua

Documento de referencia del **sistema seguro de pago** y los controles de seguridad implementados en la tienda virtual Mishkitashua.

## 1. Métodos de pago y pasarela
- **Métodos**: tarjeta de crédito/débito (vía pasarela) y transferencia bancaria.
- **Pasarela**: **Stripe Checkout** (hospedado). El pago ocurre en la página segura de Stripe; los datos de la tarjeta **nunca llegan a nuestro servidor**. Verificamos el resultado del pago con la llave secreta antes de crear el pedido.

## 2. Cifrado y tokenización
- **En tránsito**: TLS/HTTPS forzado (HSTS `max-age=63072000; includeSubDomains; preload`).
- **Tokenización**: Stripe tokeniza la tarjeta en su entorno. **No se almacena ningún dato de tarjeta**; solo metadatos no sensibles (id de la sesión/cargo, marca).
- **Credenciales**: el hashing de contraseñas y la gestión de sesiones la realiza **Clerk** (no almacenamos contraseñas).

## 3. Autenticación y control de acceso
- **Clerk** gestiona identidad con **MFA (TOTP)**, **passkeys/biometría (WebAuthn)** y **OTP por correo**.
- **Roles**: `admin` y `customer` (en `publicMetadata` de Clerk).
- **Autorización por capas**:
  - `middleware.ts` bloquea `/admin/*` y `/api/admin/*` a no-admins y exige sesión en `/cuenta` y `/checkout`.
  - **Defensa en profundidad**: cada endpoint `/api/admin/*` revalida el rol en el servidor con `adminGuard()` (`app/lib/auth.ts`).
- Cookies de sesión `HttpOnly`, `Secure`, `SameSite` (gestionadas por Clerk).

## 4. Prevención de fraude
- **3D Secure** (autenticación del banco) y **antifraude de Stripe (Radar)**.
- **Recálculo del monto en el servidor** desde el catálogo y el motor de promociones (`app/lib/promotions.ts`) — el cliente no puede manipular precios.
- **Idempotencia** en el cargo para evitar cobros duplicados.
- **Rate limiting** en endpoints sensibles (`app/lib/ratelimit.ts`) contra fuerza bruta y abuso.

## 5. Cumplimiento PCI DSS
El sitio queda en **SAQ A**: al usar el checkout hospedado de Stripe, **el entorno nunca procesa, transmite ni almacena datos de titulares de tarjeta**, reduciendo el alcance PCI al mínimo.

## 6. Mapeo OWASP Top 10 (2021)
| Riesgo | Control implementado |
|---|---|
| A01 Broken Access Control | Middleware + `adminGuard()` server-side; rutas de sesión protegidas |
| A02 Cryptographic Failures | TLS/HSTS; tokenización de tarjeta; hashing por Clerk |
| A03 Injection | Prisma (consultas parametrizadas) + validación con **Zod** en las APIs |
| A04 Insecure Design | Recálculo de montos server-side; roles; rate limiting |
| A05 Security Misconfiguration | **CSP**, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, COOP, `poweredByHeader:false`, Permissions-Policy |
| A06 Vulnerable Components | `npm audit` en el pipeline; dependencias actualizadas |
| A07 Auth Failures | MFA/OTP/passkeys y rate limiting vía Clerk |
| A08 Data Integrity Failures | Webhooks firmados; validación de payloads |
| A09 Logging Failures | Registro de eventos y errores server-side sin filtrar datos sensibles |
| A10 SSRF | Sin fetch de URLs provistas por el usuario |

## 7. Cabeceras de seguridad (`next.config.ts`)
`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `X-Permitted-Cross-Domain-Policies: none`, `Permissions-Policy`, y sin `X-Powered-By`.

## 8. Gestión de secretos
Todas las llaves (Clerk, Stripe, Resend, base de datos) viven en variables de entorno (`.env`, fuera del control de versiones). Ver `.env.example`.
