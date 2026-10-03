import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { obtenerBaseDatos, type BaseMagdalena } from './baseDatos'
import { crearProyecto, eliminarProyecto, marcarTerminado } from './proyectos'
import { reiniciarVuelta, restarPunto, siguienteVuelta, sumarPunto, vueltaAnterior } from './contador'

let db: BaseMagdalena
let id: string

beforeEach(async () => {
  // Una base nueva por prueba
  db = obtenerBaseDatos(`prueba-${Math.random()}`)
  id = await crearProyecto(db, { nombre: '  Conejo  ', notas: '' }, undefined)
})

describe('proyectos', () => {
  it('crea el proyecto en la vuelta 1 y lo deja pendiente de sincronizar', async () => {
    const p = await db.proyectos.get(id)
    expect(p).toMatchObject({ nombre: 'Conejo', vueltaActual: 1, puntosActuales: 0, estado: 'en_curso', archivado: false })
    expect(await db.pendientes.get(['projects', id])).toBeTruthy()
  })

  it('marca terminado con fecha y vuelve a en curso', async () => {
    await marcarTerminado(db, id, true)
    expect(await db.proyectos.get(id)).toMatchObject({ estado: 'terminado', terminadoEn: expect.any(String) })
    await marcarTerminado(db, id, false)
    expect(await db.proyectos.get(id)).toMatchObject({ estado: 'en_curso', terminadoEn: null })
  })

  it('eliminar es un borrado suave', async () => {
    await eliminarProyecto(db, id)
    expect((await db.proyectos.get(id))?.eliminadoEn).toEqual(expect.any(String))
  })
})

describe('contador', () => {
  it('no pierde toques aunque se pulse muy rápido', async () => {
    await Promise.all(Array.from({ length: 50 }, () => sumarPunto(db, id)))
    expect((await db.proyectos.get(id))?.puntosActuales).toBe(50)
    expect(await db.eventos.count()).toBe(50)
  })

  it('restar no baja de 0 ni registra evento', async () => {
    await restarPunto(db, id)
    expect((await db.proyectos.get(id))?.puntosActuales).toBe(0)
    expect(await db.eventos.count()).toBe(0)
  })

  it('siguiente vuelta suma 1 y pone los puntos en 0', async () => {
    await sumarPunto(db, id)
    await sumarPunto(db, id)
    await siguienteVuelta(db, id)
    expect(await db.proyectos.get(id)).toMatchObject({ vueltaActual: 2, puntosActuales: 0 })
    const vueltas = (await db.eventos.toArray()).filter((e) => e.tipo === 'vuelta')
    expect(vueltas).toEqual([expect.objectContaining({ delta: 1 })])
  })

  it('vuelta anterior no baja de 1', async () => {
    await vueltaAnterior(db, id)
    expect((await db.proyectos.get(id))?.vueltaActual).toBe(1)
    await siguienteVuelta(db, id)
    await vueltaAnterior(db, id)
    expect((await db.proyectos.get(id))?.vueltaActual).toBe(1)
  })

  it('reiniciar vuelta registra -N para que las estadísticas cuadren', async () => {
    for (let i = 0; i < 7; i++) await sumarPunto(db, id)
    await reiniciarVuelta(db, id)
    expect((await db.proyectos.get(id))?.puntosActuales).toBe(0)
    const suma = (await db.eventos.toArray()).filter((e) => e.tipo === 'punto').reduce((s, e) => s + e.delta, 0)
    expect(suma).toBe(0)
  })

  it('cada evento queda pendiente de sincronizar', async () => {
    await sumarPunto(db, id)
    const [evento] = await db.eventos.toArray()
    expect(await db.pendientes.get(['events', evento.id])).toBeTruthy()
  })
})
