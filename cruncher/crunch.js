import { ensureDir, writeFile } from 'fs-extra'
import { dirname, resolve } from 'path'

import { DATA_DIR, debugOutput } from './utils'
import steps from './steps'

const README = `
# Corona open data

This is the data used by [the corona app](https://corona.njoyard.fr).

It is generated twice a day from various data sources (see the app for details) from [the data cruncher](https://github.com/njoyard/corona/tree/master/cruncher).

This data is made available under the Public Domain Dedication and License v1.0 whose full text can be found at: http://opendatacommons.org/licenses/pddl/1.0/
`

export default async function crunch() {
  let data = null

  for (let step of Object.keys(steps).sort()) {
    data = await steps[step].default(data)
  }

  console.log('Writing output')
  await ensureDir(DATA_DIR)
  await writeFile(resolve(DATA_DIR, 'corona.json'), JSON.stringify(data))
  await writeFile(resolve(DATA_DIR, 'README.md'), README)

  if (process.env.DEBUG_OUTPUT) {
    for (let z of data) {
      delete z.points
    }

    await debugOutput('final-no-points', data)
  }

  if (process.env.DEV_OUTPUT) {
    await writeFile(
      resolve(dirname(__dirname), 'public/corona.json'),
      JSON.stringify(data)
    )
  }
}
