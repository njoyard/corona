function aggregate(data) {
  let { _meta, _points } = data
  let { fields, population } = _meta

  let hasRegions = false
  let fieldsInAllRegions = null
  let allRegionsHavePopulation = true
  let totalPopulation = 0

  let allFields = new Set([...fields])

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

    regionMeta.fields.forEach((field) => allFields.add(field))

    // Sum populations
    if (!population && allRegionsHavePopulation) {
      if (regionMeta.population) {
        totalPopulation += regionMeta.population
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
            _points.push(totalPoint)
          }

          for (let field of totalizeFields) {
            totalPoint[field] = (totalPoint[field] || 0) + point[field]
          }
        }
      }
    }
  }

  _meta.allFields = allFields
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

export { aggregate, filter }
