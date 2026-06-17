import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.svg'],
        manifest: {
          name: 'Blocly Tools',
          short_name: 'Blocly',
          description: 'A unified digital toolkit for developers and creators.',
          theme_color: '#FAFAFA',
          background_color: '#FAFAFA',
          display: 'standalone',
          icons: [
            {
              src: '/logo.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: '/logo.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
            },
            {
              src: '/logo.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 // 10 MB
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    build: {
      // Only pin the small, app-wide React runtime into its own long-cached
      // chunk. Everything else (recharts, ffmpeg, faker, supabase, …) is left to
      // Rollup's automatic per-route splitting so heavy libs load ONLY with the
      // tool that needs them — keeping the initial payload tiny.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('/scheduler/') ||
              /node_modules\/react\//.test(id)
            )
              return 'react-vendor';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
