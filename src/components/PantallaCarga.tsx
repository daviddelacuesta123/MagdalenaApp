import { Icono } from './Icono'

/** Pantalla breve mientras se comprueba la sesión al abrir la app */
export function PantallaCarga() {
  return (
    <div className="grid min-h-dvh place-items-center" aria-busy="true" aria-label="Cargando">
      <Icono nombre="ovillo" className="size-14 animate-spin text-primario [animation-duration:2s]" />
    </div>
  )
}
