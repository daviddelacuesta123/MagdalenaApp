import { useState } from 'react'
import { useParams } from 'react-router'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { Boton } from '@/components/Boton'
import { Aviso } from '@/components/Aviso'
import { Dialogo } from '@/components/Dialogo'
import { Icono } from '@/components/Icono'
import { useBaseDatos, useProyecto } from '@/hooks/useProyectos'
import { useMantenerPantallaEncendida } from '@/hooks/useMantenerPantallaEncendida'
import { reiniciarVuelta, restarPunto, siguienteVuelta, sumarPunto, vueltaAnterior } from '@/db/contador'
import { vibrar, VIBRACION } from '@/lib/vibrar'
import type { BaseMagdalena } from '@/db/baseDatos'

/**
 * Pantalla 3: Contador de vueltas y puntos (pantalla completa, sin barra inferior).
 * Cada toque se guarda al instante en el teléfono. La pantalla no se apaga mientras está abierto.
 */
export function PaginaContador() {
  const { id } = useParams()
  const db = useBaseDatos()
  const proyecto = useProyecto(id)
  const [confirmarReinicio, setConfirmarReinicio] = useState(false)
  useMantenerPantallaEncendida()

  if (proyecto === undefined) return null
  if (proyecto === null) {
    return (
      <>
        <EncabezadoPagina titulo="Contador" volverA="/" />
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <Aviso tipo="error">No encontramos este proyecto.</Aviso>
        </div>
      </>
    )
  }

  /** Ejecuta una acción del contador con vibración */
  function tocar(accion: (db: BaseMagdalena, id: string) => Promise<void>, patron: number | readonly number[]) {
    vibrar(patron)
    void accion(db, proyecto!.id)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <EncabezadoPagina titulo={proyecto.nombre} volverA={`/proyectos/${proyecto.id}`} />

      <main className="pb-seguro mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 px-4 pt-3">
        {/* Vuelta actual en grande */}
        <section className="flex flex-1 flex-col items-center justify-center py-2 text-center">
          <p className="text-xl font-semibold text-suave">Vuelta</p>
          <p className="text-8xl leading-none font-bold tabular-nums sm:text-9xl" aria-live="polite">
            {proyecto.vueltaActual}
          </p>
          <p className="mt-4 text-4xl font-semibold tabular-nums" aria-live="polite">
            {proyecto.puntosActuales} <span className="text-xl text-suave">puntos</span>
          </p>
        </section>

        {/* Puntos: botones enormes; "+" ocupa el doble porque es el que más se usa */}
        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <Boton
            variante="secundario"
            tamano="enorme"
            onClick={() => tocar(restarPunto, VIBRACION.punto)}
            disabled={proyecto.puntosActuales === 0}
            aria-label="Restar punto"
          >
            <Icono nombre="menos" className="size-10" />
          </Boton>
          <Boton tamano="enorme" onClick={() => tocar(sumarPunto, VIBRACION.punto)} aria-label="Sumar punto">
            <Icono nombre="mas" className="size-10" /> Punto
          </Boton>
        </div>

        {/* Vueltas */}
        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <Boton
            variante="secundario"
            tamano="contador"
            onClick={() => tocar(vueltaAnterior, VIBRACION.vuelta)}
            disabled={proyecto.vueltaActual <= 1}
            aria-label="Vuelta anterior"
          >
            <Icono nombre="atras" /> Anterior
          </Boton>
          <Boton
            variante="acento"
            tamano="contador"
            onClick={() => tocar(siguienteVuelta, VIBRACION.vuelta)}
          >
            Siguiente vuelta <Icono nombre="adelante" />
          </Boton>
        </div>

        <Boton
          variante="fantasma"
          className="text-suave!"
          onClick={() => setConfirmarReinicio(true)}
          disabled={proyecto.puntosActuales === 0}
        >
          <Icono nombre="reiniciar" className="size-5" /> Reiniciar vuelta
        </Boton>
      </main>

      <Dialogo
        abierto={confirmarReinicio}
        titulo="¿Reiniciar la vuelta?"
        mensaje={`Los ${proyecto.puntosActuales} puntos de la vuelta ${proyecto.vueltaActual} volverán a 0.`}
        textoConfirmar="Reiniciar"
        peligroso
        alConfirmar={() => {
          setConfirmarReinicio(false)
          tocar(reiniciarVuelta, VIBRACION.vuelta)
        }}
        alCancelar={() => setConfirmarReinicio(false)}
      />
    </div>
  )
}
