// Datos de demostración: qué son y dónde pueden aparecer.
//
// `prisma/seed-demo.ts` crea pedidos, clientes y reseñas ficticios marcados con
// `isDemo`, para que los indicadores logísticos tengan de dónde calcularse
// mientras la tienda todavía no acumula histórico real (los pedidos reales no
// llevan promisedAt/shippedAt/deliveredAt, así que sin ellos no hay nada que
// medir).
//
// Esa marca existía pero no la leía nadie, con dos consecuencias graves:
//
//   1. Se mostraban reseñas inventadas en las fichas de producto y en el
//      aggregateRating que ve Google, como si fueran de clientes reales.
//   2. El panel informaba S/ 4241.50 de ventas cuando las reales eran S/ 604.50.
//
// La regla ahora es explícita:
//
//   - Cara al público  -> NUNCA. Una reseña inventada presentada como auténtica
//                         engaña al comprador.
//   - Dinero y conteos -> NUNCA. Son las cifras con las que se decide.
//   - Indicadores      -> SÍ, porque si no quedan vacíos, pero siempre
//                         etiquetados como tales en pantalla.

/** Para consultas sobre `Order` y `Customer`, que llevan la columna. */
export const soloReales = { isDemo: false } as const;

/** Para `Review`, `OrderItem`, … que heredan la marca a través del pedido. */
export const dePedidoReal = { order: { isDemo: false } } as const;
