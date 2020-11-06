import { alpha, colors } from 'corona/utils/colors'
import { field, ratio, scale } from 'corona/utils/fields'
import parse from 'corona/utils/field-parser'
import { number, percent } from 'corona/utils/formats'
import { decorate as cached } from 'corona/utils/weak-cache'

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
    this.pcField = scale(100000, ratio(field, 'population'))

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

  @cached
  rangeForZone(zone) {
    let { field: f } = this

    let points = field(f).apply(zone)
    let firstValue = points.find((p) => !isNaN(p.value))
    let lastValue =
      firstValue && [...points].reverse().find((p) => !isNaN(p.value))

    return {
      min: firstValue ? firstValue.date : Infinity,
      max: lastValue ? lastValue.date : -Infinity
    }
  }

  dataForZone(zone, { perCapita, start, end }, intl) {
    let {
      id,
      label,
      field: f,
      pcField,
      type,
      color,
      scale: yScale,
      stack
    } = this

    let dataField = perCapita && yScale === 'count' ? pcField : field(f)

    let dataset = {
      id,
      label: label || intl.t(`fields.${id}.short`),
      fill: false,
      yAxisID: yScale,
      borderWidth: 2,
      backgroundColor: alpha(color, type === 'bar' ? 0.5 : 0.75),
      borderColor: alpha(color, type === 'bar' ? 0.5 : 0.75),
      normalized: true,
      data: dataField
        .apply(zone)
        .filter(
          ({ date, value }) =>
            (!start || date >= start) &&
            (!end || date <= end) &&
            !isNaN(value) &&
            (yScale !== 'log' || value !== 0)
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
      dataset.borderDash = [3, 5]
    }

    if (stack) {
      dataset.stack = stack
    }

    return dataset
  }
}
