import { debugOutput } from '../utils'

// Fields that count new daily events, don't remove repeated values on those
const DAILY_COUNTERS = new Set(['tests', 'positives'])

export default async function filter(data) {
  console.log('Removing US counties')

  let filtered = data.filter(
    ({ zone }) =>
      !zone.startsWith('United States|') || zone.split('|').length < 3
  )

  console.log('Removing initial zeroes and repeated values')

  for (let zone of data) {
    for (let field of zone.meta.fields) {
      let firstNonZero = zone.points.findIndex((p) => p[field] !== 0)
      let lastNonZero =
        zone.points.length -
        1 -
        [...zone.points].reverse().findIndex((p) => p[field] !== 0)

      // Delete field in all points until the first non zero value

      for (let i = 0; i < firstNonZero; i++) {
        delete zone.points[i][field]
      }

      if (DAILY_COUNTERS.has(field)) {
        continue
      }

      // Remove repeated values, except when it's the last point in the series
      let previousValue = NaN
      for (let i = 0; i < lastNonZero; i++) {
        let point = zone.points[i]
        if (point[field] === previousValue) {
          delete point[field]
        } else if (point[field] !== undefined) {
          previousValue = point[field]
        }
      }
    }

    // Remove empty points
    zone.points = zone.points.filter((p) => Object.keys(p).length > 1)
  }

  await debugOutput('filtered', filtered)

  return filtered
}
