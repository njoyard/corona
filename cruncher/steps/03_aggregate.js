import { debugOutput, intersect, union } from '../utils'

function createIntermediateZones(data) {
  let zones = new Set()

  for (let { zone } of data) {
    let levels = zone.split('|')
    for (let count = 1; count <= levels.length; count++) {
      zones.add(levels.slice(0, count).join('|'))
    }
  }

  let all = [
    { zone: 'World' },
    ...[...zones].map((z) => {
      let levels = z.split('|')
      let parent =
        levels.length === 1
          ? 'World'
          : levels.slice(0, levels.length - 1).join('|')

      return { zone: z, parent }
    })
  ]

  for (let { zone, parent } of all) {
    let existing = data.find((z) => z.zone === zone)

    if (!existing) {
      data.push({ zone, parent, meta: { fields: [] }, points: [] })
    } else {
      existing.parent = parent
    }
  }
}

function aggregateZone(zone, data) {
  let children = data.filter(({ parent }) => parent === zone)

  if (!children.length) {
    return
  }

  // Depth first
  for (let { zone } of children) {
    aggregateZone(zone, data)
  }

  let { points, meta } = data.find((z) => z.zone === zone)

  // Aggregate only fields that all children have
  let aggregateFields = [...intersect(...children.map((c) => c.meta.fields))]
  meta.fields = [...union(meta.fields, aggregateFields)]

  if (!aggregateFields.length) {
    console.warn(`Nothing to aggregate into ${zone}`)
    for (let c of children) {
      console.warn(`  in ${c.zone}: ${c.meta.fields.join(', ')}`)
    }
  }

  console.log(
    `  ${zone}: aggregating fields ${aggregateFields.sort().join(', ')}`
  )

  let childPoints = children.reduce(
    (all, { points }) => [...all, ...points],
    []
  )

  let allDates = [...new Set(childPoints.map((p) => p.date))].sort()

  for (let date of allDates) {
    let point = points.find((p) => p.date === date)

    if (!point) {
      point = aggregateFields.reduce(
        (p, field) => Object.assign(p, { [field]: 0 }),
        { date }
      )

      let insertAt = points.findIndex((p) => p.date > date)
      if (insertAt === -1) {
        points.push(point)
      } else {
        points.splice(insertAt, 0, point)
      }
    }

    let matchingPoints = childPoints.filter((p) => p.date === date)
    for (let field of aggregateFields) {
      point[field] += matchingPoints.reduce((sum, p) => sum + p[field], 0)
    }
  }
}

export default async function aggregate(data) {
  console.log('Aggregating zone data')

  createIntermediateZones(data)
  aggregateZone('World', data)

  debugOutput('aggregated', data)

  return data
}
