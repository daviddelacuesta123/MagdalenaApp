import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { supabase } from '@/lib/supabase'
import { traducirError, validarCorreo } from '@/lib/validacion'
import { useEnLinea } from '@/hooks/useEnLinea'
import { Boton } from '@/components/Boton'
import { CampoTexto } from '@/components/CampoTexto'
import { Aviso } from '@/components/Aviso'
import { DisenoAcceso } from '@/components/DisenoAcceso'

/** Pide el correo y envía el enlace para elegir una contraseña nueva */
export function PaginaRecuperar() {
  const enLinea = useEnLinea()
  const correoInicial = (useLocation().state as { correo?: string } | null)?.correo ?? ''
  const [correo, setCorreo] = useState(correoInicial)
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const problema = validarCorreo(correo)
    setErrorCorreo(problema)
    if (problema) return

    setEnviando(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(correo.trim().toLowerCase(), {
        // El enlace del correo abrirá esta pantalla de la app
        redirectTo: `${window.location.origin}/restablecer`,
      })
      if (error) throw error
      setEnviado(true)
    } catch (err) {
      setError(traducirError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <DisenoAcceso subtitulo="Recuperar contraseña">
      {enviado ? (
        <div className="space-y-4">
          <Aviso tipo="exito">
            Si existe una cuenta con <strong>{correo.trim()}</strong>, te llegará un correo con un enlace para elegir
            una contraseña nueva. Revisa también la carpeta de spam.
          </Aviso>
          <Link to="/acceso" className="block py-3 text-center font-semibold text-primario">
            Volver a entrar
          </Link>
        </div>
      ) : (
        <form onSubmit={enviar} className="space-y-4" noValidate>
          <p className="text-suave">Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva.</p>
          {!enLinea && <Aviso>Sin conexión. Necesitas internet para enviar el correo.</Aviso>}
          {error && <Aviso tipo="error">{error}</Aviso>}
          <CampoTexto
            etiqueta="Correo electrónico"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            error={errorCorreo}
          />
          <Boton type="submit" tamano="grande" className="w-full" disabled={enviando || !enLinea}>
            {enviando ? 'Enviando…' : 'Enviar enlace'}
          </Boton>
          <Link to="/acceso" className="block py-3 text-center font-semibold text-primario">
            Volver
          </Link>
        </form>
      )}
    </DisenoAcceso>
  )
}
