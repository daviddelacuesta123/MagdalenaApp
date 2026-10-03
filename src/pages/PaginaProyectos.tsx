import { useState } from 'react'
import { Link } from 'react-router'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { FotoProyecto } from '@/components/FotoProyecto'
import { Icono } from '@/components/Icono'
import { clasesBoton } from '@/components/Boton'
import { useProyectos } from '@/hooks/useProyectos'
import type { Proyecto } from '@/db/baseDatos'

type Pestana = 'en_curso' | 'terminado' | 'archivado'

const PESTANAS: { valor: Pestana; texto: string; vacio: string }[] = [
  { valor: 'en_curso', texto: 'En curso', vacio: 'No tienes proyectos en curso.' },
  { valor: 'terminado', texto: 'Terminados', vacio: 'Aún no has terminado ningún proyecto.' },
  { valor: 'archivado', texto: 'Archivados', vacio: 'No hay proyectos archivados.' },
]

/** En qué pestaña va cada proyecto: los archivados solo aparecen en "Archivados" */
function pestanaDe(p: Proyecto): Pestana {
  if (p.archivado) return 'archivado'
  return p.estado
}

/** Pantalla 2: Lista de proyectos con pestañas por estado */
export function PaginaProyectos() {
  const proyectos = useProyectos()
  const [pestana, setPestana] = useState<Pestana>('en_curso')
  const visibles = proyectos?.filter((p) => pestanaDe(p) === pestana) ?? []
  const actual = PESTANAS.find((p) => p.valor === pestana)!

  return (
    <>
      <EncabezadoPagina titulo="Mis proyectos" />

      <div className="mx-auto max-w-2xl px-4 pt-4">
        {/* Pestañas */}
        <div className="mb-4 grid grid-cols-3 rounded-2xl bg-superficie-2 p-1" role="tablist">
          {PESTANAS.map((p) => {
            const cantidad = proyectos?.filter((x) => pestanaDe(x) === p.valor).length ?? 0
            return (
              <button
                key={p.valor}
                role="tab"
                aria-selected={pestana === p.valor}
                onClick={() => setPestana(p.valor)}
                className={`min-h-12 rounded-xl px-1 text-sm font-semibold sm:text-base ${
                  pestana === p.valor ? 'bg-superficie text-texto shadow-sm' : 'text-suave'
                }`}
              >
                {p.texto}
                {cantidad > 0 && <span className="ml-1 font-normal text-suave">({cantidad})</span>}
              </button>
            )
          })}
        </div>

        {proyectos === undefined ? null : visibles.length === 0 ? (
          <div className="py-16 text-center text-suave">
            <Icono nombre="ovillo" className="mx-auto mb-3 size-14 opacity-50" />
            <p>{actual.vacio}</p>
            {pestana === 'en_curso' && (
              <Link to="/proyectos/nuevo" className={clasesBoton('primario', 'normal', 'mt-5')}>
                <Icono nombre="mas" /> Crear mi primer proyecto
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {visibles.map((p) => (
              <TarjetaProyecto key={p.id} proyecto={p} />
            ))}
          </ul>
        )}
      </div>

      {/* Botón flotante para crear un proyecto, encima de la barra inferior */}
      <Link
        to="/proyectos/nuevo"
        className={clasesBoton(
          'primario',
          'grande',
          'fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 rounded-full shadow-lg',
        )}
      >
        <Icono nombre="mas" className="size-7" />
        Nuevo
      </Link>
    </>
  )
}

function TarjetaProyecto({ proyecto: p }: { proyecto: Proyecto }) {
  return (
    <li className="flex items-stretch overflow-hidden rounded-2xl border border-borde bg-superficie">
      <Link to={`/proyectos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4 p-3 active:bg-superficie-2">
        <FotoProyecto proyectoId={p.id} className="size-16 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{p.nombre}</p>
          <p className="text-suave">
            {p.estado === 'terminado' ? `Terminado · ${p.vueltaActual} vueltas` : `Vuelta ${p.vueltaActual}`}
          </p>
        </div>
      </Link>
      {/* Acceso directo al contador, sin pasar por el detalle */}
      {p.estado === 'en_curso' && !p.archivado && (
        <Link
          to={`/proyectos/${p.id}/contador`}
          className="grid w-16 shrink-0 place-items-center border-l border-borde text-primario active:bg-superficie-2"
          aria-label={`Abrir contador de ${p.nombre}`}
        >
          <Icono nombre="contador" className="size-7" />
        </Link>
      )}
    </li>
  )
}
