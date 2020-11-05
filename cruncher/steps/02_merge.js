import { nextByDate, debugOutput } from '../utils'

// Merges data
// Output has exactly one point set for each zone, with one point for each date
export default async function merge(data) {
  console.log('Merging zones')

  let initialCount = data.length

  let zones = [...new Set(data.map((z) => z.zone))]
  let merged = zones.map((zone) => {
    let entries = data.filter((z) => z.zone === zone)
    let output = {
      zone,
      meta: Object.assign({}, ...entries.map((e) => e.meta)),
      points: []
    }

    let points = output.points
    let pointSets = entries
      .map((e) => e.points)
      .filter((p) => p && p.length > 0)

    if (pointSets.length) {
      let nextPoint
      let lastPoint = nextByDate(pointSets)

      points.push(lastPoint)

      while ((nextPoint = nextByDate(pointSets))) {
        if (nextPoint.date === lastPoint.date) {
          Object.assign(lastPoint, nextPoint)
        } else {
          points.push(nextPoint)
          lastPoint = nextPoint
        }
      }

      output.meta.fields = [
        ...output.points.reduce((fields, point) => {
          for (let key of Object.keys(point)) {
            if (key !== 'date') {
              fields.add(key)
            }
          }

          return fields
        }, new Set())
      ]
    } else {
      output.meta.fields = []
    }

    return output
  })

  await debugOutput('merged', merged)

  console.log(`  merged ${initialCount} zones into ${merged.length}`)

  return merged
}
