import { gray, alpha, allColors } from 'corona/utils/colors'
import { field } from 'corona/utils/fields'
import parse from 'corona/utils/field-parser'
import { number, percent } from 'corona/utils/formats'

export default class ChartSeries {
  id = null
  field = null
  color = null
  custom = null

  static fromCustomRepr(id, repr, stacked) {
    let { l: label, e: expr, c: colorName, t: type, s: scale } = repr

    let series = new ChartSeries(id, parse(expr), {
      label,
      type,
      scale,
      stack: stacked && type === 'bar' ? 'stack' : null,
      format: scale === 'percent' ? percent : number,
      color: alpha(allColors[colorName], 0.75)
    })

    Object.assign(series, {
      custom: repr
    })

    return series
  }

  constructor(id, field, options = {}) {
    this.id = id
    this.field = field

    Object.assign(
      this,
      { type: 'line', color: gray, scale: 'count', format: number },
      options
    )
  }

  validForZone(zone) {
    let { field: f } = this
    return field(f).canApply(zone.fields)
  }

  dataForZone(zone, intl) {
    let { id, label, field: f, type, color, scale, stack } = this

    let dataset = {
      id,
      label: label || intl.t(`fields.${id}`),
      fill: false,
      yAxisID: scale,
      backgroundColor: color.bright,
      borderColor: color.normal,
      normalized: true,
      data: field(f)
        .apply(zone)
        .filter(
          ({ value }) => !isNaN(value) && (scale !== 'log' || value !== 0)
        )
        .map(({ date, value }) => ({
          x: date,
          y: value
        }))
    }

    if (type === 'points') {
      dataset.type = 'line'
      dataset.showLine = false
      dataset.pointRadius = 2
    } else {
      dataset.type = type
    }

    if (type === 'bar') {
      dataset.barPercentage = 1
      dataset.categoryPercentage = 0.95
    }

    if (type === 'line') {
      dataset.spanGaps = true
      dataset.pointRadius = 0
    }

    if (stack) {
      dataset.stack = stack
    }

    return dataset
  }
}
