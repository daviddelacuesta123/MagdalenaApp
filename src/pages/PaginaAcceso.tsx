import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Boton } from '@/components/Boton'
import { CampoTexto } from '@/components/CampoTexto'
import { Icono } from '@/components/Icono'

type Modo = 'entrar' | 'registro'

/**
 * Pantalla 1: Inicio de sesión / Registro.
 * FASE 1: solo diseño. El botón entra directamente sin validar.
 * FASE 2: se conectará con Supabase Auth y validará correo y contraseña.
 */
export function PaginaAcceso() {
  const [modo, setModo] = useState<Modo>('entrar')
  const navegar = useNavigate()

  function enviar(e: FormEvent) {
    e.preventDefault()
    navegar('/') // Temporal hasta la Fase 2
  }

  return (
    <main className="pt-seguro pb-seguro mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 grid size-20 place-items-center rounded-full bg-primario text-sobre-primario">
          <Icono nombre="ovillo" className="size-12" />
        </div>
        <h1 className="text-3xl font-bold">Magdalena</h1>
        <p className="text-suave">Tu compañera de crochet</p>
      </div>

      {/* Selector Entrar / Crear cuenta */}
      <div className="mb-6 grid grid-cols-2 rounded-2xl bg-superficie-2 p-1" role="tablist">
        {(['entrar', 'registro'] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={modo === m}
            onClick={() => setModo(m)}
            className={`min-h-12 rounded-xl font-semibold ${
              modo === m ? 'bg-superficie text-texto shadow-sm' : 'text-suave'
            }`}
          >
            {m === 'entrar' ? 'Entrar' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} className="space-y-4">
        {modo === 'registro' && <CampoTexto etiqueta="Nombre" autoComplete="name" />}
        <CampoTexto etiqueta="Correo electrónico" type="email" autoComplete="email" inputMode="email" />
        <CampoTexto
          etiqueta="Contraseña"
          type="password"
          autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
        />
        {modo === 'registro' && (
          <p className="text-sm text-suave">Mínimo 8 caracteres, con al menos una letra y un número.</p>
        )}
        <Boton type="submit" tamano="grande" className="w-full">
          {modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
        </Boton>
        {modo === 'entrar' && (
          <button type="button" className="w-full py-3 font-semibold text-primario">
            ¿Olvidaste tu contraseña?
          </button>
        )}
      </form>
    </main>
  )
}
