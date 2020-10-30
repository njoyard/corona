const DAY = 86400000

/**************************************
 * Base field classes & helpers
 */

function zipApply(func, argArrays) {
  return argArrays[0].map((_, index) =>
    func(...argArrays.map((arr) => arr[index]))
  )
}

function zipDates(points, values) {
  return points.map((point, index) => ({
    date: point.date,
    value: values[index]
  }))
}

class Field {
  constructor(compute, name) {
    this.compute = compute
    this.name = name || '<unknown>'
    this.applied = new WeakMap()
  }

  canApply() {
    throw new Error('Not implemented')
  }

  apply(zone) {
    let { applied, compute } = this

    if (!applied.has(zone)) {
      applied.set(zone, zipDates(zone.points, compute(zone)))
    }

    return applied.get(zone)
  }
}

class SinglePointField extends Field {
  constructor(get, name) {
    super(({ points }) => points.map(get), name)
  }
}

class MultiField extends Field {
  constructor(fun, fields, name) {
    super(
      (zone) =>
        zipApply(
          fun,
          fields.map((f) => f.apply(zone).map((p) => p.value))
        ),
      name
    )
  }
}

/**************************************
 * Concrete field implementations
 */

class Constant extends SinglePointField {
  constructor(value) {
    super(() => value, `${value}`)
  }

  canApply() {
    return true
  }
}

class Source extends SinglePointField {
  constructor(name) {
    super(
      (point) => (typeof point[name] === 'number' ? point[name] : NaN),
      `${name}`
    )

    this.fieldName = name
  }

  canApply(fields) {
    return fields.has(this.fieldName)
  }
}

class Scale extends MultiField {
  constructor(field, scale) {
    super(
      (a, b) => a * b,
      [field, scale],
      `scale(${field.name} * ${scale.name})`
    )

    this.fields = [field, scale]
  }

  canApply(fields) {
    return this.fields.every((f) => f.canApply(fields))
  }
}

class Ratio extends MultiField {
  constructor(num, denom) {
    super(
      (a, b) => (!isNaN(b) && b !== 0 ? a / b : NaN),
      [num, denom],
      `ratio(${num.name} / ${denom.name})`
    )

    this.fields = [num, denom]
  }

  canApply(fields) {
    return this.fields.every((f) => f.canApply(fields))
  }
}

class Offset extends MultiField {
  constructor(field, offset) {
    super(
      (a, b) => a + b,
      [field, offset],
      `offset(${field.name} / ${offset.name})`
    )

    this.fields = [field, offset]
  }

  canApply(fields) {
    return this.fields.every((f) => f.canApply(fields))
  }
}

class Coalesce extends MultiField {
  constructor(...fields) {
    super(
      (...values) => {
        let value = NaN
        while (isNaN(value) && values.length) {
          value = values.shift()
        }
        return value
      },
      fields,
      `coalesce(${fields.map((f) => f.name).join(', ')})`
    )

    this.fields = fields
  }

  canApply(fields) {
    return this.fields.some((f) => f.canApply(fields))
  }
}

class Lag extends Field {
  constructor(field, days) {
    super((zone) => {
      let points = field.apply(zone)
      let offsets = days.apply(zone)

      return points.map((point, index) => {
        let offset = Math.round(offsets[index].value)

        if (isNaN(offset)) {
          return NaN
        }

        let sourceIndex = index - offset

        if (sourceIndex < 0 || sourceIndex >= points.length) {
          return NaN
        }

        return points[sourceIndex].value
      })
    }, `lag(${field.name},${days.name})`)

    this.fields = [field, days]
  }

  canApply(fields) {
    return this.fields.every((f) => f.canApply(fields))
  }
}

class Change extends Field {
  constructor(field) {
    super((zone) => {
      let points = field.apply(zone)

      return points.map((point, index) => {
        let prev = points[index - 1]
        if (prev && prev.date === point.date - DAY) {
          return point.value - prev.value
        }

        return NaN
      })
    }, `change(${field.name})`)

    this.field = field
  }

  canApply(fields) {
    return this.field.canApply(fields)
  }
}

class Accumulate extends Field {
  constructor(field) {
    super((zone) => {
      let points = field.apply(zone)
      let acc = NaN
      let values = []

      for (let point of points) {
        if (!isNaN(point.value)) {
          if (isNaN(acc)) {
            acc = 0
          }

          acc += point.value
        }

        values.push(acc)
      }

      return values
    }, `accumulate(${field.name})`)

    this.field = field
  }

  canApply(fields) {
    return this.field.canApply(fields)
  }
}

class Weekly extends Field {
  constructor(field) {
    super((zone) => {
      let points = field.apply(zone)
      let values = points.map(({ value }) => value)
      let firstNumber = values.findIndex((v) => !isNaN(v))
      let lastNumber =
        values.length - values.reverse().findIndex((v) => !isNaN(v))

      return points.map(({ date }, index) => {
        if (firstNumber !== -1 && index >= firstNumber && index < lastNumber) {
          let windowValues = [-3, -2, -1, 0, 1, 2, 3]
            .map((offset) => {
              let point = points[index + offset]

              if (
                point &&
                !isNaN(point.value) &&
                Math.abs(point.date - date) <= 3 * DAY
              ) {
                return point.value
              }
            })
            .filter((v) => typeof v === 'number')

          if (windowValues.length) {
            return (
              windowValues.reduce((sum, value) => sum + value, 0) /
              windowValues.length
            )
          }
        }

        return NaN
      })
    }, `weekly(${field.name})`)

    this.field = field
  }

  canApply(fields) {
    return this.field.canApply(fields)
  }
}

/**************************************
 * Field creation helpers
 */

const sourceCache = {}
const constCache = {}

function fieldify(thing) {
  if (Array.isArray(thing)) {
    return thing.map((t) => fieldify(t))
  }

  if (typeof thing === 'number') {
    if (!(thing in constCache)) {
      constCache[thing] = new Constant(thing)
    }

    return constCache[thing]
  }

  if (typeof thing === 'string') {
    if (!(thing in sourceCache)) {
      sourceCache[thing] = new Source(thing)
    }

    return sourceCache[thing]
  }

  if (thing instanceof Field) {
    return thing
  }

  throw new Error(`Cannot fieldify ${thing}`)
}

function fieldifyArgs(func) {
  return (...args) => func(...fieldify(args))
}

const scale = fieldifyArgs((f, s) => new Scale(f, s))
const ratio = fieldifyArgs((n, d) => new Ratio(n, d))
const offset = fieldifyArgs((f, o) => new Offset(f, o))
const change = fieldifyArgs((f) => new Change(f))
const weekly = fieldifyArgs((f) => new Weekly(f))
const accumulate = fieldifyArgs((f) => new Accumulate(f))
const lag = fieldifyArgs((f, o) => new Lag(f, o))
const reverse = fieldifyArgs((f) => scale(f, -1))
const inverse = fieldifyArgs((f) => ratio(1, f))
const coalesce = fieldifyArgs((...fields) => new Coalesce(...fields))
const field = (f) => fieldify(f)

export {
  accumulate,
  change,
  coalesce,
  field,
  inverse,
  lag,
  offset,
  ratio,
  reverse,
  scale,
  weekly
}
