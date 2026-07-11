// Apariencia compartida de los widgets de Clerk (SignIn / SignUp).
// Se funde con el AuthShell: sin tarjeta ni sombra propias, y se oculta su
// encabezado porque el título lo pone el AuthShell con la fuente de la marca.
export const authAppearance = {
  variables: {
    colorPrimary: "#3e2723",
    fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full !shadow-none !border-0",
    card: "w-full !shadow-none !border-0 !bg-transparent !px-2 !pt-3 !pb-0 gap-5",
    socialButtonsBlockButton: "!mt-1",
    header: "!hidden",
    // El footer de Clerk pinta un gradiente sutil (imagen de fondo), no un
    // color; por eso !bg-none además de !bg-transparent para dejarlo blanco.
    footer: "!bg-transparent !bg-none",
    footerAction: "!bg-transparent !bg-none",
  },
};
