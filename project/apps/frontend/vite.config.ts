import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import flowbiteReact from 'flowbite-react/plugin/vite'
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
    flowbiteReact(),
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
      {
        find: /^@\/components\/(.*)$/,
        replacement: path.resolve(srcPath, 'components/$1'),
      },
      {
        find: /^@\/icons\/(.*)$/,
        replacement: path.resolve(srcPath, 'components/icons/$1'),
      },
      {
        find: /^@\/pages\/(.*)$/,
        replacement: path.resolve(srcPath, 'pages/$1'),
      },
      {
        find: /^@\/schemas$/,
        replacement: path.resolve(srcPath, 'libs/schemas/index.ts'),
      },
      {
        find: /^@\/schemas\/(.*)$/,
        replacement: path.resolve(srcPath, 'libs/schemas/$1'),
      },
      {
        find: /^@\/libs\/(.*)$/,
        replacement: path.resolve(srcPath, 'libs/$1'),
      },
      {
        find: /^@\/constants$/,
        replacement: path.resolve(srcPath, 'libs/constants/index.ts'),
      },
      {
        find: /^@\/constants\/(.*)$/,
        replacement: path.resolve(srcPath, 'libs/constants/$1'),
      },
      {
        find: /^@\/features\/(.*)$/,
        replacement: path.resolve(srcPath, 'components/features/$1'),
      },
    ],
  },
})
