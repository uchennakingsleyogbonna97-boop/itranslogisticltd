import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isGitHubPages = process.env.GITHUB_PAGES === 'true'
  const isCloudflare = process.env.CLOUDFLARE_PAGES === 'true'

  // Auto-detect base path for GitHub Pages (repo name), root for Cloudflare
  const base = isGitHubPages ? '/itrans-logistics/' : '/'

  return {
    plugins: [react()],
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            icons: ['lucide-react'],
          },
        },
      },
    },
    server: {
      port: 3000,
      open: true,
    },
  }
})