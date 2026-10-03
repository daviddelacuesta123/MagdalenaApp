// Compresión y redimensionado de imágenes en el navegador, antes de subirlas.
// Una foto de 12 MP del teléfono (~4 MB) queda en ~150–300 KB.

import { ErrorAmable } from './validacion'

interface OpcionesCompresion {
  /** Tamaño máximo del lado más largo, en píxeles */
  ladoMaximo?: number
  /** Calidad JPEG entre 0 y 1 */
  calidad?: number
}

/** Decodifica la imagen respetando la orientación de la foto (EXIF) */
async function decodificar(archivo: Blob): Promise<{ fuente: CanvasImageSource; ancho: number; alto: number; liberar: () => void }> {
  // Camino rápido: createImageBitmap (Chrome, Android, Safari moderno)
  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
      return { fuente: bitmap, ancho: bitmap.width, alto: bitmap.height, liberar: () => bitmap.close() }
    } catch {
      // Algunos Safari no aceptan las opciones: seguimos con <img>
    }
  }
  const url = URL.createObjectURL(archivo)
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  try {
    await img.decode()
  } catch {
    URL.revokeObjectURL(url)
    throw new ErrorAmable('No se pudo leer la imagen. Prueba con otra foto.')
  }
  return { fuente: img, ancho: img.naturalWidth, alto: img.naturalHeight, liberar: () => URL.revokeObjectURL(url) }
}

/**
 * Reduce la imagen para que su lado más largo mida como mucho `ladoMaximo`
 * y la convierte a JPEG. Devuelve un Blob listo para subir.
 */
export async function comprimirImagen(
  archivo: Blob,
  { ladoMaximo = 1200, calidad = 0.82 }: OpcionesCompresion = {},
): Promise<Blob> {
  if (!archivo.type.startsWith('image/')) {
    throw new ErrorAmable('El archivo elegido no es una imagen.')
  }

  const { fuente, ancho, alto, liberar } = await decodificar(archivo)
  try {
    const escala = Math.min(1, ladoMaximo / Math.max(ancho, alto))
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(ancho * escala)
    lienzo.height = Math.round(alto * escala)

    const ctx = lienzo.getContext('2d')
    if (!ctx) throw new ErrorAmable('Tu navegador no pudo procesar la imagen.')
    // Fondo blanco: las PNG transparentes quedarían negras en JPEG
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, lienzo.width, lienzo.height)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(fuente, 0, 0, lienzo.width, lienzo.height)

    const resultado = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, 'image/jpeg', calidad))
    if (!resultado) throw new ErrorAmable('No se pudo comprimir la imagen.')
    return resultado
  } finally {
    liberar()
  }
}

/** Convierte un Blob en data URL (para guardar una imagen pequeña y verla sin conexión) */
export function blobADataUrl(blob: Blob): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader()
    lector.onload = () => resolver(lector.result as string)
    lector.onerror = () => rechazar(lector.error)
    lector.readAsDataURL(blob)
  })
}
