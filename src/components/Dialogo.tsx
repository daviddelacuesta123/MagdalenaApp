import { useEffect, useRef } from 'react'
import { Boton } from './Boton'

interface Props {
  abierto: boolean
  titulo: string
  mensaje?: string
  textoConfirmar: string
  /** Pinta el botón de confirmar en rojo (acciones que borran algo) */
  peligroso?: boolean
  alConfirmar: () => void
  alCancelar: () => void
}

/**
 * Ventana de confirmación (usa <dialog> nativo: bloquea el fondo y se cierra con "atrás"/Esc).
 * Los botones van abajo y a lo ancho para tocarlos fácil con el pulgar.
 */
export function Dialogo({ abierto, titulo, mensaje, textoConfirmar, peligroso, alConfirmar, alCancelar }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        alCancelar()
      }}
      // Tocar fuera de la ventana también cancela
      onClick={(e) => e.target === ref.current && alCancelar()}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl bg-superficie p-0 text-texto shadow-xl backdrop:bg-black/50"
    >
      <div className="space-y-2 p-5">
        <h2 className="text-xl font-bold">{titulo}</h2>
        {mensaje && <p className="text-suave">{mensaje}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 pt-0">
        <Boton variante="secundario" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton variante={peligroso ? 'peligroSolido' : 'primario'} onClick={alConfirmar}>
          {textoConfirmar}
        </Boton>
      </div>
    </dialog>
  )
}
