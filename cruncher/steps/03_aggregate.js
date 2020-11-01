import { debugOutput, union } from '../utils'
import continents from '../sources/continents'

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
    ...Object.keys(continents).map((c) => ({ zone: c, parent: 'World' })),
    ...[...zones].map((z) => {
      let levels = z.split('|')
      let parent =
        levels.length === 1
          ? Object.keys(continents).find((c) =>
              continents[c].includes(levels[0])
            )
          : levels.slice(0, levels.length - 1).join('|')

      if (!parent) {
        console.warn(`  ! no parent for ${levels.join('|')}`)
        parent = 'World'
      }

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

  // Extract available fields from children
  let allChildFields = union(...children.map((c) => c.meta.fields))

  // Aggregate population
  if (!meta.population) {
    meta.population = children.reduce(
      (pop, child) => pop + (child.meta.population || 0),
      0
    )
  }

  // Aggregate fields that are in 90% of children
  let aggregateFields = new Set(
    [...allChildFields].filter(
      (field) =>
        children.filter((c) => c.meta.fields.includes(field)).length /
          children.length >
        0.9
    )
  )

  // Do not aggregate fields that parent already has
  for (let field of meta.fields) {
    aggregateFields.delete(field)
  }

  aggregateFields = [...aggregateFields]
  meta.fields = [...union(meta.fields, aggregateFields)]

  if (!aggregateFields.length) {
    console.warn(`  ! nothing to aggregate in ${zone}`)

    if (process.env.DEBUG_OUTPUT) {
      console.warn(`    already have: ${meta.fields.join(', ')}`)

      for (let c of children) {
        console.warn(`    in ${c.zone}: ${c.meta.fields.join(', ')}`)
      }
    }

    return
  }

  let childPoints = children.reduce(
    (all, { points }) => [...all, ...points],
    []
  )

  let allDates = [...new Set(childPoints.map((p) => p.date))].sort()

  for (let date of allDates) {
    let point = points.find((p) => p.date === date)

    if (!point) {
      point = { date }

      let insertAt = points.findIndex((p) => p.date > date)
      if (insertAt === -1) {
        points.push(point)
      } else {
        points.splice(insertAt, 0, point)
      }
    }

    let matchingPoints = childPoints.filter((p) => p.date === date)

    if (matchingPoints.length) {
      for (let field of aggregateFields) {
        let usablePoints = matchingPoints.filter((p) => field in p)

        if (usablePoints.length) {
          point[field] = usablePoints.reduce((sum, p) => sum + p[field], 0)
        }
      }
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
