import { defineConfig } from 'vitest/config'
import { alias } from './vite.alias'

export default defineConfig({
  resolve: {
    alias,
  },
  test: {
    coverage: {
      provider: 'v8',
    },
  },
})
