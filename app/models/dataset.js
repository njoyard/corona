import delay from 'corona/utils/delay'
import { aggregate, filter } from 'corona/utils/aggregate'

function initializeLevel(typeLabel) {
  return { _points: [], _meta: { fields: new Set(), typeLabel } }
}

function gather(world, dataFilter) {
  return function (levels, points, population, levelLabels) {
    if (dataFilter && !dataFilter(levels)) return

    let cur = world

    levels.forEach((level, index) => {
      let label = levelLabels[index]

      if (!(level in cur)) {
        cur[level] = initializeLevel(label)
      }
      cur = cur[level]
    })

    let { _points, _meta } = cur

    Object.keys(points[0])
      .filter((key) => key !== 'date')
      .forEach((key) => _meta.fields.add(key))

    for (let point of points) {
      let existing = _points.find((p) => p.date === point.date)

      if (existing) {
        Object.assign(existing, point)
      } else {
        _points.push(point)
      }
    }

    if (population) {
      _meta.population = population
    }
  }
}

export default class Dataset {
  constructor({
    title,
    description,
    sources,
    maxDepth,
    dataFilter,
    postFilter
  }) {
    this.title = title
    this.description = description
    this.sources = sources

    this.maxDepth = maxDepth
    this.dataFilter = dataFilter
    this.postFilter = postFilter
  }

  async fetchData(updateState) {
    let { sources, maxDepth, dataFilter, postFilter } = this
    let world = initializeLevel()

    updateState('fetching data')

    await Promise.all(
      sources.map((source) => source.fetchData(gather(world, dataFilter)))
    )

    updateState('aggregating and filtering data')

    let label = 'World'
    let data = world

    await delay(() => {
      aggregate(world)
      filter(world, maxDepth, postFilter)

      // Move toplevel down while it has only 1 region
      while (
        Object.keys(data).filter((key) => !key.startsWith('_')).length === 1
      ) {
        let [key] = Object.keys(data).filter((key) => !key.startsWith('_'))
        label = key
        data = data[key]
      }
    })

    return { label, data }
  }
}
