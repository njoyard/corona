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

    Object.values(data).forEach((z) => z.points.sort(sortBy('date')))

    all.push(...data)

    await debugOutput(`raw-${sourceName}`, data)
  }

  return all
}
