import { NavLink } from 'react-router'
import { Icono, type NombreIcono } from './Icono'

const PESTANAS: { ruta: string; texto: string; icono: NombreIcono }[] = [
  { ruta: '/', texto: 'Proyectos', icono: 'lista' },
  { ruta: '/perfil', texto: 'Perfil', icono: 'usuario' },
]

/** Barra de pestañas inferior, al alcance del pulgar */
export function NavegacionInferior() {
  return (
    <nav className="pb-seguro fixed inset-x-0 bottom-0 z-20 border-t border-borde bg-superficie">
      <ul className="mx-auto flex max-w-2xl">
        {PESTANAS.map((p) => (
          <li key={p.ruta} className="flex-1">
            <NavLink
              to={p.ruta}
              end={p.ruta === '/'}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-0.5 text-sm font-semibold ${
                  isActive ? 'text-primario' : 'text-suave'
                }`
              }
            >
              <Icono nombre={p.icono} className="size-7" />
              {p.texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
