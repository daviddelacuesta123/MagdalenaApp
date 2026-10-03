import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '@/lib/supabase'
import { traducirError, validarContrasenaNueva } from '@/lib/validacion'
import { useSesion } from '@/hooks/useSesion'
import { Boton } from '@/components/Boton'
import { CampoContrasena } from '@/components/CampoTexto'
import { Aviso } from '@/components/Aviso'
import { DisenoAcceso } from '@/components/DisenoAcceso'
import { PantallaCarga } from '@/components/PantallaCarga'

/** Lee el error que Supabase pone en la URL cuando el enlace venció o ya se usó */
function errorDelEnlace(): string | null {
  const datos = new URLSearchParams(window.location.hash.slice(1) || window.location.search.slice(1))
  const codigo = datos.get('error_code') ?? datos.get('error')
  return codigo ? traducirError({ code: codigo === 'access_denied' ? 'otp_expired' : codigo }) : null
}

/**
 * Pantalla a la que lleva el enlace del correo "recuperar contraseña".
 * Supabase inicia una sesión temporal con el enlace; aquí se elige la contraseña nueva.
 */
export function PaginaRestablecer() {
  const { usuario, cargando } = useSesion()
  const navegar = useNavigate()
  const [errorEnlace] = useState(errorDelEnlace)
  const [contrasena, setContrasena] = useState('')
  const [repetida, setRepetida] = useState('')
  const [errorCampo, setErrorCampo] = useState<string | null>(null)
  const [errorRepetida, setErrorRepetida] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  if (cargando) return <PantallaCarga />

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const problema = validarContrasenaNueva(contrasena)
    const distinta = contrasena !== repetida ? 'Las contraseñas no coinciden.' : null
    setErrorCampo(problema)
    setErrorRepetida(distinta)
    if (problema || distinta) return

    setGuardando(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: contrasena })
      if (error) throw error
      navegar('/', { replace: true })
    } catch (err) {
      setError(traducirError(err))
    } finally {
      setGuardando(false)
    }
  }

  // Sin sesión: el enlace no es válido (venció, ya se usó o se abrió esta pantalla directamente)
  if (!usuario) {
    return (
      <DisenoAcceso subtitulo="Nueva contraseña">
        <div className="space-y-4">
          <Aviso tipo="error">{errorEnlace ?? 'Este enlace no es válido o ya venció. Pide uno nuevo.'}</Aviso>
          <Link to="/recuperar" className="block py-3 text-center font-semibold text-primario">
            Pedir otro enlace
          </Link>
        </div>
      </DisenoAcceso>
    )
  }

  return (
    <DisenoAcceso subtitulo="Nueva contraseña">
      <form onSubmit={guardar} className="space-y-4" noValidate>
        <p className="text-suave">
          Elige una contraseña nueva para <strong className="text-texto">{usuario.email}</strong>.
        </p>
        {error && <Aviso tipo="error">{error}</Aviso>}
        {/* Campo oculto con el correo: ayuda a los gestores de contraseñas a guardarla bien */}
        <input type="email" autoComplete="username" value={usuario.email ?? ''} readOnly hidden />
        <CampoContrasena
          etiqueta="Contraseña nueva"
          autoComplete="new-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          error={errorCampo}
          ayuda="Mínimo 8 caracteres, con al menos una letra y un número."
        />
        <CampoContrasena
          etiqueta="Repite la contraseña"
          autoComplete="new-password"
          value={repetida}
          onChange={(e) => setRepetida(e.target.value)}
          error={errorRepetida}
        />
        <Boton type="submit" tamano="grande" className="w-full" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar contraseña'}
        </Boton>
        <Link to="/perfil" className="block py-3 text-center font-semibold text-primario">
          Cancelar
        </Link>
      </form>
    </DisenoAcceso>
  )
}
