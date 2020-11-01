import { alpha, colors } from 'corona/utils/colors'
import { field } from 'corona/utils/fields'
import parse from 'corona/utils/field-parser'
import { number, percent } from 'corona/utils/formats'

export default class ChartSeries {
  id = null
  field = null
  color = null
  custom = null

  static fromCustomRepr(id, repr, stacked) {
    let { l: label, e: expr, c: color, t: type, s: scale } = repr

    let series = new ChartSeries(id, parse(expr), {
      label,
      type,
      scale,
      stack: stacked && type === 'bar' ? 'stack' : null,
      format: scale === 'percent' ? percent : number,
      color: type === 'point' ? alpha(color, 0.75) : color
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
      { type: 'line', color: colors.grey, scale: 'count', format: number },
      options
    )
  }

  validForZone(zone) {
    let { field: f } = this
    return field(f).canApply(zone)
  }

  dataForZone(zone, intl) {
    let { id, label, field: f, type, color, scale, stack } = this

    let dataset = {
      id,
      label: label || intl.t(`fields.${id}`),
      fill: false,
      yAxisID: scale,
      borderWidth: 2,
      backgroundColor: alpha(color, type === 'bar' ? 0.5 : 0.75),
      borderColor: alpha(color, type === 'bar' ? 0.5 : 0.75),
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
    } else if (type === 'dotted') {
      dataset.type = 'line'
    } else if (type === 'thin' || type === 'dashed') {
      dataset.type = 'line'
      dataset.borderWidth = 1
    } else {
      dataset.type = type
    }

    if (type === 'bar') {
      dataset.barPercentage = 1
      dataset.categoryPercentage = 1
      dataset.borderWidth = 0
    }

    if (
      type === 'line' ||
      type === 'thin' ||
      type === 'dashed' ||
      type === 'dotted'
    ) {
      dataset.spanGaps = true
      dataset.pointRadius = 0
    }

    if (type === 'dashed') {
      dataset.borderDash = [5, 5]
    } else if (type === 'dotted') {
      dataset.borderDash = [2, 5]
    }

    if (stack) {
      dataset.stack = stack
    }

    return dataset
  }
}
