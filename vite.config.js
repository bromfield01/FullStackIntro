import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@apollo/client',
      '@apollo/client/link/http',
      '@apollo/client/link/context',
    ],
  },
  ssr: {
    noExternal: ['@apollo/client'],
  },
});
