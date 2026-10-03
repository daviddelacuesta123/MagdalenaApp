import { Outlet } from 'react-router'
import { NavegacionInferior } from './NavegacionInferior'

/** Estructura de las pantallas principales: contenido + barra de pestañas abajo.
 *  El contador NO usa este diseño para tener la pantalla completa. */
export function DisenoPrincipal() {
  return (
    <div className="min-h-dvh pb-28">
      <Outlet />
      <NavegacionInferior />
    </div>
  )
}
