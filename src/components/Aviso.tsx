import type { ReactNode } from 'react'

type TipoAviso = 'error' | 'exito' | 'info'

const ESTILOS: Record<TipoAviso, string> = {
  error: 'border-peligro/40 bg-peligro/10 text-peligro',
  exito: 'border-primario/40 bg-primario/10 text-texto',
  info: 'border-borde bg-superficie-2 text-texto',
}

/** Mensaje destacado (errores, confirmaciones, avisos). Los lectores de pantalla lo anuncian. */
export function Aviso({ tipo = 'info', children }: { tipo?: TipoAviso; children: ReactNode }) {
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`rounded-2xl border-2 p-4 ${ESTILOS[tipo]}`}>
      {children}
    </div>
  )
}
