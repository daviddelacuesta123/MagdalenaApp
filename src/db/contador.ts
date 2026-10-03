// Acciones del contador. Cada toque se guarda al instante en la base local
// y queda registrado como evento (para las estadísticas de la Fase 4).

import { ahora, nuevoId } from '@/lib/id'
import type { BaseMagdalena, Proyecto, TipoEvento } from './baseDatos'
import { marcarPendiente } from './proyectos'

type Cambio = Pick<Proyecto, 'vueltaActual' | 'puntosActuales'>

/**
 * Lee el proyecto, calcula el nuevo estado y guarda proyecto + evento en una
 * sola transacción (así no se pierden toques aunque se pulse muy rápido).
 * Si `calcular` devuelve null, no se hace nada (p. ej. restar con 0 puntos).
 */
async function aplicar(
  db: BaseMagdalena,
  proyectoId: string,
  tipo: Extract<TipoEvento, 'punto' | 'vuelta'>,
  calcular: (p: Proyecto) => Cambio | null,
) {
  await db.transaction('rw', [db.proyectos, db.eventos, db.pendientes], async () => {
    const proyecto = await db.proyectos.get(proyectoId)
    if (!proyecto) return
    const nuevo = calcular(proyecto)
    if (!nuevo) return

    const delta =
      tipo === 'vuelta'
        ? nuevo.vueltaActual - proyecto.vueltaActual
        : nuevo.puntosActuales - proyecto.puntosActuales
    const momento = ahora()

    await db.proyectos.update(proyectoId, { ...nuevo, actualizadoEn: momento })
    await marcarPendiente(db, 'projects', proyectoId)

    const idEvento = nuevoId()
    await db.eventos.add({ id: idEvento, proyectoId, tipo, delta, ocurridoEn: momento })
    await marcarPendiente(db, 'events', idEvento)
  })
}

export const sumarPunto = (db: BaseMagdalena, id: string) =>
  aplicar(db, id, 'punto', (p) => ({ vueltaActual: p.vueltaActual, puntosActuales: p.puntosActuales + 1 }))

export const restarPunto = (db: BaseMagdalena, id: string) =>
  aplicar(db, id, 'punto', (p) =>
    p.puntosActuales > 0 ? { vueltaActual: p.vueltaActual, puntosActuales: p.puntosActuales - 1 } : null,
  )

/** Pasa a la vuelta siguiente; los puntos empiezan de nuevo en 0 */
export const siguienteVuelta = (db: BaseMagdalena, id: string) =>
  aplicar(db, id, 'vuelta', (p) => ({ vueltaActual: p.vueltaActual + 1, puntosActuales: 0 }))

/** Vuelve a la vuelta anterior; los puntos empiezan en 0 */
export const vueltaAnterior = (db: BaseMagdalena, id: string) =>
  aplicar(db, id, 'vuelta', (p) => (p.vueltaActual > 1 ? { vueltaActual: p.vueltaActual - 1, puntosActuales: 0 } : null))

/** Pone en 0 los puntos de la vuelta actual (el evento guarda -N) */
export const reiniciarVuelta = (db: BaseMagdalena, id: string) =>
  aplicar(db, id, 'punto', (p) => (p.puntosActuales > 0 ? { vueltaActual: p.vueltaActual, puntosActuales: 0 } : null))
