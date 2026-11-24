// Vista previa con datos de mentira: la app real, pero Firebase sustituido
// por una imitación en memoria. Sirve para probar cambios sin iniciar sesión
// y sin tocar los datos del estudio.   npm run dev:mock
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: here('..'),
  plugins: [react()],
  server: { port: 5199, strictPort: true },
  resolve: {
    alias: [
      { find: /^firebase\/app$/, replacement: here('./mocks/firebase-app.js') },
      { find: /^firebase\/auth$/, replacement: here('./mocks/firebase-auth.js') },
      { find: /^firebase\/firestore$/, replacement: here('./mocks/firebase-firestore.js') },
      { find: /^firebase\/storage$/, replacement: here('./mocks/firebase-storage.js') },
    ],
  },
});
