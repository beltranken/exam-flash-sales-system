import path from 'node:path'
import type { AliasOptions } from 'vite'

const srcPath = path.resolve(__dirname, 'src')
const sharedApiClientPath = path.resolve(__dirname, '../../shared/api-client/src/api')

export const alias: AliasOptions = [
  {
    find: /^@shared\/api-client$/,
    replacement: path.resolve(sharedApiClientPath, 'index.ts'),
  },
  {
    find: /^@shared\/api-client\/client\.gen$/,
    replacement: path.resolve(sharedApiClientPath, 'client.gen.ts'),
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
  {
    find: /^@\/utils\/(.*)$/,
    replacement: path.resolve(srcPath, 'utils/$1'),
  },
]
