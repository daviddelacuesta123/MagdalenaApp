import { useId, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Icono } from './Icono'

const CLASES_CAMPO =
  'w-full rounded-2xl border-2 border-borde bg-superficie px-4 py-3 text-base text-texto placeholder:text-suave/70 focus:border-primario focus:outline-none aria-[invalid=true]:border-peligro'

interface PropsCampo extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  error?: string | null
  ayuda?: string
}

/** Campo de texto con etiqueta y mensaje de error. Letra de 16px mínimo para que iPhone no haga zoom. */
export function CampoTexto({ etiqueta, error, ayuda, className = '', ...resto }: PropsCampo) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {etiqueta}
      </label>
      <input
        id={id}
        className={`${CLASES_CAMPO} min-h-12`}
        aria-invalid={!!error}
        aria-describedby={error || ayuda ? `${id}-nota` : undefined}
        {...resto}
      />
      <Nota id={`${id}-nota`} error={error} ayuda={ayuda} />
    </div>
  )
}

/** Campo de contraseña con botón para mostrarla u ocultarla (útil al escribir en el teléfono) */
export function CampoContrasena({ etiqueta, error, ayuda, className = '', ...resto }: PropsCampo) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`${CLASES_CAMPO} min-h-12 pr-14`}
          aria-invalid={!!error}
          aria-describedby={error || ayuda ? `${id}-nota` : undefined}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          {...resto}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 grid w-14 place-items-center text-suave"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <Icono nombre={visible ? 'ojoTachado' : 'ojo'} />
        </button>
      </div>
      <Nota id={`${id}-nota`} error={error} ayuda={ayuda} />
    </div>
  )
}

function Nota({ id, error, ayuda }: { id: string; error?: string | null; ayuda?: string }) {
  if (error) return <p id={id} className="mt-1.5 text-sm text-peligro">{error}</p>
  if (ayuda) return <p id={id} className="mt-1.5 text-sm text-suave">{ayuda}</p>
  return null
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
