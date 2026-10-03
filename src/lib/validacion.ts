// Validaciones de formularios y traducción de errores de Supabase Auth al español

/** Devuelve un mensaje de error o null si el correo es válido */
export function validarCorreo(correo: string): string | null {
  const limpio = correo.trim()
  if (!limpio) return 'Escribe tu correo.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpio)) return 'Ese correo no parece válido.'
  return null
}

/**
 * Regla de contraseña (la misma está configurada en el servidor de Supabase):
 * mínimo 8 caracteres, con al menos una letra y un número.
 */
export function validarContrasenaNueva(contrasena: string): string | null {
  if (contrasena.length < 8) return 'Debe tener al menos 8 caracteres.'
  if (!/[A-Za-z]/.test(contrasena)) return 'Debe tener al menos una letra.'
  if (!/\d/.test(contrasena)) return 'Debe tener al menos un número.'
  return null
}

const MENSAJES: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Confirma tu correo antes de entrar. Revisa tu bandeja de entrada.',
  user_already_exists: 'Ya existe una cuenta con ese correo. Prueba a entrar.',
  email_exists: 'Ya existe una cuenta con ese correo. Prueba a entrar.',
  weak_password: 'La contraseña es muy débil: usa mínimo 8 caracteres con letras y números.',
  same_password: 'La nueva contraseña debe ser distinta de la anterior.',
  email_address_invalid: 'Ese correo no es válido.',
  over_email_send_rate_limit: 'Se enviaron demasiados correos. Espera unos minutos e inténtalo de nuevo.',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  email_address_not_authorized:
    'Por ahora el envío de correos solo funciona con correos autorizados (falta configurar el servicio de correo).',
  session_not_found: 'Tu sesión venció. Vuelve a pedir el enlace.',
  otp_expired: 'El enlace venció o ya se usó. Pide uno nuevo.',
}

/** Error cuyo mensaje ya está escrito en español para mostrarse tal cual */
export class ErrorAmable extends Error {}

/** Convierte cualquier error (de Supabase o propio) en un mensaje amable en español */
export function traducirError(error: unknown): string {
  if (error instanceof ErrorAmable) return error.message
  const e = error as { code?: string; name?: string; status?: number; message?: string } | null
  if (!navigator.onLine || e?.name === 'AuthRetryableFetchError' || e?.status === 0) {
    return 'No hay conexión a internet. Inténtalo cuando vuelvas a tener señal.'
  }
  if (e?.code && MENSAJES[e.code]) return MENSAJES[e.code]
  return 'Algo salió mal. Inténtalo de nuevo.'
}
