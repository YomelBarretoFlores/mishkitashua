// Cálculo de la fecha comprometida de entrega.
//
// El plazo se cuenta en días HÁBILES (sin sábados ni domingos), porque es como
// se le promete al cliente en la página de ayuda. Esta fecha es la referencia
// contra la que se mide el OTIF: sin ella, "entregado a tiempo" no significa
// nada.

export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++; // 0 = domingo, 6 = sábado
  }
  return d;
}

// Fecha comprometida a partir de la fecha del pedido. Se fija al final del día
// para no marcar como tardío un pedido entregado esa misma jornada.
export function promisedDeliveryDate(orderDate: Date, businessDays: number): Date {
  const d = addBusinessDays(orderDate, businessDays);
  d.setHours(23, 59, 59, 999);
  return d;
}
