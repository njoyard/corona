import { gray } from 'corona/utils/colors'
import { field } from 'corona/utils/fields'
import { number } from 'corona/utils/formats'

export default class ChartSeries {
  id = null
  field = null
  color = null
  secondaryAxis = false

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
    let { id, field: f, type, color, scale, stack } = this

    let dataset = {
      id,
      label: intl.t(`fields.${id}`),
      fill: false,
      yAxisID: scale,
      backgroundColor: color.bright,
      borderColor: color.normal,
      normalized: true,
      data: field(f)
        .apply(zone)
        .filter(({ value }) => !isNaN(value))
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
