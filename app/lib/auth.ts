import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { linkClerkUserToCustomer } from "@/app/lib/customers";
import type { Customer } from "@prisma/client";

// ¿El usuario autenticado tiene rol admin? (fuente de verdad: publicMetadata de Clerk)
export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  return user?.publicMetadata?.role === "admin";
}

// Lanza si no es admin. Úsese al inicio de cada endpoint /api/admin/* (defensa en profundidad).
export class ForbiddenError extends Error {}
export class UnauthorizedError extends Error {}

export async function requireAdmin(): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();
  if (!(await isAdmin())) throw new ForbiddenError();
}

// Guard listo para usar al inicio de un route handler de admin.
// Devuelve una respuesta 401/403 si no procede, o null si el acceso es válido.
export async function adminGuard(): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}

// --- Guards a nivel de PÁGINA (server components) ---
// Enfoque "resource-based" recomendado por Clerk: la protección vive en cada
// recurso, no en el matching de rutas del middleware.

export async function requireAuthPage(returnUrl?: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    redirect(
      returnUrl
        ? `/ingresar?redirect_url=${encodeURIComponent(returnUrl)}`
        : "/ingresar"
    );
  }
}

export async function requireAdminPage(): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/ingresar");
  if (!(await isAdmin())) redirect("/");
}

// Devuelve (creando si hace falta) el Customer en Neon ligado al usuario de Clerk.
// Con esto "recopilamos los datos del cliente" en nuestra propia base.
export async function getCurrentCustomer(): Promise<Customer | null> {
  const user = await currentUser();
  if (!user) return null;

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "";
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    email ||
    "Cliente";

  return linkClerkUserToCustomer({ clerkUserId: user.id, email, name });
}
