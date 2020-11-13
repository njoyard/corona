import { debugOutput } from '../utils'

function rankZone(zone, data) {
  let children = data.filter((z) => z.parent === zone)

  for (let child of children) {
    rankZone(child.id, data)

    if (child.meta.fields.includes('confirmed')) {
      // Rank by max confirmed
      child.rankValue = Math.max(
        ...child.points.filter((p) => 'confirmed' in p).map((p) => p.confirmed)
      )
    } else if (child.meta.fields.includes('positives')) {
      // Rank by sum of positives
      child.rankValue = child.points
        .filter((p) => 'positives' in p)
        .map((p) => p.positives)
        .reduce((sum, value) => sum + value, 0)
    } else if (child.meta.fields.includes('deceased')) {
      // Rank by max deceased
      child.rankValue = Math.max(
        ...child.points.filter((p) => 'deceased' in p).map((p) => p.deceased)
      )
    }

    if (!('rankValue' in child)) {
      console.log(
        `  ! no ranking field for ${child.id}: ${child.meta.fields.join(', ')}`
      )
    }

    if (isNaN(child.rankValue)) {
      console.log(`  ! NaN rank value for ${child.id}`)
    }
  }

  children.sort(({ rankValue: a }, { rankValue: b }) => b - a)

  for (let i = 0; i < children.length; i++) {
    children[i].meta.rank = i
    delete children[i].rankValue
  }
}

export default async function rankRegions(data) {
  console.log('Ranking regions')

  rankZone('world', data)
  await debugOutput('ranked', data)

  return data
}
