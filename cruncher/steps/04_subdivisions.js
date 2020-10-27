import { debugOutput } from '../utils'
import continents from '../sources/continents'

const subdivisions = [
  [/^World$/, 'continent'],
  [/^France\|[^|]+$/, 'department'],
  [/^United States$/, 'state'],
  [/^United States\|[^|]+$/, 'county']
]

export default async function filter(data) {
  console.log('Adding non-region subdivision types')

  for (let z of data) {
    if (z.zone in continents) {
      if (!z.meta) z.meta = {}
      z.meta.subdivision = 'country'
      continue
    }

    for (let [regexp, subdivision] of subdivisions) {
      if (regexp.test(z.zone)) {
        if (!z.meta) z.meta = {}
        z.meta.subdivision = subdivision
        break
      }
    }
  }

  await debugOutput('subdivisions', data)

  return data
}
