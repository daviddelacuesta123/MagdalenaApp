/**
 * Genera un identificador único (UUID v4) en el teléfono.
 * crypto.randomUUID solo existe en páginas seguras (HTTPS o localhost);
 * al probar por la red local (http://192.168…) usamos getRandomValues, que siempre existe.
 */
export function nuevoId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40 // versión 4
  b[8] = (b[8] & 0x3f) | 0x80 // variante RFC 4122
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

/** Fecha y hora actual en formato ISO (UTC), el mismo que usa Supabase */
export const ahora = () => new Date().toISOString()
