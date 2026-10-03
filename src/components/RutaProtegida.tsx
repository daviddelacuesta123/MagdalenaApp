import { Outlet } from 'react-router'

/**
 * Envuelve las rutas que requieren sesión iniciada.
 * FASE 1: deja pasar siempre.
 * FASE 2: comprobará la sesión de Supabase y redirigirá a /acceso si no hay.
 */
export function RutaProtegida() {
  return <Outlet />
}
