import Dexie, { type EntityTable, type Table } from 'dexie'

// =====================================================================
// Base de datos local (IndexedDB vía Dexie).
// Todo se guarda primero aquí, así la app funciona sin internet.
// Cada cuenta tiene su propia base ("magdalena-<id de usuario>") para que
// los datos de dos personas en el mismo teléfono nunca se mezclen.
// =====================================================================

export type EstadoProyecto = 'en_curso' | 'terminado'

export interface Proyecto {
  id: string
  nombre: string
  notas: string
  /** Ruta de la foto en Supabase Storage (se llena al sincronizar) */
  rutaFoto: string | null
  estado: EstadoProyecto
  archivado: boolean
  vueltaActual: number
  puntosActuales: number
  /** Corrección manual del tiempo tejido, en segundos (+/-) */
  ajusteTiempoSeg: number
  terminadoEn: string | null
  creadoEn: string
  actualizadoEn: string
  /** Borrado suave: si tiene fecha, el proyecto está eliminado */
  eliminadoEn: string | null
}

export interface VueltaPatron {
  id: string
  proyectoId: string
  numeroVuelta: number
  instruccion: string
  /** Puntos de la vuelta (detectados o escritos a mano); null si se desconoce */
  puntos: number | null
  creadoEn: string
  actualizadoEn: string
  eliminadoEn: string | null
}

export type TipoEvento = 'punto' | 'vuelta' | 'inicio' | 'pausa' | 'fin'

export interface Evento {
  id: string
  proyectoId: string
  tipo: TipoEvento
  /** punto/vuelta: +1, -1 o -N al reiniciar la vuelta. 0 en los demás tipos */
  delta: number
  ocurridoEn: string
}

/** Foto del proyecto guardada en el teléfono (comprimida) */
export interface FotoLocal {
  proyectoId: string
  imagen: Blob
  actualizadoEn: string
}

/** Tablas que se sincronizan con Supabase (nombres de las tablas del servidor) */
export type TablaSincronizable = 'projects' | 'pattern_rows' | 'events' | 'fotos'

/** Cola de cambios hechos en el teléfono que faltan por subir a Supabase */
export interface CambioPendiente {
  tabla: TablaSincronizable
  idFila: string
  creadoEn: string
}

export type BaseMagdalena = Dexie & {
  proyectos: EntityTable<Proyecto, 'id'>
  vueltasPatron: EntityTable<VueltaPatron, 'id'>
  eventos: EntityTable<Evento, 'id'>
  fotos: EntityTable<FotoLocal, 'proyectoId'>
  pendientes: Table<CambioPendiente, [TablaSincronizable, string]>
}

function crearBaseDatos(idUsuario: string): BaseMagdalena {
  const db = new Dexie(`magdalena-${idUsuario}`) as BaseMagdalena
  // Índices: solo los campos por los que se busca u ordena
  db.version(1).stores({
    proyectos: 'id, actualizadoEn',
    vueltasPatron: 'id, [proyectoId+numeroVuelta], actualizadoEn',
    eventos: 'id, [proyectoId+ocurridoEn]',
    fotos: 'proyectoId',
    // Clave compuesta: si una fila cambia varias veces, queda un solo pendiente
    pendientes: '[tabla+idFila], creadoEn',
  })
  return db
}

const abiertas = new Map<string, BaseMagdalena>()

/** Devuelve (y abre si hace falta) la base de datos de una cuenta */
export function obtenerBaseDatos(idUsuario: string): BaseMagdalena {
  let db = abiertas.get(idUsuario)
  if (!db) {
    db = crearBaseDatos(idUsuario)
    abiertas.set(idUsuario, db)
  }
  return db
}
