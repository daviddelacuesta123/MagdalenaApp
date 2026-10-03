// Operaciones sobre proyectos. Cada cambio se guarda en la base local y se
// anota en "pendientes" para subirlo a Supabase cuando haya conexión (Fase 5).

import { ahora, nuevoId } from '@/lib/id'
import type { BaseMagdalena, Proyecto, TablaSincronizable } from './baseDatos'

/** Anota que una fila cambió y hay que sincronizarla */
export function marcarPendiente(db: BaseMagdalena, tabla: TablaSincronizable, idFila: string) {
  return db.pendientes.put({ tabla, idFila, creadoEn: ahora() })
}

/** Campos que se pueden editar desde el formulario */
export interface DatosProyecto {
  nombre: string
  notas: string
}

/**
 * Cambio de foto en el formulario:
 * undefined = no tocar, Blob = foto nueva (ya comprimida), null = quitar la foto
 */
export type CambioFoto = Blob | null | undefined

async function aplicarFoto(db: BaseMagdalena, proyectoId: string, foto: CambioFoto, momento: string) {
  if (foto === undefined) return
  if (foto) {
    await db.fotos.put({ proyectoId, imagen: foto, actualizadoEn: momento })
  } else {
    await db.fotos.delete(proyectoId)
  }
  await marcarPendiente(db, 'fotos', proyectoId)
}

export async function crearProyecto(db: BaseMagdalena, datos: DatosProyecto, foto: CambioFoto): Promise<string> {
  const id = nuevoId()
  const momento = ahora()
  const proyecto: Proyecto = {
    id,
    nombre: datos.nombre.trim(),
    notas: datos.notas.trim(),
    rutaFoto: null,
    estado: 'en_curso',
    archivado: false,
    vueltaActual: 1,
    puntosActuales: 0,
    ajusteTiempoSeg: 0,
    terminadoEn: null,
    creadoEn: momento,
    actualizadoEn: momento,
    eliminadoEn: null,
  }
  await db.transaction('rw', [db.proyectos, db.fotos, db.pendientes], async () => {
    await db.proyectos.add(proyecto)
    await marcarPendiente(db, 'projects', id)
    await aplicarFoto(db, id, foto, momento)
  })
  return id
}

/** Cambia campos de un proyecto y actualiza su fecha de modificación */
export async function actualizarProyecto(db: BaseMagdalena, id: string, cambios: Partial<Proyecto>) {
  await db.transaction('rw', [db.proyectos, db.pendientes], async () => {
    await db.proyectos.update(id, { ...cambios, actualizadoEn: ahora() })
    await marcarPendiente(db, 'projects', id)
  })
}

export async function editarProyecto(db: BaseMagdalena, id: string, datos: DatosProyecto, foto: CambioFoto) {
  const momento = ahora()
  await db.transaction('rw', [db.proyectos, db.fotos, db.pendientes], async () => {
    await db.proyectos.update(id, { nombre: datos.nombre.trim(), notas: datos.notas.trim(), actualizadoEn: momento })
    await marcarPendiente(db, 'projects', id)
    await aplicarFoto(db, id, foto, momento)
  })
}

export function marcarTerminado(db: BaseMagdalena, id: string, terminado: boolean) {
  return actualizarProyecto(db, id, {
    estado: terminado ? 'terminado' : 'en_curso',
    terminadoEn: terminado ? ahora() : null,
  })
}

export function archivarProyecto(db: BaseMagdalena, id: string, archivado: boolean) {
  return actualizarProyecto(db, id, { archivado })
}

/** Borrado suave: el proyecto se marca como eliminado (así el borrado también se sincroniza) */
export async function eliminarProyecto(db: BaseMagdalena, id: string) {
  await db.transaction('rw', [db.proyectos, db.fotos, db.pendientes], async () => {
    await db.proyectos.update(id, { eliminadoEn: ahora(), actualizadoEn: ahora() })
    await marcarPendiente(db, 'projects', id)
    await db.fotos.delete(id)
  })
}
