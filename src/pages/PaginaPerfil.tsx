import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { Boton, clasesBoton } from '@/components/Boton'
import { CampoTexto } from '@/components/CampoTexto'
import { Aviso } from '@/components/Aviso'
import { Icono, type NombreIcono } from '@/components/Icono'
import { useAjustes } from '@/hooks/useAjustes'
import { useSesion } from '@/hooks/useSesion'
import { useEnLinea } from '@/hooks/useEnLinea'
import { usePerfil } from '@/hooks/usePerfil'
import type { Tema } from '@/lib/ajustes'

const TEMAS: { valor: Tema; texto: string; icono: NombreIcono }[] = [
  { valor: 'claro', texto: 'Claro', icono: 'sol' },
  { valor: 'oscuro', texto: 'Oscuro', icono: 'luna' },
  { valor: 'sistema', texto: 'Automático', icono: 'movil' },
]

/** Pantalla 6: Perfil (foto, nombre, correo) y ajustes de la app */
export function PaginaPerfil() {
  return (
    <>
      <EncabezadoPagina titulo="Perfil" />
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <DatosPerfil />
        <AjustesApariencia />
        <Cuenta />
      </div>
    </>
  )
}

/** Foto, nombre y correo */
function DatosPerfil() {
  const { perfil, correo, guardando, error, cambiarNombre, cambiarFoto } = usePerfil()
  const enLinea = useEnLinea()
  const selectorFoto = useRef<HTMLInputElement>(null)
  const [nombre, setNombre] = useState(perfil?.nombre ?? '')
  const [guardado, setGuardado] = useState(false)

  // Cuando llega el perfil del servidor, mostrar su nombre en el campo
  useEffect(() => {
    if (perfil) setNombre(perfil.nombre)
  }, [perfil])

  const nombreCambio = nombre.trim() !== (perfil?.nombre ?? '')

  async function guardarNombre(e: FormEvent) {
    e.preventDefault()
    setGuardado(false)
    if (await cambiarNombre(nombre)) setGuardado(true)
  }

  async function elegirFoto(archivo: File | undefined) {
    if (archivo) await cambiarFoto(archivo)
    // Permite volver a elegir la misma foto si falló
    if (selectorFoto.current) selectorFoto.current.value = ''
  }

  return (
    <section className="space-y-4 rounded-2xl border border-borde bg-superficie p-4">
      <div className="flex items-center gap-4">
        {/* Foto de perfil: al tocarla se abre la cámara o la galería */}
        <button
          type="button"
          onClick={() => selectorFoto.current?.click()}
          disabled={!enLinea || guardando}
          className="relative size-24 shrink-0 rounded-full disabled:opacity-60"
          aria-label="Cambiar foto de perfil"
        >
          {perfil?.avatar ? (
            <img src={perfil.avatar} alt="" className="size-24 rounded-full object-cover" />
          ) : (
            <span className="grid size-24 place-items-center rounded-full bg-superficie-2 text-suave">
              <Icono nombre="usuario" className="size-12" />
            </span>
          )}
          <span className="absolute right-0 bottom-0 grid size-9 place-items-center rounded-full border-2 border-superficie bg-primario text-sobre-primario">
            <Icono nombre="camara" className="size-5" />
          </span>
        </button>
        <input
          ref={selectorFoto}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => elegirFoto(e.target.files?.[0])}
        />
        <div className="min-w-0">
          <p className="truncate text-xl font-bold">{perfil?.nombre || 'Sin nombre'}</p>
          <p className="truncate text-suave">{correo}</p>
          {guardando && <p className="text-sm text-suave">Guardando…</p>}
        </div>
      </div>

      {!enLinea && <Aviso>Sin conexión: podrás cambiar tu foto y tu nombre cuando vuelvas a tener internet.</Aviso>}
      {error && <Aviso tipo="error">{error}</Aviso>}

      <form onSubmit={guardarNombre} className="space-y-3">
        <CampoTexto
          etiqueta="Nombre"
          autoComplete="name"
          maxLength={80}
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            setGuardado(false)
          }}
          ayuda={guardado && !nombreCambio ? 'Nombre guardado ✓' : undefined}
        />
        {nombreCambio && (
          <Boton type="submit" className="w-full" disabled={!enLinea || guardando}>
            Guardar nombre
          </Boton>
        )}
      </form>
    </section>
  )
}

/** Tema claro/oscuro y tamaño de letra (se guardan en este dispositivo) */
function AjustesApariencia() {
  const ajustes = useAjustes()
  return (
    <>
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
                ajustes.tema === t.valor ? 'border-primario bg-primario/10 text-texto' : 'border-borde text-suave'
              }`}
            >
              <Icono nombre={t.icono} className="size-7" />
              {t.texto}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-borde bg-superficie p-4">
        <h2 className="mb-3 text-lg font-bold">Tamaño de letra</h2>
        <div className="flex items-center gap-3">
          <Boton
            variante="secundario"
            onClick={ajustes.achicarLetra}
            disabled={!ajustes.puedeAchicar}
            aria-label="Letra más pequeña"
            className="size-14 shrink-0 px-0! text-lg!"
          >
            A−
          </Boton>
          <p className="flex-1 text-center">Así se verá el texto</p>
          <Boton
            variante="secundario"
            onClick={ajustes.agrandarLetra}
            disabled={!ajustes.puedeAgrandar}
            aria-label="Letra más grande"
            className="size-14 shrink-0 px-0! text-2xl!"
          >
            A+
          </Boton>
        </div>
      </section>
    </>
  )
}

/** Cambiar contraseña y cerrar sesión (con confirmación) */
function Cuenta() {
  const { cerrarSesion } = useSesion()
  const enLinea = useEnLinea()
  const [confirmando, setConfirmando] = useState(false)

  return (
    <section className="space-y-3 pb-4">
      <Link to="/restablecer" className={clasesBoton('secundario', 'normal', 'w-full')}>
        Cambiar contraseña
      </Link>

      {confirmando ? (
        <div className="space-y-3 rounded-2xl border-2 border-peligro/40 p-4">
          <p className="font-semibold">¿Seguro que quieres cerrar sesión?</p>
          {!enLinea && (
            <p className="text-sm text-suave">
              No tienes conexión: para volver a entrar necesitarás internet.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Boton variante="secundario" onClick={() => setConfirmando(false)}>
              Cancelar
            </Boton>
            <Boton variante="peligro" onClick={cerrarSesion}>
              Cerrar sesión
            </Boton>
          </div>
        </div>
      ) : (
        <Boton variante="peligro" className="w-full" onClick={() => setConfirmando(true)}>
          <Icono nombre="salir" /> Cerrar sesión
        </Boton>
      )}
    </section>
  )
}
