import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
const srcPath = path.resolve(__dirname, 'src')

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        find: /^@\/api$/,
        replacement: path.resolve(srcPath, 'api/index.ts'),
      },
      {
        find: /^@\/api\/(.*)$/,
        replacement: path.resolve(srcPath, 'api/$1'),
      },
    ],
  },
})
