import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

// Búsqueda de texto que ignora tildes.
//
// El `mode: "insensitive"` de Prisma ignora mayúsculas pero NO tildes, así que
// "sofia" no encontraba a "Sofía". En un buscador eso es un fallo: nadie
// escribe las tildes al buscar.
//
// Se resuelve con `translate()`, que es nativo de Postgres, en vez de instalar
// la extensión `unaccent`: hace lo mismo para este caso y no añade una
// dependencia que haya que recordar habilitar en cada base nueva.
//
// La contrapartida es que un LIKE sobre una función no usa índices. Para los
// volúmenes de esta tienda (decenas de filas) es irrelevante; si algún día son
// decenas de miles, tocará una columna normalizada o un índice de texto.

const ACENTOS = "áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ";
const LLANOS = "aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC";

/**
 * Prepara el término para un LIKE: escapa los comodines que el usuario pudo
 * escribir sin querer. Sin esto, buscar "100%" devolvería la tabla entera y un
 * "_" haría de comodín de un carácter.
 */
export function patronLike(termino: string): string {
  const escapado = termino.replace(/[\\%_]/g, (c) => `\\${c}`);
  return `%${escapado}%`;
}

/** Expresión SQL que normaliza una columna (o un literal) para comparar. */
export function normalizado(sql: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`translate(lower(${sql}), ${ACENTOS}, ${LLANOS})`;
}

/**
 * Devuelve los ids de las reseñas cuyo comentario, autor o número de pedido
 * contienen el término, ignorando mayúsculas y tildes.
 *
 * Se devuelven ids en vez de las filas para poder combinar el resultado con el
 * resto de filtros y la paginación, que siguen viviendo en Prisma.
 */
export async function idsDeResenasQueCoinciden(
  termino: string
): Promise<string[]> {
  const patron = patronLike(termino);
  const filas = await prisma.$queryRaw<{ id: string }[]>`
    SELECT r."id"
    FROM "Review" r
    LEFT JOIN "Customer" c ON c."id" = r."customerId"
    LEFT JOIN "Order" o ON o."id" = r."orderId"
    WHERE translate(lower(coalesce(r."comment", '')), ${ACENTOS}, ${LLANOS})
            LIKE translate(lower(${patron}), ${ACENTOS}, ${LLANOS}) ESCAPE '\'
       OR translate(lower(coalesce(c."name", '')), ${ACENTOS}, ${LLANOS})
            LIKE translate(lower(${patron}), ${ACENTOS}, ${LLANOS}) ESCAPE '\'
       OR lower(coalesce(o."orderNumber", '')) LIKE lower(${patron}) ESCAPE '\'
  `;
  return filas.map((f) => f.id);
}
