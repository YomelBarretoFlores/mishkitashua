import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/auth";
import { enforceRateLimit } from "@/app/lib/ratelimit";

// Gestión de roles del equipo.
//
// La fuente de verdad del rol es publicMetadata.role en Clerk, que es lo que
// leen adminGuard y requireAdminPage. Aquí se lee y se escribe eso mismo, y de
// paso se refleja en Customer.role para poder mostrarlo junto al resto de la
// ficha sin ir a Clerk en cada consulta.

type TeamMember = {
  clerkUserId: string;
  nombre: string;
  email: string;
  rol: "admin" | "cliente";
  esTu: boolean; // para no dejar que se quite el rol a sí mismo
  ultimoAcceso: string | null;
};

function nombreDe(u: {
  firstName: string | null;
  lastName: string | null;
  emailAddresses: { emailAddress: string }[];
}): string {
  const n = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return n || u.emailAddresses[0]?.emailAddress || "Sin nombre";
}

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const { userId: yo } = await auth();
  const client = await clerkClient();

  // Clerk pagina de 10 en 10 por defecto; para un equipo pequeño basta con
  // pedir un lote amplio de una vez.
  const { data: usuarios } = await client.users.getUserList({ limit: 200 });

  const miembros: TeamMember[] = usuarios.map((u) => ({
    clerkUserId: u.id,
    nombre: nombreDe(u),
    email: u.emailAddresses[0]?.emailAddress ?? "",
    rol: u.publicMetadata?.role === "admin" ? "admin" : "cliente",
    esTu: u.id === yo,
    ultimoAcceso: u.lastSignInAt ? new Date(u.lastSignInAt).toISOString() : null,
  }));

  // Invitaciones que aún no se han aceptado.
  const { data: invitaciones } = await client.invitations.getInvitationList({
    status: "pending",
  });

  return NextResponse.json({
    miembros: miembros.sort((a, b) => {
      if (a.rol !== b.rol) return a.rol === "admin" ? -1 : 1;
      return a.nombre.localeCompare(b.nombre, "es");
    }),
    invitaciones: invitaciones.map((i) => ({
      id: i.id,
      email: i.emailAddress,
      rol: i.publicMetadata?.role === "admin" ? "admin" : "cliente",
      creada: new Date(i.createdAt).toISOString(),
    })),
    adminsTotales: miembros.filter((m) => m.rol === "admin").length,
  });
}

const cambioSchema = z.object({
  clerkUserId: z.string().min(1).max(80),
  rol: z.enum(["admin", "cliente"]),
});

// PATCH: cambia el rol de alguien que ya tiene cuenta.
export async function PATCH(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  const parsed = cambioSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { clerkUserId, rol } = parsed.data;
  const { userId: yo } = await auth();
  const client = await clerkClient();

  // Nadie se quita su propio acceso: es la forma más fácil de quedarse fuera
  // del panel sin poder volver a entrar.
  if (clerkUserId === yo && rol !== "admin") {
    return NextResponse.json(
      { error: "No puedes quitarte tu propio rol de administrador" },
      { status: 400 }
    );
  }

  // Y siempre tiene que quedar al menos un administrador.
  if (rol !== "admin") {
    const { data: usuarios } = await client.users.getUserList({ limit: 200 });
    const admins = usuarios.filter((u) => u.publicMetadata?.role === "admin");
    if (admins.length <= 1) {
      return NextResponse.json(
        { error: "Debe quedar al menos un administrador" },
        { status: 400 }
      );
    }
  }

  try {
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { role: rol === "admin" ? "admin" : "customer" },
    });

    // Reflejo en nuestra base, solo para mostrarlo. Si falla, el rol real ya
    // quedó bien guardado en Clerk, así que no se rompe la operación.
    await prisma.customer
      .updateMany({
        where: { clerkUserId },
        data: { role: rol === "admin" ? "admin" : "customer" },
      })
      .catch((err) => console.error("[usuarios] no se pudo reflejar el rol:", err));

    return NextResponse.json({ ok: true, rol });
  } catch (error) {
    console.error("[admin/usuarios PATCH]", error);
    return NextResponse.json(
      { error: "No se pudo cambiar el rol" },
      { status: 500 }
    );
  }
}

const invitacionSchema = z.object({
  email: z.string().email().max(160),
  rol: z.enum(["admin", "cliente"]).default("admin"),
});

// POST: invita a alguien por correo.
//
// Se usa una invitación en vez de crear la cuenta a mano a propósito: así la
// persona elige su propia contraseña en Clerk y esta aplicación no llega a
// tocar ninguna credencial en ningún momento.
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  const limited = enforceRateLimit(request, "admin-invitaciones", 5, 60_000);
  if (limited) return limited;

  const parsed = invitacionSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }
  const { email, rol } = parsed.data;

  try {
    const client = await clerkClient();
    const invitacion = await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: rol === "admin" ? "admin" : "customer" },
      redirectUrl: "https://mishkitashua.com/registro",
      ignoreExisting: false,
    });
    return NextResponse.json({ ok: true, id: invitacion.id });
  } catch (error) {
    console.error("[admin/usuarios POST]", error);
    // El caso habitual: ya existe una invitación o una cuenta con ese correo.
    const msg = String((error as { errors?: { message?: string }[] })?.errors?.[0]?.message ?? "");
    return NextResponse.json(
      {
        error:
          msg ||
          "No se pudo enviar la invitación. Puede que ya exista una cuenta o una invitación con ese correo.",
      },
      { status: 400 }
    );
  }
}

// DELETE: anula una invitación que aún no se aceptó.
export async function DELETE(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta la invitación" }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    await client.invitations.revokeInvitation(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/usuarios DELETE]", error);
    return NextResponse.json(
      { error: "No se pudo anular la invitación" },
      { status: 500 }
    );
  }
}
