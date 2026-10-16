import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves this repository under /study-app/.
  base: '/study-app/',
  plugins: [react()],
});
