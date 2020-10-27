import sources from '../sources'
import { debugOutput, sortBy } from '../utils'

export default async function fetch() {
  let all = []

  for (let sourceName in sources) {
    console.log(`Fetching data from ${sourceName}`)

    let data

    try {
      data = await sources[sourceName].fetchData()
    } catch (e) {
      console.error(e)
      continue
    }

    console.log(`Filtering nulls, removing empty points and sorting by date`)

    for (let zone of data) {
      if (zone.points) {
        for (let point of zone.points) {
          for (let [key, value] of Object.entries(point)) {
            if (key !== 'date' && typeof value !== 'number') {
              delete point[key]
            }
          }
        }

        zone.points = zone.points
          .filter((p) => Object.keys(p).length > 1)
          .sort(sortBy('date'))
      }
    }

    all.push(...data)

    await debugOutput(`raw-${sourceName}`, data)
  }

  return all
}
