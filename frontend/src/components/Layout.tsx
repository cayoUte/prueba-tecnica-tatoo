import { useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { Logo } from "./Logo";
import { Button } from "./ui/Button";

export function Layout({
  children,
  busqueda,
}: {
  children: ReactNode
  /** Va en la barra superior, entre el logo y el boton de salir. */
  busqueda?: ReactNode
}) {
  const { salir } = useAuth();
  const [saliendo, setSaliendo] = useState(false);

  async function cerrarSesion() {
    setSaliendo(true);
    // No hace falta redirigir: al quedar sin usuario, ProtectedRoute
    // manda solo al login. Una unica fuente de verdad.
    await salir();
    setSaliendo(false);
  }

  return (
    <div className="flex h-dvh flex-col">
      {/*
        Tres columnas en vez de `justify-between`: con las laterales a `1fr`
        la del medio queda centrada en la ventana, sin que la anchura del
        logo o del boton la desplacen.
      */}
      <header className="grid h-[42px] shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/10 bg-noche-950/60 px-4 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo tamano="base" />
          <h1 className="truncate text-[10px] font-semibold tracking-wide">weathery</h1>
        </div>

        <div className="w-40 sm:w-72 md:w-96">{busqueda}</div>

        <div className="flex justify-end">
          <Button texto="xs" variante="fantasma" onClick={cerrarSesion} cargando={saliendo}>
            Log out
          </Button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        {children}
      </main>
    </div>
  );
}
