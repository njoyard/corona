function avg(array) {
  return array.reduce((sum, item) => sum + item, 0) / array.length
}

function derive(field) {
  return {
    depends: [field],
    compute: (point, context) => {
      if (!context.prev) {
        context.prev = 0
      }

      let value = point[field]
      let change = value - context.prev
      context.prev = value

      return change
    }
  }
}

function movingAverage(field, over = 1) {
  return {
    depends: [field],
    compute: (point, context) => {
      if (!context.values) {
        context.values = [...Array(over)].map(() => 0)
      }

      context.values.push(point[field])
      context.values.shift()

      return avg(context.values)
    }
  }
}

const computedFields = {
  confirmedChange: derive('confirmed'),
  confirmedWeeklyChange: movingAverage('confirmedChange', 7),

  recoveredChange: derive('recovered'),
  recoveredWeeklyChange: movingAverage('recoveredChange', 7),

  deceasedChange: derive('deceased'),
  deceasedWeeklyChange: movingAverage('deceasedChange', 7),

  active: {
    depends: ['confirmed', 'recovered', 'deceased'],
    compute(point) {
      return point.confirmed - (point.recovered + point.deceased)
    }
  },
  activeChange: derive('active'),
  activeWeeklyChange: movingAverage('activeChange', 7)
}

let fieldOrder = []
for (let field in computedFields) {
  let { depends } = computedFields[field]

  for (let dependency of (depends || []).filter((f) => f in computedFields)) {
    if (fieldOrder.indexOf(dependency) === -1) fieldOrder.push(dependency)
  }

  if (fieldOrder.indexOf(field) === -1) fieldOrder.push(field)
}

function compute(points) {
  let contexts = fieldOrder.reduce((ctxts, field) => {
    ctxts[field] = {}
    return ctxts
  }, {})

  for (let point of points) {
    for (let field of fieldOrder) {
      let { compute } = computedFields[field]
      let context = contexts[field]

      point[field] = compute(point, context)
    }
  }
}

export default compute
