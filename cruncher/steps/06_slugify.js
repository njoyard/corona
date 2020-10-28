import { debugOutput, slugify } from '../utils'

export default async function slugifyData(data) {
  console.log('Adding slugs')

  let duplicates = new Set()

  for (let zone of data) {
    let levels = zone.zone.split('|')
    let label = levels.pop()
    zone.label = label

    if (label === 'Mainland') {
      label = `${levels.pop()}-${label}`
    }

    if (label === 'Georgia' && zone.parent === 'United States') {
      label = 'US-Georgia'
    }

    let slug = slugify(label)
    if (data.find((z) => z.id === slug)) {
      duplicates.add(slug)
    }

    zone.id = slug
  }

  for (let slug of duplicates) {
    let zones = data.filter((z) => z.id === slug)
    console.warn(
      `  ! duplicate slug ${slug} for: ${zones.map((z) => z.zone).join(', ')}`
    )
  }

  for (let zone of data) {
    if (zone.parent) {
      zone.parent = data.find((z) => z.zone === zone.parent).id
    }
  }

  await debugOutput('slugified', data)

  return data
}
