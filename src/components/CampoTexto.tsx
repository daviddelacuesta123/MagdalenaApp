import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const CLASES_CAMPO =
  'w-full rounded-2xl border-2 border-borde bg-superficie px-4 py-3 text-base text-texto placeholder:text-suave/70 focus:border-primario focus:outline-none'

interface PropsCampo extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  error?: string
}

/** Campo de texto con etiqueta y mensaje de error. Letra de 16px mínimo para que iPhone no haga zoom. */
export function CampoTexto({ etiqueta, error, className = '', ...resto }: PropsCampo) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {etiqueta}
      </label>
      <input id={id} className={`${CLASES_CAMPO} min-h-12`} aria-invalid={!!error} {...resto} />
      {error && <p className="mt-1.5 text-sm text-peligro">{error}</p>}
    </div>
  )
}

interface PropsArea extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  etiqueta: string
  ayuda?: string
}

export function AreaTexto({ etiqueta, ayuda, className = '', ...resto }: PropsArea) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {etiqueta}
      </label>
      {ayuda && <p className="mb-1.5 text-sm text-suave">{ayuda}</p>}
      <textarea id={id} className={`${CLASES_CAMPO} min-h-32`} {...resto} />
    </div>
  )
}
