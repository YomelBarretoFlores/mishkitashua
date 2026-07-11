// Marcador de posición mientras el widget de Clerk carga en el cliente.
// Reserva la altura del formulario para evitar el salto/"corte" al recargar.
export default function AuthFormSkeleton() {
  return (
    <div className="w-full min-h-[340px] animate-pulse px-2 pt-3" aria-hidden>
      {/* Botón social */}
      <div className="h-11 rounded-lg bg-cream-dark" />
      {/* Separador */}
      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-cream-darker" />
        <div className="h-2 w-2 rounded-full bg-cream-darker" />
        <div className="h-px flex-1 bg-cream-darker" />
      </div>
      {/* Campo de correo */}
      <div className="h-3 w-28 rounded bg-cream-dark mb-2" />
      <div className="h-11 rounded-lg bg-cream-dark" />
      {/* Botón continuar */}
      <div className="h-11 rounded-lg bg-cocoa/25 mt-5" />
      {/* Enlace inferior */}
      <div className="h-3 w-40 rounded bg-cream-dark mx-auto mt-6" />
    </div>
  );
}
