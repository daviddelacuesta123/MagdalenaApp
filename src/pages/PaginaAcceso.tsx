import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { supabase } from '@/lib/supabase'
import { traducirError, validarContrasenaNueva, validarCorreo } from '@/lib/validacion'
import { useSesion } from '@/hooks/useSesion'
import { useEnLinea } from '@/hooks/useEnLinea'
import { Boton } from '@/components/Boton'
import { CampoContrasena, CampoTexto } from '@/components/CampoTexto'
import { Aviso } from '@/components/Aviso'
import { DisenoAcceso } from '@/components/DisenoAcceso'
import { PantallaCarga } from '@/components/PantallaCarga'

type Modo = 'entrar' | 'registro'

interface Errores {
  nombre?: string | null
  correo?: string | null
  contrasena?: string | null
}

/** Pantalla 1: Inicio de sesión / Registro con correo y contraseña */
export function PaginaAcceso() {
  const { usuario, cargando } = useSesion()
  const enLinea = useEnLinea()
  const ubicacion = useLocation()
  const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/'

  const [modo, setModo] = useState<Modo>('entrar')
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (cargando) return <PantallaCarga />
  // Si ya hay sesión (o se acaba de iniciar), ir a la app
  if (usuario) return <Navigate to={destino} replace />

  function cambiarModo(m: Modo) {
    setModo(m)
    setErrores({})
    setErrorGeneral(null)
    setMensaje(null)
  }

  function validar(): boolean {
    const nuevos: Errores = {
      correo: validarCorreo(correo),
      contrasena:
        modo === 'registro'
          ? validarContrasenaNueva(contrasena)
          : contrasena
            ? null
            : 'Escribe tu contraseña.',
      nombre: modo === 'registro' && !nombre.trim() ? 'Escribe tu nombre.' : null,
    }
    setErrores(nuevos)
    return !nuevos.correo && !nuevos.contrasena && !nuevos.nombre
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErrorGeneral(null)
    setMensaje(null)
    if (!validar()) return

    setEnviando(true)
    try {
      const email = correo.trim().toLowerCase()
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: contrasena })
        if (error) throw error
        // Al iniciar sesión, useSesion actualiza el usuario y esta pantalla redirige sola
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: contrasena,
          options: {
            data: { name: nombre.trim() }, // el trigger de la base de datos lo copia al perfil
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
        if (!data.session) {
          // Solo pasa si está activada la confirmación de correo en Supabase
          setMensaje('¡Cuenta creada! Te enviamos un correo para confirmarla. Ábrelo y luego vuelve a entrar.')
          cambiarModo('entrar')
        }
      }
    } catch (error) {
      setErrorGeneral(traducirError(error))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <DisenoAcceso subtitulo="Tu compañera de crochet">
      {/* Selector Entrar / Crear cuenta */}
      <div className="mb-6 grid grid-cols-2 rounded-2xl bg-superficie-2 p-1" role="tablist">
        {(['entrar', 'registro'] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={modo === m}
            onClick={() => cambiarModo(m)}
            className={`min-h-12 rounded-xl font-semibold ${
              modo === m ? 'bg-superficie text-texto shadow-sm' : 'text-suave'
            }`}
          >
            {m === 'entrar' ? 'Entrar' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} className="space-y-4" noValidate>
        {!enLinea && <Aviso>Sin conexión. Necesitas internet para entrar o crear tu cuenta.</Aviso>}
        {mensaje && <Aviso tipo="exito">{mensaje}</Aviso>}
        {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}

        {modo === 'registro' && (
          <CampoTexto
            etiqueta="Nombre"
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={errores.nombre}
            maxLength={80}
          />
        )}
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
          error={errores.correo}
        />
        <CampoContrasena
          etiqueta="Contraseña"
          autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          error={errores.contrasena}
          ayuda={modo === 'registro' ? 'Mínimo 8 caracteres, con al menos una letra y un número.' : undefined}
        />

        <Boton type="submit" tamano="grande" className="w-full" disabled={enviando || !enLinea}>
          {enviando ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
        </Boton>

        {modo === 'entrar' && (
          <Link to="/recuperar" state={{ correo }} className="block py-3 text-center font-semibold text-primario">
            ¿Olvidaste tu contraseña?
          </Link>
        )}
      </form>
    </DisenoAcceso>
  )
}
