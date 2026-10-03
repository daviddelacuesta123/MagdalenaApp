import { Navigate, Outlet, useLocation } from 'react-router'
import { useSesion } from '@/hooks/useSesion'
import { PantallaCarga } from './PantallaCarga'

/**
 * Envuelve las rutas que requieren sesión iniciada.
 * Si no hay sesión, manda a /acceso recordando a qué pantalla se quería ir.
 * Sin conexión funciona igual: usa la sesión guardada en el teléfono.
 */
export function RutaProtegida() {
  const { usuario, cargando } = useSesion()
  const ubicacion = useLocation()

  if (cargando) return <PantallaCarga />
  if (!usuario) return <Navigate to="/acceso" replace state={{ desde: ubicacion.pathname }} />
  return <Outlet />
}
