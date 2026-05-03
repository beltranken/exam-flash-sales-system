import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../../apps/backend/openapi.json',
  output: {
    postProcess: ['prettier'],
    importFileExtension: '.js',
    path: './src/api',
  },
  plugins: [
    '@hey-api/client-axios',
    '@hey-api/schemas',
    {
      enums: 'typescript',
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/sdk',
    },
  ],
})
