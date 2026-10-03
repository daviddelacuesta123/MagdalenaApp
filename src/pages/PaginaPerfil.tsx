import { useNavigate } from 'react-router'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { Boton } from '@/components/Boton'
import { Icono, type NombreIcono } from '@/components/Icono'
import { useAjustes } from '@/hooks/useAjustes'
import type { Tema } from '@/lib/ajustes'

const TEMAS: { valor: Tema; texto: string; icono: NombreIcono }[] = [
  { valor: 'claro', texto: 'Claro', icono: 'sol' },
  { valor: 'oscuro', texto: 'Oscuro', icono: 'luna' },
  { valor: 'sistema', texto: 'Automático', icono: 'movil' },
]

/**
 * Pantalla 6: Perfil y ajustes.
 * FASE 1: ajustes de tema y letra (ya funcionan). Datos de perfil de ejemplo.
 * FASE 2: nombre, foto y correo reales desde Supabase.
 */
export function PaginaPerfil() {
  const ajustes = useAjustes()
  const navegar = useNavigate()

  return (
    <>
      <EncabezadoPagina titulo="Perfil" />

      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        {/* Datos de la persona */}
        <section className="flex items-center gap-4 rounded-2xl border border-borde bg-superficie p-4">
          <div className="grid size-20 shrink-0 place-items-center rounded-full bg-superficie-2 text-suave">
            <Icono nombre="usuario" className="size-10" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold">Tu nombre</p>
            <p className="truncate text-suave">correo@ejemplo.com</p>
          </div>
        </section>

        {/* Tema */}
        <section className="rounded-2xl border border-borde bg-superficie p-4">
          <h2 className="mb-3 text-lg font-bold">Apariencia</h2>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tema">
            {TEMAS.map((t) => (
              <button
                key={t.valor}
                role="radio"
                aria-checked={ajustes.tema === t.valor}
                onClick={() => ajustes.cambiarTema(t.valor)}
                className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 font-semibold ${
                  ajustes.tema === t.valor
                    ? 'border-primario bg-primario/10 text-texto'
                    : 'border-borde text-suave'
                }`}
              >
                <Icono nombre={t.icono} className="size-7" />
                {t.texto}
              </button>
            ))}
          </div>
        </section>

        {/* Tamaño de letra */}
        <section className="rounded-2xl border border-borde bg-superficie p-4">
          <h2 className="mb-3 text-lg font-bold">Tamaño de letra</h2>
          <div className="flex items-center gap-3">
            <Boton
              variante="secundario"
              onClick={ajustes.achicarLetra}
              disabled={!ajustes.puedeAchicar}
              aria-label="Letra más pequeña"
              className="size-14 shrink-0 px-0! text-lg"
            >
              A−
            </Boton>
            <p className="flex-1 text-center">Así se verá el texto</p>
            <Boton
              variante="secundario"
              onClick={ajustes.agrandarLetra}
              disabled={!ajustes.puedeAgrandar}
              aria-label="Letra más grande"
              className="size-14 shrink-0 px-0! text-2xl"
            >
              A+
            </Boton>
          </div>
        </section>

        {/* Cerrar sesión (Fase 2) */}
        <Boton variante="peligro" className="w-full" onClick={() => navegar('/acceso')}>
          <Icono nombre="salir" /> Cerrar sesión
        </Boton>
      </div>
    </>
  )
}
