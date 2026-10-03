import { useFotoProyecto } from '@/hooks/useProyectos'
import { Icono } from './Icono'

interface Props {
  proyectoId: string
  className?: string
  /** Tamaño del ícono que se muestra si no hay foto */
  claseIcono?: string
}

/** Foto del proyecto (desde el teléfono) o un ovillo si no tiene */
export function FotoProyecto({ proyectoId, className = '', claseIcono = 'size-8' }: Props) {
  const url = useFotoProyecto(proyectoId)
  if (url) return <img src={url} alt="" className={`object-cover ${className}`} />
  return (
    <div className={`grid place-items-center bg-superficie-2 text-suave ${className}`}>
      <Icono nombre="ovillo" className={`${claseIcono} opacity-60`} />
    </div>
  )
}
