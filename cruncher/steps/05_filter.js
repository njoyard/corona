import { debugOutput } from '../utils'

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

      // Delete field in all points until the first non zero value
      for (let i = 0; i < firstNonZero; i++) {
        delete zone.points[i][field]
      }
    }

    // Remove empty points
    zone.points = zone.points.filter((p) => Object.keys(p).length > 1)
  }

  await debugOutput('filtered', filtered)

  return filtered
}
