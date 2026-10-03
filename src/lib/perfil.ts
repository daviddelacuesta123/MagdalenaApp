// Lectura y guardado del perfil (tabla "profiles" + foto en el bucket "avatars").
// Se guarda una copia en el teléfono para mostrar el perfil sin conexión.

import { supabase } from './supabase'
import { blobADataUrl, comprimirImagen } from './imagenes'
import { borrarImagen, descargarImagen, subirImagen } from './almacenamiento'

export interface Perfil {
  nombre: string
  rutaAvatar: string | null
  /** Foto en formato data URL, para verla sin conexión */
  avatar: string | null
}

const PERFIL_VACIO: Perfil = { nombre: '', rutaAvatar: null, avatar: null }
const clave = (idUsuario: string) => `magdalena:perfil:${idUsuario}`

export function leerPerfilGuardado(idUsuario: string): Perfil | null {
  try {
    return JSON.parse(localStorage.getItem(clave(idUsuario)) ?? 'null') as Perfil | null
  } catch {
    return null
  }
}

function guardarPerfilLocal(idUsuario: string, perfil: Perfil) {
  try {
    localStorage.setItem(clave(idUsuario), JSON.stringify(perfil))
  } catch {
    // Sin espacio o sin acceso: el perfil se volverá a descargar la próxima vez
  }
}

export function borrarPerfilGuardado(idUsuario: string) {
  try {
    localStorage.removeItem(clave(idUsuario))
  } catch {
    /* sin acceso a localStorage */
  }
}

/** Descarga el perfil del servidor (y la foto solo si cambió) y actualiza la copia local */
export async function descargarPerfil(idUsuario: string): Promise<Perfil> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, avatar_path')
    .eq('user_id', idUsuario)
    .maybeSingle()
  if (error) throw error

  const anterior = leerPerfilGuardado(idUsuario) ?? PERFIL_VACIO
  const rutaAvatar = data?.avatar_path ?? null
  let avatar = rutaAvatar === anterior.rutaAvatar ? anterior.avatar : null
  if (rutaAvatar && !avatar) {
    avatar = await blobADataUrl(await descargarImagen('avatars', rutaAvatar))
  }

  const perfil: Perfil = { nombre: data?.name ?? '', rutaAvatar, avatar }
  guardarPerfilLocal(idUsuario, perfil)
  return perfil
}

export async function guardarNombre(idUsuario: string, nombre: string): Promise<Perfil> {
  const limpio = nombre.trim().slice(0, 80)
  const { error } = await supabase
    .from('profiles')
    .update({ name: limpio, updated_at: new Date().toISOString() })
    .eq('user_id', idUsuario)
  if (error) throw error

  const perfil = { ...(leerPerfilGuardado(idUsuario) ?? PERFIL_VACIO), nombre: limpio }
  guardarPerfilLocal(idUsuario, perfil)
  return perfil
}

/** Comprime la foto, la sube, la asigna al perfil y borra la foto anterior */
export async function cambiarAvatar(idUsuario: string, archivo: File): Promise<Perfil> {
  // 512 px es suficiente para una foto de perfil y pesa poco para guardarla offline
  const imagen = await comprimirImagen(archivo, { ladoMaximo: 512, calidad: 0.85 })
  const rutaNueva = await subirImagen('avatars', idUsuario, imagen, 'avatar')

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_path: rutaNueva, updated_at: new Date().toISOString() })
    .eq('user_id', idUsuario)
  if (error) {
    await borrarImagen('avatars', rutaNueva)
    throw error
  }

  const anterior = leerPerfilGuardado(idUsuario) ?? PERFIL_VACIO
  if (anterior.rutaAvatar) await borrarImagen('avatars', anterior.rutaAvatar)

  const perfil: Perfil = { ...anterior, rutaAvatar: rutaNueva, avatar: await blobADataUrl(imagen) }
  guardarPerfilLocal(idUsuario, perfil)
  return perfil
}
