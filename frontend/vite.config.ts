import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // El puerto es parte del contrato con el backend: SANCTUM_STATEFUL_DOMAINS
    // apunta a localhost:5173. Si Vite saltara a otro puerto, Sanctum dejaria
    // de tratar la sesion como "del frontend" y todo responderia 401.
    // strictPort falla de inmediato en vez de esconder el problema.
    port: 5173,
    strictPort: true,
  },
})
