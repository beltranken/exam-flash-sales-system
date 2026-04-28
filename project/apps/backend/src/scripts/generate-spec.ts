import fs from 'fs'
import path from 'path'
import { createApp } from '../app.js'

async function generateSpec() {
  const app = await createApp()

  await app.ready()

  const spec = app.swagger()

  const filePath = path.join(process.cwd(), 'openapi.json')

  fs.writeFileSync(filePath, JSON.stringify(spec, null, 2))

  console.log('OpenAPI spec generated:', filePath)

  await app.close()
}

void generateSpec()
