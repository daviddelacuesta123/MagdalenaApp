// Ajustes visuales de la app (tema y tamaño de letra).
// Se guardan en localStorage porque son preferencias de este dispositivo,
// no datos que haya que sincronizar con Supabase.

export type Tema = 'claro' | 'oscuro' | 'sistema'

export interface Ajustes {
  tema: Tema
  /** Índice dentro de ESCALAS_LETRA */
  tamanoLetra: number
}

const CLAVE = 'magdalena:ajustes'

/** Tamaños de letra disponibles, en % del tamaño base del navegador.
 *  Debe coincidir con el script de index.html. */
export const ESCALAS_LETRA = [87.5, 100, 112.5, 125, 137.5] as const

export const AJUSTES_POR_DEFECTO: Ajustes = { tema: 'sistema', tamanoLetra: 1 }

export function cargarAjustes(): Ajustes {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? '{}') as Partial<Ajustes>
    return { ...AJUSTES_POR_DEFECTO, ...guardado }
  } catch {
    // localStorage puede fallar (modo privado, almacenamiento bloqueado)
    return AJUSTES_POR_DEFECTO
  }
}

export function guardarAjustes(ajustes: Ajustes) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(ajustes))
  } catch {
    // Si no se puede guardar, los ajustes duran solo hasta cerrar la app
  }
}

const consultaOscuro = () => window.matchMedia('(prefers-color-scheme: dark)')

/** Indica si, con el tema elegido, la app debe verse oscura */
export function esOscuro(tema: Tema) {
  return tema === 'oscuro' || (tema === 'sistema' && consultaOscuro().matches)
}

/** Aplica los ajustes al documento: clase "dark", tamaño de letra y color de la barra del navegador */
export function aplicarAjustes(ajustes: Ajustes) {
  const raiz = document.documentElement
  const oscuro = esOscuro(ajustes.tema)
  raiz.classList.toggle('dark', oscuro)
  raiz.style.fontSize = `${ESCALAS_LETRA[ajustes.tamanoLetra] ?? 100}%`
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', oscuro ? '#1E1715' : '#FBF6F0')
}

/** Avisa cuando el sistema operativo cambia entre claro y oscuro */
export function escucharTemaSistema(alCambiar: () => void) {
  const consulta = consultaOscuro()
  consulta.addEventListener('change', alCambiar)
  return () => consulta.removeEventListener('change', alCambiar)
}
