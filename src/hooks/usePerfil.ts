import { useEffect, useState } from 'react'
import { useUsuario } from './useSesion'
import { useEnLinea } from './useEnLinea'
import { cambiarAvatar, descargarPerfil, guardarNombre, leerPerfilGuardado, type Perfil } from '@/lib/perfil'
import { traducirError } from '@/lib/validacion'

/**
 * Perfil de la persona con sesión. Muestra primero la copia guardada en el
 * teléfono (funciona sin conexión) y, si hay internet, la actualiza del servidor.
 */
export function usePerfil() {
  const usuario = useUsuario()
  const enLinea = useEnLinea()
  const [perfil, setPerfil] = useState<Perfil | null>(() => leerPerfilGuardado(usuario.id))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Descargar el perfil al abrir la pantalla y cada vez que vuelve la conexión
  useEffect(() => {
    if (!enLinea) return
    let vigente = true
    descargarPerfil(usuario.id)
      .then((p) => vigente && setPerfil(p))
      .catch((e) => vigente && setError(traducirError(e)))
    return () => {
      vigente = false
    }
  }, [usuario.id, enLinea])

  /** Ejecuta un cambio mostrando el estado "guardando" y los errores */
  async function ejecutar(accion: () => Promise<Perfil>) {
    setError(null)
    setGuardando(true)
    try {
      setPerfil(await accion())
      return true
    } catch (e) {
      setError(traducirError(e))
      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    perfil,
    correo: usuario.email ?? '',
    guardando,
    error,
    cambiarNombre: (nombre: string) => ejecutar(() => guardarNombre(usuario.id, nombre)),
    cambiarFoto: (archivo: File) => ejecutar(() => cambiarAvatar(usuario.id, archivo)),
  }
}
