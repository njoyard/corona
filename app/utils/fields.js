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

/* Field definitions:
    - order defines field order in Y axis selection radio group
    - label sets selection radio label (should be absent for derivative fields)
    - detail (optional) adds a question mark with a tooltip next to radio label
    - cases (optional) marks the field as usable for counting cases (for "days since Nth case" on X axis and sorting regions)
    - yLabel (optional) sets the label to use on the graph Y axis, defaults to lowercased label
    - hue/saturation/lightness sets the color for single-country graphs

   For computed fields, additionally:
    - compute(point, context) must return the field value for a given point; will be called
      once for each point in a dataset (ordered by date); context is an object that may be used
      to save data between calls, it is reset for each region
    - depends (optional) lists other field names this field requires

   Note: daily changes and weekly moving average are automatically computed for each field.
 */

const fields = {
  confirmed: {
    order: 1,
    label: 'Confirmed cases',
    cases: true,
    hue: 50,
    saturation: 60,
    lightness: 65
  },

  hospital: {
    order: 2,
    label: 'In hospital',
    yLabel: 'hospitalized cases',
    cases: true,
    hue: 50,
    saturation: 60,
    lightness: 65
  },

  intensive: {
    order: 3,
    label: 'In intensive care',
    yLabel: 'cases in intensive care',
    hue: 20,
    saturation: 60,
    lightness: 65
  },

  deceased: {
    order: 4,
    label: 'Deaths',
    hue: 0,
    saturation: 0,
    lightness: 40
  },

  recovered: {
    order: 5,
    label: 'Recoveries',
    yLabel: 'recovered cases',
    hue: 220,
    saturation: 60,
    lightness: 65
  },

  active: {
    order: 6,
    label: 'Active (estimated)',
    yLabel: 'estimated active cases',
    detail:
      'Computed by subtracting deaths and recoveries from confirmed cases',
    hue: 20,
    saturation: 60,
    lightness: 65,
    depends: ['confirmed', 'recovered', 'deceased'],
    compute(point) {
      return point.confirmed - (point.recovered + point.deceased)
    }
  }
}

for (let field in fields) {
  fields[`${field}Change`] = derive(field)
  fields[`${field}WeeklyChange`] = movingAverage(`${field}Change`, 7)
}

const fieldOrder = []
for (let field in fields) {
  let { depends, compute } = fields[field]
  if (!compute) continue

  for (let dependency of (depends || []).filter(
    (f) => f in fields && fields[f].compute
  )) {
    if (fieldOrder.indexOf(dependency) === -1) fieldOrder.push(dependency)
  }

  if (fieldOrder.indexOf(field) === -1) fieldOrder.push(field)
}

function computeFields(data) {
  for (let region in data) {
    if (region.startsWith('_')) continue
    computeFields(data[region])
  }

  let {
    _points: points,
    _meta: { fields: fieldsPresent, allFields: allFieldsPresent }
  } = data

  let contexts = fieldOrder.reduce((ctxts, field) => {
    ctxts[field] = {}
    return ctxts
  }, {})

  for (let point of points) {
    for (let field of fieldOrder) {
      let { depends, compute } = fields[field]
      if (depends.find((f) => !fieldsPresent.has(f))) continue

      point[field] = compute(point, contexts[field])
      fieldsPresent.add(field)
      allFieldsPresent.add(field)
    }
  }
}

function sortFields(a, b) {
  return fields[a].order - fields[b].order
}

export { fields, computeFields, sortFields }
