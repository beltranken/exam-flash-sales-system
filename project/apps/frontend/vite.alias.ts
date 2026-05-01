import path from 'node:path'
import type { AliasOptions } from 'vite'

const srcPath = path.resolve(__dirname, 'src')

export const alias: AliasOptions = [
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
  {
    find: /^@\/utils\/(.*)$/,
    replacement: path.resolve(srcPath, 'utils/$1'),
  },
]
