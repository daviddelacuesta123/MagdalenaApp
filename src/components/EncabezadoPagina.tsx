import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Icono } from './Icono'

interface Props {
  titulo: string
  /** Si se indica, muestra un botón "atrás" que lleva a esta ruta */
  volverA?: string
  /** Botones extra a la derecha (editar, menú, etc.) */
  acciones?: ReactNode
}

/** Barra superior fija de cada pantalla */
export function EncabezadoPagina({ titulo, volverA, acciones }: Props) {
  const navegar = useNavigate()

  return (
    <header className="pt-seguro sticky top-0 z-10 border-b border-borde bg-fondo/95 backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-2xl items-center gap-2 px-2 pb-2">
        {volverA ? (
          <button
            onClick={() => navegar(volverA)}
            className="grid size-12 shrink-0 place-items-center rounded-full hover:bg-superficie-2"
            aria-label="Volver"
          >
            <Icono nombre="atras" className="size-7" />
          </button>
        ) : (
          <span className="w-2" />
        )}
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{titulo}</h1>
        {acciones && <div className="flex shrink-0 items-center gap-1">{acciones}</div>}
      </div>
    </header>
  )
}
