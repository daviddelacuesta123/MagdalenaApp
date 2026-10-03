// Subida y descarga de fotos en Supabase Storage.
// Los buckets son privados: cada archivo vive en "<user_id>/<nombre>" y las
// políticas de Storage solo dejan acceder a la carpeta propia.

import { supabase } from './supabase'

export type Bucket = 'avatars' | 'project-photos'

/**
 * Sube una imagen (ya comprimida) y devuelve su ruta dentro del bucket.
 * El nombre lleva la fecha para que, al cambiar la foto, no se muestre la anterior desde caché.
 */
export async function subirImagen(bucket: Bucket, idUsuario: string, imagen: Blob, prefijo: string) {
  const ruta = `${idUsuario}/${prefijo}-${Date.now()}.jpg`
  const { error } = await supabase.storage.from(bucket).upload(ruta, imagen, {
    contentType: 'image/jpeg',
    cacheControl: '31536000', // el archivo nunca cambia: se puede guardar en caché un año
    upsert: false,
  })
  if (error) throw error
  return ruta
}

/** Descarga una imagen privada como Blob */
export async function descargarImagen(bucket: Bucket, ruta: string) {
  const { data, error } = await supabase.storage.from(bucket).download(ruta)
  if (error) throw error
  return data
}

/** Borra un archivo. Si falla no es grave (queda un archivo huérfano), así que no lanza error. */
export async function borrarImagen(bucket: Bucket, ruta: string) {
  const { error } = await supabase.storage.from(bucket).remove([ruta])
  if (error) console.warn('No se pudo borrar la imagen anterior', ruta, error)
}
