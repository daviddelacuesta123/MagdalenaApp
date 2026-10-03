import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, CLAVE_SESION } from '@/lib/supabase'
import { borrarPerfilGuardado } from '@/lib/perfil'

interface ContextoSesion {
  /** Persona con sesión iniciada (null si no hay sesión) */
  usuario: User | null
  /** true mientras se comprueba si hay sesión al abrir la app */
  cargando: boolean
  cerrarSesion: () => Promise<void>
}

const Contexto = createContext<ContextoSesion | null>(null)

/**
 * Lee la sesión guardada directamente de localStorage.
 * Sin internet, Supabase no puede renovar una sesión vencida y al arrancar
 * puede devolver "sin sesión", aunque la sesión sigue guardada en el teléfono.
 * En ese caso usamos la persona guardada para que la app funcione offline;
 * Supabase renovará la sesión solo cuando vuelva la conexión.
 */
function leerUsuarioGuardado(): User | null {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_SESION) ?? 'null') as { user?: User } | null
    return guardado?.user?.id ? guardado.user : null
  } catch {
    return null
  }
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Importante: no llamar a otras funciones de Supabase dentro de este callback
    // (puede bloquearse); aquí solo se actualiza el estado.
    const { data } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (evento === 'INITIAL_SESSION') {
        setUsuario(sesion?.user ?? leerUsuarioGuardado())
        setCargando(false)
      } else if (evento === 'SIGNED_OUT') {
        setUsuario(null)
      } else if (sesion?.user) {
        // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY
        setUsuario(sesion.user)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function cerrarSesion() {
    const id = usuario?.id
    // scope "local": cierra la sesión en este dispositivo (funciona también sin conexión)
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
    // Por si no había conexión para avisar al servidor, borramos la sesión local igualmente
    try {
      localStorage.removeItem(CLAVE_SESION)
      localStorage.removeItem(`${CLAVE_SESION}-user`)
    } catch {
      /* sin acceso a localStorage */
    }
    if (id) borrarPerfilGuardado(id)
    setUsuario(null)
  }

  return (
    <Contexto.Provider value={{ usuario, cargando, cerrarSesion }}>
      {children}
    </Contexto.Provider>
  )
}

export function useSesion() {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useSesion debe usarse dentro de <ProveedorSesion>')
  return contexto
}

/** Igual que useSesion, pero garantiza que hay usuario (usar solo dentro de rutas protegidas) */
export function useUsuario(): User {
  const { usuario } = useSesion()
  if (!usuario) throw new Error('useUsuario requiere una sesión iniciada')
  return usuario
}
