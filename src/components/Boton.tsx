import type { ButtonHTMLAttributes } from 'react'

export type VarianteBoton = 'primario' | 'secundario' | 'acento' | 'fantasma' | 'peligro' | 'peligroSolido'
export type TamanoBoton = 'normal' | 'grande' | 'contador' | 'enorme'

const VARIANTES: Record<VarianteBoton, string> = {
  primario: 'bg-primario text-sobre-primario hover:bg-primario-hover',
  secundario: 'bg-superficie-2 text-texto border-2 border-borde hover:border-primario',
  acento: 'bg-superficie-2 text-acento border-2 border-acento',
  fantasma: 'bg-transparent text-texto hover:bg-superficie-2',
  peligro: 'bg-transparent text-peligro border-2 border-peligro hover:bg-peligro/10',
  peligroSolido: 'bg-peligro text-fondo hover:opacity-90',
}

// Alturas mínimas pensadas para dedos: 48px (normal), 64px (grande), 80px y 96px (contador).
// No sobrescribir estas clases con className: en Tailwind gana el orden del CSS, no el del
// atributo. Si hace falta otro tamaño o color, añadirlo aquí.
const TAMANOS: Record<TamanoBoton, string> = {
  normal: 'min-h-12 px-5 text-base',
  grande: 'min-h-16 px-6 text-lg',
  contador: 'min-h-20 px-4 text-lg',
  enorme: 'min-h-24 px-6 text-2xl',
}

/** Clases del botón. Sirve también para dar aspecto de botón a un <Link>. */
export function clasesBoton(variante: VarianteBoton = 'primario', tamano: TamanoBoton = 'normal', extra = '') {
  return [
    'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold select-none',
    'transition-[background-color,border-color,transform] active:scale-[0.97]',
    'disabled:opacity-40 disabled:pointer-events-none',
    VARIANTES[variante],
    TAMANOS[tamano],
    extra,
  ].join(' ')
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton
  tamano?: TamanoBoton
}

export function Boton({ variante, tamano, className = '', type = 'button', ...resto }: Props) {
  return <button type={type} className={clasesBoton(variante, tamano, className)} {...resto} />
}
