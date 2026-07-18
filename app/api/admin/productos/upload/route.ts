import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { adminGuard } from "@/app/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// Sube una imagen de producto a Vercel Blob y devuelve su URL pública.
// Solo admin. La subida es same-origin (fetch a esta ruta), por lo que el CSP
// no necesita cambios para el POST; el host del blob sí se whitelistea en
// next.config.ts para poder MOSTRAR la imagen con next/image.
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Almacenamiento de imágenes no configurado (BLOB_READ_WRITE_TOKEN)" },
      { status: 503 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió ninguna imagen" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Formato no permitido (usa JPG, PNG, WEBP o AVIF)" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen supera 5 MB" }, { status: 400 });
    }

    const blob = await put(`productos/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[admin/productos/upload]", error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
