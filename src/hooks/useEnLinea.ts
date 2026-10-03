import { useSyncExternalStore } from 'react'

function suscribir(avisar: () => void) {
  window.addEventListener('online', avisar)
  window.addEventListener('offline', avisar)
  return () => {
    window.removeEventListener('online', avisar)
    window.removeEventListener('offline', avisar)
  }
}

/** Indica si el dispositivo tiene conexión a internet (se actualiza solo) */
export function useEnLinea() {
  return useSyncExternalStore(suscribir, () => navigator.onLine)
}
