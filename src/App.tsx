import { createBrowserRouter, RouterProvider } from 'react-router'
import { ProveedorAjustes } from '@/hooks/useAjustes'
import { ProveedorSesion } from '@/hooks/useSesion'
import { PaginaRecuperar } from '@/pages/PaginaRecuperar'
import { PaginaRestablecer } from '@/pages/PaginaRestablecer'
import { RutaProtegida } from '@/components/RutaProtegida'
import { DisenoPrincipal } from '@/components/DisenoPrincipal'
import { PaginaAcceso } from '@/pages/PaginaAcceso'
import { PaginaProyectos } from '@/pages/PaginaProyectos'
import { PaginaContador } from '@/pages/PaginaContador'
import { PaginaDetalleProyecto } from '@/pages/PaginaDetalleProyecto'
import { PaginaFormularioProyecto } from '@/pages/PaginaFormularioProyecto'
import { PaginaPerfil } from '@/pages/PaginaPerfil'
import { PaginaNoEncontrada } from '@/pages/PaginaNoEncontrada'

/**
 * Mapa de rutas de la app:
 *   /acceso                    → inicio de sesión / registro (pública)
 *   /recuperar                 → pedir enlace para cambiar la contraseña (pública)
 *   /restablecer               → elegir contraseña nueva (desde el enlace del correo o el perfil)
 *   /                          → lista de proyectos
 *   /proyectos/nuevo           → crear proyecto
 *   /proyectos/:id             → detalle del proyecto
 *   /proyectos/:id/editar      → editar proyecto
 *   /proyectos/:id/contador    → contador a pantalla completa
 *   /perfil                    → perfil y ajustes
 */
const enrutador = createBrowserRouter([
  { path: '/acceso', element: <PaginaAcceso /> },
  { path: '/recuperar', element: <PaginaRecuperar /> },
  { path: '/restablecer', element: <PaginaRestablecer /> },
  {
    element: <RutaProtegida />,
    children: [
      {
        // Pantallas con barra de pestañas inferior
        element: <DisenoPrincipal />,
        children: [
          { index: true, element: <PaginaProyectos /> },
          { path: 'proyectos/nuevo', element: <PaginaFormularioProyecto /> },
          { path: 'proyectos/:id', element: <PaginaDetalleProyecto /> },
          { path: 'proyectos/:id/editar', element: <PaginaFormularioProyecto /> },
          { path: 'perfil', element: <PaginaPerfil /> },
        ],
      },
      // El contador va sin barra inferior para aprovechar toda la pantalla
      { path: 'proyectos/:id/contador', element: <PaginaContador /> },
    ],
  },
  { path: '*', element: <PaginaNoEncontrada /> },
])

export function App() {
  return (
    <ProveedorAjustes>
      <ProveedorSesion>
        <RouterProvider router={enrutador} />
      </ProveedorSesion>
    </ProveedorAjustes>
  )
}
