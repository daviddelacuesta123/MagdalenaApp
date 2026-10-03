// Íconos de línea en SVG (sin librerías externas para que la app pese poco).
// Uso: <Icono nombre="mas" className="size-6" />

const TRAZOS = {
  mas: 'M12 5v14M5 12h14',
  menos: 'M5 12h14',
  atras: 'M15 18l-6-6 6-6',
  adelante: 'M9 18l6-6-6-6',
  arriba: 'M18 15l-6-6-6 6',
  abajo: 'M6 9l6 6 6-6',
  reiniciar: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  lista: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  usuario: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10',
  editar: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
  sol: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  luna: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z',
  movil: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM12 18h.01',
  contador: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2',
  // Ovillo: bola con hebras en diagonal y una punta de hilo suelta
  ovillo: 'M11 21a9 9 0 1 1 9-9M5 5.5 16.5 17M3.5 10l10 10M10 3l10.5 10.5M7.5 19 17 6M20 12c0 4 1 7 3 9',
  salir: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  camara: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  pausa: 'M10 4H6v16h4ZM18 4h-4v16h4Z',
  reproducir: 'M6 3l14 9-14 9Z',
  ojo: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  ojoTachado: 'M10.7 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20',
  correo: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM22 6l-10 7L2 6',} as const

export type NombreIcono = keyof typeof TRAZOS

interface Props {
  nombre: NombreIcono
  className?: string
}

export function Icono({ nombre, className = 'size-6' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  )
}
