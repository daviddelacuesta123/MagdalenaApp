import { createBrowserRouter, RouterProvider } from 'react-router'
import { ProveedorAjustes } from '@/hooks/useAjustes'
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
 *   /                          → lista de proyectos
 *   /proyectos/nuevo           → crear proyecto
 *   /proyectos/:id             → detalle del proyecto
 *   /proyectos/:id/editar      → editar proyecto
 *   /proyectos/:id/contador    → contador a pantalla completa
 *   /perfil                    → perfil y ajustes
 */
const enrutador = createBrowserRouter([
  { path: '/acceso', element: <PaginaAcceso /> },
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
      <RouterProvider router={enrutador} />
    </ProveedorAjustes>
  )
}
