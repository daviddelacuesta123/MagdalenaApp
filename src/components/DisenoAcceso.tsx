import type { ReactNode } from 'react'
import { Icono } from './Icono'

/** Estructura común de las pantallas de acceso: logo arriba y contenido centrado */
export function DisenoAcceso({ subtitulo, children }: { subtitulo: string; children: ReactNode }) {
  return (
    <main className="pt-seguro pb-seguro mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 grid size-20 place-items-center rounded-full bg-primario text-sobre-primario">
          <Icono nombre="ovillo" className="size-12" />
        </div>
        <h1 className="text-3xl font-bold">Magdalena</h1>
        <p className="text-suave">{subtitulo}</p>
      </div>
      {children}
    </main>
  )
}
