// Vibración corta al tocar los botones del contador.
// navigator.vibrate existe en Android; en iPhone no hay soporte y simplemente no vibra.

export const VIBRACION = {
  /** Toque corto: sumar o restar punto */
  punto: 15,
  /** Doble pulso: cambio de vuelta (se nota distinto sin mirar la pantalla) */
  vuelta: [30, 60, 30],
} as const

export function vibrar(patron: number | readonly number[]) {
  try {
    navigator.vibrate?.(patron as number | number[])
  } catch {
    // Algunos navegadores lanzan error si no hubo interacción previa: se ignora
  }
}
