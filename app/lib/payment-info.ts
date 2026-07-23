// Datos de cobro de Mishkitashua, en un solo sitio.
//
// Se muestran en el checkout cuando el cliente elige transferencia o Yape, y
// son los mismos a los que se devuelve el dinero en un reembolso. Al estar
// centralizados, cambiar de cuenta no obliga a buscar por medio proyecto.

export const BANK_TRANSFER = {
  bank: "BCP — Banco de Crédito del Perú",
  holder: "Mishkitashua",
  currency: "Soles (PEN)",
  account: "375-01599433045",
  cci: "002-375-101599433045-41",
};

// Número de celular asociado a Yape. Si se deja vacío, la opción de Yape no se
// muestra: es preferible no ofrecerla a publicar un número equivocado y que
// alguien envíe el dinero a otra persona.
export const YAPE_PHONE = "926 761 067";

export const yapeEnabled = () => YAPE_PHONE.trim().length > 0;
