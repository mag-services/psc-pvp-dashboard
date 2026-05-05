import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Always `./`; GitHub Pages + `<base>` in index.html fixes `/<repo>` without trailing slash. */
export default defineConfig({
  plugins: [react()],
  base: './',
});
