import { useEffect } from 'react'
import NoSleep from 'nosleep.js'

/**
 * Evita que la pantalla se apague mientras el componente está abierto.
 * 1. Usa la Screen Wake Lock API si existe (Chrome/Android, Safari 16.4+).
 * 2. Si no existe, usa NoSleep: un video invisible en bucle que mantiene la
 *    pantalla encendida. Los navegadores solo dejan reproducirlo tras un toque,
 *    así que se activa con el primer toque en la pantalla.
 */
export function useMantenerPantallaEncendida() {
  useEffect(() => {
    let candado: WakeLockSentinel | null = null
    let respaldo: NoSleep | null = null
    let terminado = false

    async function pedirCandado() {
      if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return
      try {
        const nuevo = await navigator.wakeLock.request('screen')
        if (terminado) await nuevo.release()
        else candado = nuevo
      } catch {
        // Puede fallar si la batería está en modo ahorro: no es grave
      }
    }

    function activarRespaldo() {
      if (terminado || respaldo) return
      respaldo = new NoSleep()
      respaldo.enable().catch(() => {
        respaldo = null
      })
    }

    // El sistema suelta el candado al cambiar de app: lo pedimos de nuevo al volver
    function alCambiarVisibilidad() {
      if (document.visibilityState === 'visible' && (!candado || candado.released)) void pedirCandado()
    }

    if ('wakeLock' in navigator) {
      void pedirCandado()
      document.addEventListener('visibilitychange', alCambiarVisibilidad)
    } else {
      document.addEventListener('pointerdown', activarRespaldo, { once: true })
    }

    return () => {
      terminado = true
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
      document.removeEventListener('pointerdown', activarRespaldo)
      void candado?.release().catch(() => {})
      respaldo?.disable()
    }
  }, [])
}
