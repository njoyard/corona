import { ensureDir, writeFile } from 'fs-extra'
import { dirname, resolve } from 'path'

import { DATA_DIR } from './utils'
import steps from './steps'

export default async function crunch() {
  let data = null

  for (let step of Object.keys(steps).sort()) {
    data = await steps[step].default(data)
  }

  console.log('Writing output')
  await ensureDir(DATA_DIR)
  await writeFile(resolve(DATA_DIR, 'corona.json'), JSON.stringify(data))

  if (process.env.DEV_OUTPUT) {
    await writeFile(
      resolve(dirname(__dirname), 'public/corona.json'),
      JSON.stringify(data)
    )
  }
}
