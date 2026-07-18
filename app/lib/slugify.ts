// Convierte un nombre en un slug URL-safe: minúsculas, sin acentos, con
// guiones. "Alfajor Muña Andina" → "alfajor-muna-andina".
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quitar diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // no alfanumérico → guion
    .replace(/^-+|-+$/g, ""); // sin guiones al inicio/fin
}
