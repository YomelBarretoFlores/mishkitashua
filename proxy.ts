import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Next 16 renombró "middleware" → "proxy". Montamos el contexto de Clerk y un
// gate de primer nivel. NO usamos createRouteMatcher (deprecado): comparamos la
// ruta directamente. La autorización se refuerza además por recurso:
//   - Páginas admin  → requireAdminPage() en app/admin/layout.tsx (rol vía currentUser)
//   - APIs admin     → adminGuard() en cada route handler
//   - /cuenta, /checkout → requireAuthPage() en cada page
export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin") || path.startsWith("/api/admin");
  const needsAuth = path.startsWith("/cuenta") || path.startsWith("/checkout");

  // Gate de primer nivel: exigir SESIÓN. El ROL se valida a nivel de recurso
  // (requireAdminPage / adminGuard con currentUser), sin depender del JWT template.
  if (isAdmin) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return path.startsWith("/api")
        ? NextResponse.json({ error: "No autenticado" }, { status: 401 })
        : redirectToSignIn();
    }
  } else if (needsAuth) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Ejecuta en todo excepto estáticos e internos de Next.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
