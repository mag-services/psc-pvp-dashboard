import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages: use an absolute path base (`/${repo}/` or `/` for `{user}.github.io`),
 * NOT `./`. Relative `./assets/` breaks when Pages serves `/<repo>` without trailing slash —
 * browsers resolve `./` against `/` → 404 scripts (console may cite `main.tsx` via sourcemaps).
 *
 * Locally: omit `VITE_BASE` → dev server uses `./`; `npm run preview` honours this too.
 */
function viteBase(): string {
  const raw = process.env.VITE_BASE?.trim();
  if (!raw || raw === 'undefined') return './';
  if (raw === '/') return '/';
  const leading = raw.startsWith('/') ? raw : `/${raw}`;
  return leading.endsWith('/') ? leading : `${leading}/`;
}

export default defineConfig({
  plugins: [react()],
  base: viteBase(),
});
