import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { Icono } from '@/components/Icono'
import { Boton, clasesBoton } from '@/components/Boton'
import { Aviso } from '@/components/Aviso'
import { Dialogo } from '@/components/Dialogo'
import { useBaseDatos, useFotoProyecto, useProyecto } from '@/hooks/useProyectos'
import { archivarProyecto, eliminarProyecto, marcarTerminado } from '@/db/proyectos'

const formatoFecha = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' })

/** Pantalla 4: Detalle del proyecto (foto, progreso, notas y acciones) */
export function PaginaDetalleProyecto() {
  const { id } = useParams()
  const db = useBaseDatos()
  const navegar = useNavigate()
  const proyecto = useProyecto(id)
  const foto = useFotoProyecto(id)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)

  if (proyecto === undefined) return <EncabezadoPagina titulo="" volverA="/" />
  if (proyecto === null) {
    return (
      <>
        <EncabezadoPagina titulo="Proyecto" volverA="/" />
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <Aviso tipo="error">No encontramos este proyecto. Puede que se haya eliminado.</Aviso>
        </div>
      </>
    )
  }

  const terminado = proyecto.estado === 'terminado'

  async function eliminar() {
    setConfirmarEliminar(false)
    await eliminarProyecto(db, proyecto!.id)
    navegar('/', { replace: true })
  }

  return (
    <>
      <EncabezadoPagina
        titulo={proyecto.nombre}
        volverA="/"
        acciones={
          <Link
            to={`/proyectos/${proyecto.id}/editar`}
            className="grid size-12 place-items-center rounded-full hover:bg-superficie-2"
            aria-label="Editar proyecto"
          >
            <Icono nombre="editar" />
          </Link>
        }
      />

      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        {foto && <img src={foto} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />}

        {/* Etiquetas de estado */}
        {(terminado || proyecto.archivado) && (
          <div className="flex flex-wrap gap-2">
            {terminado && (
              <span className="rounded-full bg-primario/15 px-3 py-1 font-semibold">
                Terminado{proyecto.terminadoEn && ` el ${formatoFecha.format(new Date(proyecto.terminadoEn))}`}
              </span>
            )}
            {proyecto.archivado && (
              <span className="rounded-full bg-superficie-2 px-3 py-1 font-semibold text-suave">Archivado</span>
            )}
          </div>
        )}

        {/* Progreso y botón principal */}
        <Link to={`/proyectos/${proyecto.id}/contador`} className={clasesBoton('primario', 'grande', 'w-full py-3')}>
          <Icono nombre="contador" className="size-7" />
          <span className="flex flex-col items-start leading-tight">
            <span>Abrir contador</span>
            <span className="text-sm font-normal opacity-90">
              Vuelta {proyecto.vueltaActual} · {proyecto.puntosActuales} puntos
            </span>
          </span>
        </Link>

        <Seccion titulo="Notas">
          {proyecto.notas ? (
            <p className="whitespace-pre-wrap">{proyecto.notas}</p>
          ) : (
            <p className="text-suave">
              Sin notas.{' '}
              <Link to={`/proyectos/${proyecto.id}/editar`} className="font-semibold text-primario">
                Añadir
              </Link>
            </p>
          )}
        </Seccion>

        <Seccion titulo="Patrón">
          <p className="text-suave">Próximamente podrás pegar aquí el patrón por vueltas.</p>
        </Seccion>

        <Seccion titulo="Estadísticas">
          <p className="text-suave">Próximamente: tiempo tejido, vueltas y puntos.</p>
        </Seccion>

        {/* Acciones */}
        <section className="space-y-2 pb-4">
          <Boton variante="secundario" className="w-full" onClick={() => marcarTerminado(db, proyecto.id, !terminado)}>
            {terminado ? 'Volver a "En curso"' : '¡Marcar como terminado!'}
          </Boton>
          <Boton
            variante="secundario"
            className="w-full"
            onClick={() => archivarProyecto(db, proyecto.id, !proyecto.archivado)}
          >
            {proyecto.archivado ? 'Sacar del archivo' : 'Archivar'}
          </Boton>
          <Boton variante="peligro" className="w-full" onClick={() => setConfirmarEliminar(true)}>
            Eliminar proyecto
          </Boton>
          <p className="pt-2 text-center text-sm text-suave">
            Creado el {formatoFecha.format(new Date(proyecto.creadoEn))}
          </p>
        </section>
      </div>

      <Dialogo
        abierto={confirmarEliminar}
        titulo="¿Eliminar este proyecto?"
        mensaje={`Se borrará "${proyecto.nombre}" con su progreso y su foto. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        peligroso
        alConfirmar={eliminar}
        alCancelar={() => setConfirmarEliminar(false)}
      />
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
