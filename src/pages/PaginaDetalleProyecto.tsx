import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { Icono } from '@/components/Icono'
import { clasesBoton } from '@/components/Boton'

/**
 * Pantalla 4: Detalle del proyecto (foto, notas, patrón y estadísticas).
 * FASE 1: estructura con contenido de ejemplo.
 */
export function PaginaDetalleProyecto() {
  const { id } = useParams()

  return (
    <>
      <EncabezadoPagina
        titulo="Proyecto de ejemplo"
        volverA="/"
        acciones={
          <Link
            to={`/proyectos/${id}/editar`}
            className="grid size-12 place-items-center rounded-full hover:bg-superficie-2"
            aria-label="Editar proyecto"
          >
            <Icono nombre="editar" />
          </Link>
        }
      />

      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        {/* Foto del proyecto (Fase 2/3) */}
        <div className="grid aspect-[4/3] max-w-full place-items-center rounded-2xl bg-superficie-2 text-suave">
          <Icono nombre="camara" className="size-12 opacity-50" />
        </div>

        <Link to={`/proyectos/${id}/contador`} className={clasesBoton('primario', 'grande', 'w-full')}>
          <Icono nombre="contador" className="size-7" /> Abrir contador
        </Link>

        <Seccion titulo="Estadísticas">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Dato valor="—" texto="Tiempo" />
            <Dato valor="12" texto="Vueltas" />
            <Dato valor="—" texto="Puntos" />
          </div>
        </Seccion>

        <Seccion titulo="Patrón">
          <p className="text-suave">Aquí verás las vueltas del patrón (Fase 4).</p>
        </Seccion>

        <Seccion titulo="Notas">
          <p className="text-suave">Sin notas.</p>
        </Seccion>
      </div>
    </>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-borde bg-superficie p-4">
      <h2 className="mb-2 text-lg font-bold">{titulo}</h2>
      {children}
    </section>
  )
}

function Dato({ valor, texto }: { valor: string; texto: string }) {
  return (
    <div className="rounded-xl bg-superficie-2 p-3">
      <p className="text-2xl font-bold tabular-nums">{valor}</p>
      <p className="text-sm text-suave">{texto}</p>
    </div>
  )
}
