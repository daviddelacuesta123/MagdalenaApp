import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { obtenerBaseDatos } from '@/db/baseDatos'
import { useUsuario } from './useSesion'

/** Base de datos local de la persona con sesión */
export function useBaseDatos() {
  return obtenerBaseDatos(useUsuario().id)
}

/**
 * Lista de proyectos (sin los eliminados), del más reciente al más antiguo.
 * Se actualiza sola cuando cambia la base local.
 * Devuelve undefined mientras carga.
 */
export function useProyectos() {
  const db = useBaseDatos()
  return useLiveQuery(
    () =>
      db.proyectos
        .orderBy('actualizadoEn')
        .reverse()
        .filter((p) => !p.eliminadoEn)
        .toArray(),
    [db],
  )
}

/** Un proyecto. undefined = cargando, null = no existe o fue eliminado */
export function useProyecto(id: string | undefined) {
  const db = useBaseDatos()
  return useLiveQuery(
    async () => {
      if (!id) return null
      const p = await db.proyectos.get(id)
      return p && !p.eliminadoEn ? p : null
    },
    [db, id],
  )
}

/** Convierte un Blob en una URL temporal para <img> y la libera al dejar de usarse */
export function useUrlImagen(imagen: Blob | null | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!imagen) {
      setUrl(null)
      return
    }
    const nueva = URL.createObjectURL(imagen)
    setUrl(nueva)
    return () => URL.revokeObjectURL(nueva)
  }, [imagen])
  return url
}

/** URL de la foto de un proyecto guardada en el teléfono (null si no tiene) */
export function useFotoProyecto(proyectoId: string | undefined) {
  const db = useBaseDatos()
  const foto = useLiveQuery(
    () => (proyectoId ? db.fotos.get(proyectoId) : undefined),
    [db, proyectoId],
  )
  return useUrlImagen(foto?.imagen)
}
