import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Barbearia O Vieira',
        short_name: 'Barbearia O Vieira',
        description: 'Agende seu horário na Barbearia O Vieira',
        theme_color: '#0c0a09',
        background_color: '#0c0a09',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'https://i.imgur.com/BnR11UJ.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://i.imgur.com/BnR11UJ.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
