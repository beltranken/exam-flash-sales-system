import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = resolve(root, 'src')
const targetRoot = resolve(root, 'dist')
const luaFiles = [
  'features/checkout/redis-scripts/reserve-cart.lua',
  'features/checkout/redis-scripts/rollback-cart-reservations.lua',
]

for (const luaFile of luaFiles) {
  const source = resolve(sourceRoot, luaFile)
  const target = resolve(targetRoot, luaFile)

  if (!existsSync(source)) {
    throw new Error(`Lua script not found: ${relative(root, source)}`)
  }

  mkdirSync(dirname(target), { recursive: true })
  cpSync(source, target)
}
