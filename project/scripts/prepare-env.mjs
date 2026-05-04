import { copyFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const envFiles = [
  ['apps/backend/.env.example', 'apps/backend/.env'],
  ['apps/frontend/.env.example', 'apps/frontend/.env'],
  ['services/order-workers/.env.example', 'services/order-workers/.env'],
  ['shared/db/.env.example', 'shared/db/.env'],
  ['shared/logger/.env.example', 'shared/logger/.env'],
  ['tools/stress-test/.env.example', 'tools/stress-test/.env'],
]

for (const [source, target] of envFiles) {
  const sourcePath = resolve(rootDir, source)
  const targetPath = resolve(rootDir, target)

  if (existsSync(targetPath)) {
    console.log(`skip ${target} already exists`)
    continue
  }

  copyFileSync(sourcePath, targetPath)
  console.log(`create ${target}`)
}
