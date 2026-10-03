import { useState } from 'react'
import { useParams } from 'react-router'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { Boton } from '@/components/Boton'
import { Icono } from '@/components/Icono'

/**
 * Pantalla 3: Contador de vueltas y puntos (pantalla completa, sin barra inferior).
 * FASE 1: maqueta con estado en memoria, para probar el tamaño de los botones.
 * FASE 3: guardado en Dexie, vibración, pantalla siempre encendida y confirmación al reiniciar.
 */
export function PaginaContador() {
  const { id } = useParams()
  const [vuelta, setVuelta] = useState(1)
  const [puntos, setPuntos] = useState(0)

  return (
    <div className="flex min-h-dvh flex-col">
      <EncabezadoPagina titulo="Proyecto de ejemplo" volverA={`/proyectos/${id}`} />

      <main className="pb-seguro mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-4">
        {/* Instrucción del patrón (Fase 4) */}
        <p className="rounded-2xl bg-superficie-2 p-4 text-lg">
          <span className="font-semibold">V{vuelta}:</span> aquí aparecerá la instrucción del patrón.
        </p>

        {/* Vuelta actual en grande */}
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-xl font-semibold text-suave">Vuelta</p>
          <p className="text-8xl leading-none font-bold tabular-nums sm:text-9xl" aria-live="polite">
            {vuelta}
          </p>
          <p className="mt-4 text-3xl font-semibold tabular-nums">
            {puntos} <span className="text-xl text-suave">puntos</span>
          </p>
        </section>

        {/* Puntos: botones enormes */}
        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <Boton
            variante="secundario"
            className="min-h-24 text-xl"
            onClick={() => setPuntos((p) => Math.max(0, p - 1))}
            aria-label="Restar punto"
          >
            <Icono nombre="menos" className="size-9" />
          </Boton>
          <Boton className="min-h-24 text-xl" onClick={() => setPuntos((p) => p + 1)} aria-label="Sumar punto">
            <Icono nombre="mas" className="size-9" /> Punto
          </Boton>
        </div>

        {/* Vueltas */}
        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <Boton
            variante="secundario"
            tamano="grande"
            onClick={() => {
              setVuelta((v) => Math.max(1, v - 1))
              setPuntos(0)
            }}
          >
            <Icono nombre="atras" /> Anterior
          </Boton>
          <Boton
            variante="secundario"
            tamano="grande"
            className="border-acento"
            onClick={() => {
              setVuelta((v) => v + 1)
              setPuntos(0)
            }}
          >
            Siguiente vuelta <Icono nombre="adelante" />
          </Boton>
        </div>

        <Boton variante="fantasma" onClick={() => setPuntos(0)} className="text-suave">
          <Icono nombre="reiniciar" className="size-5" /> Reiniciar vuelta
        </Boton>
      </main>
    </div>
  )
}
