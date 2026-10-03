import { useState } from 'react'
import { Link } from 'react-router'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { Icono } from '@/components/Icono'
import { clasesBoton } from '@/components/Boton'

type Pestana = 'en_curso' | 'terminado' | 'archivado'

const PESTANAS: { valor: Pestana; texto: string }[] = [
  { valor: 'en_curso', texto: 'En curso' },
  { valor: 'terminado', texto: 'Terminados' },
  { valor: 'archivado', texto: 'Archivados' },
]

// Datos de ejemplo SOLO para la Fase 1 (en la Fase 3 vendrán de Dexie)
const EJEMPLOS = [
  { id: 'ejemplo', nombre: 'Proyecto de ejemplo', vuelta: 12, estado: 'en_curso' as Pestana },
]

/** Pantalla 2: Lista de proyectos con pestañas por estado */
export function PaginaProyectos() {
  const [pestana, setPestana] = useState<Pestana>('en_curso')
  const visibles = EJEMPLOS.filter((p) => p.estado === pestana)

  return (
    <>
      <EncabezadoPagina titulo="Mis proyectos" />

      <div className="mx-auto max-w-2xl px-4 pt-4">
        {/* Pestañas */}
        <div className="mb-4 grid grid-cols-3 rounded-2xl bg-superficie-2 p-1" role="tablist">
          {PESTANAS.map((p) => (
            <button
              key={p.valor}
              role="tab"
              aria-selected={pestana === p.valor}
              onClick={() => setPestana(p.valor)}
              className={`min-h-12 rounded-xl text-sm font-semibold sm:text-base ${
                pestana === p.valor ? 'bg-superficie text-texto shadow-sm' : 'text-suave'
              }`}
            >
              {p.texto}
            </button>
          ))}
        </div>

        {visibles.length === 0 ? (
          <div className="py-16 text-center text-suave">
            <Icono nombre="ovillo" className="mx-auto mb-3 size-14 opacity-50" />
            <p>No hay proyectos aquí todavía.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visibles.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/proyectos/${p.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-borde bg-superficie p-3 active:scale-[0.99]"
                >
                  <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-superficie-2 text-suave">
                    <Icono nombre="ovillo" className="size-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold">{p.nombre}</p>
                    <p className="text-suave">Vuelta {p.vuelta}</p>
                  </div>
                  <Icono nombre="adelante" className="size-6 text-suave" />
                </Link>
              </li>
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
