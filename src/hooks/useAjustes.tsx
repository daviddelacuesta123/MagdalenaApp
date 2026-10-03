import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  aplicarAjustes,
  cargarAjustes,
  escucharTemaSistema,
  guardarAjustes,
  ESCALAS_LETRA,
  type Ajustes,
  type Tema,
} from '@/lib/ajustes'

interface ContextoAjustes extends Ajustes {
  cambiarTema: (tema: Tema) => void
  agrandarLetra: () => void
  achicarLetra: () => void
  puedeAgrandar: boolean
  puedeAchicar: boolean
}

const Contexto = createContext<ContextoAjustes | null>(null)

/** Proveedor que mantiene los ajustes en memoria, los guarda y los aplica al documento */
export function ProveedorAjustes({ children }: { children: ReactNode }) {
  const [ajustes, setAjustes] = useState<Ajustes>(cargarAjustes)

  // Cada vez que cambian los ajustes: aplicarlos y guardarlos
  useEffect(() => {
    aplicarAjustes(ajustes)
    guardarAjustes(ajustes)
  }, [ajustes])

  // Si el tema es "sistema", seguir los cambios del teléfono (p. ej. modo oscuro automático de noche)
  useEffect(() => {
    if (ajustes.tema !== 'sistema') return
    return escucharTemaSistema(() => aplicarAjustes(ajustes))
  }, [ajustes])

  const maximo = ESCALAS_LETRA.length - 1
  const valor: ContextoAjustes = {
    ...ajustes,
    cambiarTema: (tema) => setAjustes((a) => ({ ...a, tema })),
    agrandarLetra: () => setAjustes((a) => ({ ...a, tamanoLetra: Math.min(maximo, a.tamanoLetra + 1) })),
    achicarLetra: () => setAjustes((a) => ({ ...a, tamanoLetra: Math.max(0, a.tamanoLetra - 1) })),
    puedeAgrandar: ajustes.tamanoLetra < maximo,
    puedeAchicar: ajustes.tamanoLetra > 0,
  }

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAjustes() {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useAjustes debe usarse dentro de <ProveedorAjustes>')
  return contexto
}
