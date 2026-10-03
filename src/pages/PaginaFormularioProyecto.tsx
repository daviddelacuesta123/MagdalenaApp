import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { Boton } from '@/components/Boton'
import { AreaTexto, CampoTexto } from '@/components/CampoTexto'
import { Aviso } from '@/components/Aviso'
import { Icono } from '@/components/Icono'
import { useBaseDatos, useFotoProyecto, useProyecto, useUrlImagen } from '@/hooks/useProyectos'
import { crearProyecto, editarProyecto, type CambioFoto } from '@/db/proyectos'
import { comprimirImagen } from '@/lib/imagenes'
import { traducirError } from '@/lib/validacion'

/**
 * Pantalla 5: Crear / editar proyecto.
 * Si la ruta tiene :id es edición; si no, es un proyecto nuevo.
 * Se guarda en el teléfono al instante (funciona sin conexión).
 */
export function PaginaFormularioProyecto() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const db = useBaseDatos()
  const navegar = useNavigate()
  const proyecto = useProyecto(id)
  const fotoActual = useFotoProyecto(id)
  const selectorFoto = useRef<HTMLInputElement>(null)

  const [nombre, setNombre] = useState('')
  const [notas, setNotas] = useState('')
  const [foto, setFoto] = useState<CambioFoto>(undefined)
  const [errorNombre, setErrorNombre] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)
  const fotoNueva = useUrlImagen(foto)

  // Al editar, rellenar el formulario una sola vez cuando carga el proyecto
  const [relleno, setRelleno] = useState(false)
  useEffect(() => {
    if (proyecto && !relleno) {
      setNombre(proyecto.nombre)
      setNotas(proyecto.notas)
      setRelleno(true)
    }
  }, [proyecto, relleno])

  const volverA = esEdicion ? `/proyectos/${id}` : '/'
  // Qué foto mostrar: la nueva elegida, ninguna (si se quitó) o la que ya tenía
  const vistaPrevia = foto === null ? null : (fotoNueva ?? fotoActual)

  async function elegirFoto(archivo: File | undefined) {
    if (selectorFoto.current) selectorFoto.current.value = ''
    if (!archivo) return
    setError(null)
    setProcesando(true)
    try {
      setFoto(await comprimirImagen(archivo, { ladoMaximo: 1200 }))
    } catch (e) {
      setError(traducirError(e))
    } finally {
      setProcesando(false)
    }
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) {
      setErrorNombre('Ponle un nombre a tu proyecto.')
      return
    }
    setProcesando(true)
    try {
      if (id) {
        await editarProyecto(db, id, { nombre, notas }, foto)
        navegar(`/proyectos/${id}`, { replace: true })
      } else {
        const nuevo = await crearProyecto(db, { nombre, notas }, foto)
        navegar(`/proyectos/${nuevo}`, { replace: true })
      }
    } catch (err) {
      setError(traducirError(err))
      setProcesando(false)
    }
  }

  if (esEdicion && proyecto === null) {
    return (
      <>
        <EncabezadoPagina titulo="Editar proyecto" volverA="/" />
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <Aviso tipo="error">No encontramos este proyecto.</Aviso>
        </div>
      </>
    )
  }

  return (
    <>
      <EncabezadoPagina titulo={esEdicion ? 'Editar proyecto' : 'Nuevo proyecto'} volverA={volverA} />

      <form onSubmit={guardar} className="mx-auto max-w-2xl space-y-5 px-4 pt-4" noValidate>
        {error && <Aviso tipo="error">{error}</Aviso>}

        <CampoTexto
          etiqueta="Nombre"
          placeholder="Ej.: Amigurumi de conejo"
          maxLength={120}
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            setErrorNombre(null)
          }}
          error={errorNombre}
        />

        <div>
          <p className="mb-1.5 font-semibold">Foto (opcional)</p>
          {vistaPrevia ? (
            <div className="space-y-2">
              <img src={vistaPrevia} alt="Foto del proyecto" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              <div className="grid grid-cols-2 gap-2">
                <Boton variante="secundario" onClick={() => selectorFoto.current?.click()} disabled={procesando}>
                  <Icono nombre="camara" /> Cambiar
                </Boton>
                <Boton variante="peligro" onClick={() => setFoto(null)} disabled={procesando}>
                  Quitar
                </Boton>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => selectorFoto.current?.click()}
              disabled={procesando}
              className="grid aspect-[4/3] w-full place-items-center rounded-2xl border-2 border-dashed border-borde bg-superficie text-suave"
            >
              <span className="flex flex-col items-center gap-2">
                <Icono nombre="camara" className="size-10" />
                {procesando ? 'Preparando foto…' : 'Añadir foto'}
              </span>
            </button>
          )}
          <input
            ref={selectorFoto}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => elegirFoto(e.target.files?.[0])}
          />
        </div>

        <AreaTexto
          etiqueta="Notas"
          placeholder="Hilo, aguja, cambios de color…"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />

        <Boton type="submit" tamano="grande" className="w-full" disabled={procesando || (esEdicion && !proyecto)}>
          {esEdicion ? 'Guardar cambios' : 'Crear proyecto'}
        </Boton>
      </form>
    </>
  )
}
