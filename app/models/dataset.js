function initializeLevel() {
  return { _points: [], _meta: { fields: new Set() } }
}

function gather(world, dataFilter) {
  return function (levels, points, population) {
    if (dataFilter && !dataFilter(levels)) return

    let cur = world
    for (let level of levels) {
      if (!(level in cur)) {
        cur[level] = initializeLevel()
      }
      cur = cur[level]
    }

    if (!cur._points) {
      cur._points = []
    }

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

function aggregate(data) {
  let { _meta, _points } = data
  let { fields, population } = _meta

  let hasRegions = false
  let fieldsInAllRegions = null
  let allRegionsHavePopulation = true
  let totalPopulation = 0

  for (let region in data) {
    if (region.startsWith('_')) continue

    hasRegions = true

    aggregate(data[region])
    let { _meta: regionMeta } = data[region]

    // Intersect lists of fields from each region
    if (!fieldsInAllRegions) {
      fieldsInAllRegions = new Set([...regionMeta.fields])
    } else {
      fieldsInAllRegions = new Set(
        [...regionMeta.fields].filter((field) => fieldsInAllRegions.has(field))
      )
    }

    // Sum populations
    if (!population && allRegionsHavePopulation) {
      if (regionMeta.population) {
        totalPopulation + regionMeta.population
      } else {
        allRegionsHavePopulation = false
      }
    }
  }

  if (hasRegions) {
    if (!population && allRegionsHavePopulation) {
      _meta.population = totalPopulation
    }

    // Totalize fields that all regions have but we don't already have
    let totalizeFields = new Set()

    for (let field of fieldsInAllRegions) {
      if (!fields.has(field)) {
        fields.add(field)
        totalizeFields.add(field)
      }
    }

    if (totalizeFields.size) {
      for (let region in data) {
        if (region.startsWith('_')) continue

        let { _points: regionPoints } = data[region]

        for (let point of regionPoints) {
          let totalPoint = _points.find((p) => p.date === point.date)

          if (!totalPoint) {
            totalPoint = { date: point.date }

            for (let field of totalizeFields) {
              totalPoint[field] = 0
            }

            _points.push(totalPoint)
          }

          for (let field of totalizeFields) {
            totalPoint[field] += point[field]
          }
        }
      }
    }
  }

  _points.sortBy('date')
}

function filter(data, maxDepth, postFilter, depth = 0) {
  for (let region in data) {
    if (region.startsWith('_')) continue

    if (depth >= maxDepth) {
      delete data[region]
    } else {
      filter(data[region], maxDepth, postFilter, depth + 1)

      if (postFilter) {
        let points = data[region]._points
        if (!postFilter(points[points.length - 1])) {
          delete data[region]
        }
      }
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

  async fetchData() {
    let { sources, maxDepth, dataFilter, postFilter } = this
    let world = initializeLevel()

    await Promise.all(
      sources.map((source) => source.fetchData(gather(world, dataFilter)))
    )

    aggregate(world)
    filter(world, maxDepth, postFilter)

    let label = 'World'
    let data = world

    // Move toplevel down while it has only 1 region
    while (
      Object.keys(data).filter((key) => !key.startsWith('_')).length === 1
    ) {
      let [key] = Object.keys(data).filter((key) => !key.startsWith('_'))
      label = key
      data = data[key]
    }

    return { label, data }
  }
}
