// Tipos mínimos de la librería nosleep.js (no trae los suyos)
declare module 'nosleep.js' {
  export default class NoSleep {
    get isEnabled(): boolean
    enable(): Promise<void>
    disable(): void
  }
}
