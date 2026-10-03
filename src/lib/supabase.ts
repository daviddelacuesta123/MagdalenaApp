import { createClient } from '@supabase/supabase-js'

// Las claves vienen del archivo .env (nunca se escriben en el código).
// Ver .env.example para saber qué variables hacen falta.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const claveAnonima = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !claveAnonima) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example como .env y complétalo.',
  )
}

/** Clave con la que se guarda la sesión en localStorage (la usa useSesion para el modo sin conexión) */
export const CLAVE_SESION = 'magdalena-auth'

export const supabase = createClient(url, claveAnonima, {
  auth: {
    storageKey: CLAVE_SESION,
    persistSession: true,
    autoRefreshToken: true,
    // Lee el token que llega en la URL al abrir el enlace de "recuperar contraseña"
    detectSessionInUrl: true,
    // "implicit" permite abrir el enlace del correo en un dispositivo distinto
    // al que pidió la recuperación (con "pkce" solo funcionaría en el mismo)
    flowType: 'implicit',
  },
})
