import { Link } from 'react-router'
import { clasesBoton } from '@/components/Boton'

/** Se muestra cuando la dirección no corresponde a ninguna pantalla */
export function PaginaNoEncontrada() {
  return (
    <main className="pt-seguro flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="text-6xl font-bold text-primario">404</p>
      <p className="text-lg">Esta página se nos escapó como un punto suelto.</p>
      <Link to="/" className={clasesBoton('primario', 'grande')}>
        Ir a mis proyectos
      </Link>
    </main>
  )
}
