import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { Boton } from '@/components/Boton'
import { AreaTexto, CampoTexto } from '@/components/CampoTexto'
import { Icono } from '@/components/Icono'

/**
 * Pantalla 5: Crear / editar proyecto.
 * Si la ruta tiene :id es edición; si no, es un proyecto nuevo.
 * FASE 1: solo formulario. FASE 3: guardado en Dexie.
 */
export function PaginaFormularioProyecto() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const navegar = useNavigate()
  const volverA = esEdicion ? `/proyectos/${id}` : '/'

  function guardar(e: FormEvent) {
    e.preventDefault()
    navegar(volverA) // Temporal hasta la Fase 3
  }

  return (
    <>
      <EncabezadoPagina titulo={esEdicion ? 'Editar proyecto' : 'Nuevo proyecto'} volverA={volverA} />

      <form onSubmit={guardar} className="mx-auto max-w-2xl space-y-5 px-4 pt-4">
        <CampoTexto etiqueta="Nombre" placeholder="Ej.: Amigurumi de conejo" required />

        <div>
          <p className="mb-1.5 font-semibold">Foto (opcional)</p>
          <button
            type="button"
            className="grid aspect-[4/3] w-full place-items-center rounded-2xl border-2 border-dashed border-borde bg-superficie text-suave"
          >
            <span className="flex flex-col items-center gap-2">
              <Icono nombre="camara" className="size-10" />
              Añadir foto
            </span>
          </button>
        </div>

        <AreaTexto etiqueta="Notas" placeholder="Hilo, aguja, cambios de color…" />

        <Boton type="submit" tamano="grande" className="w-full">
          {esEdicion ? 'Guardar cambios' : 'Crear proyecto'}
        </Boton>
      </form>
    </>
  )
}
