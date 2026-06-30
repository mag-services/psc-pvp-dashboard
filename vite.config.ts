import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/** Always `./`; GitHub Pages + `<base>` in index.html fixes `/<repo>` without trailing slash. */
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'icons/app-icon.svg',
        'icons/pwa-192.png',
        'icons/pwa-512.png',
        'icons/apple-touch-icon-180.png',
        'data/ministries_pvp.json',
      ],
      manifest: {
        name: 'OPSC — Priority Vacant Posts',
        short_name: 'PSC PVP',
        description: 'Executive dashboard for priority vacant posts — internal use.',
        theme_color: '#185FA5',
        background_color: '#f6f7f9',
        display: 'standalone',
        orientation: 'any',
        scope: './',
        start_url: './',
        // Chromium requires raster icons (192 + 512) for “Install app”; SVG-only often fails installability.
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/app-icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,woff2}'],
        navigateFallback: 'index.html',
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
