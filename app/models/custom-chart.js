import { A } from '@ember/array'
import { tracked } from '@glimmer/tracking'

import CustomSeries from 'corona/models/custom-series'

class CustomChartScaleConfig {
  @tracked scale
  @tracked _min = null
  @tracked _max = null

  constructor(scale) {
    this.scale = scale
  }

  get repr() {
    let { scale, min, max } = this
    return { s: scale, i: min, a: max }
  }

  get min() {
    return this._min
  }

  get max() {
    return this._max
  }

  _value(v) {
    if (typeof v === 'string') {
      if (v.trim() === '') return null
      return Number(v)
    }

    return v
  }

  set min(v) {
    this._min = this._value(v)
  }

  set max(v) {
    this._max = this._value(v)
  }
}

export default class CustomChart {
  @tracked id
  @tracked title
  @tracked description
  @tracked stacked = false
  @tracked scales
  @tracked series = A([])

  constructor() {
    this.scales = A(
      ['count', 'percent', 'log'].map(
        (scale) => new CustomChartScaleConfig(scale)
      )
    )
  }

  get repr() {
    let { id, title, description, series, stacked, scales } = this

    return {
      id,
      t: title,
      d: description,
      s: series.filter((s) => s.errors.length === 0).map((s) => s.repr),
      c: scales
        .filter((s) => series.find((ss) => ss.scale === s.scale))
        .map((s) => s.repr),
      k: stacked
    }
  }

  get activeScales() {
    let { scales, series } = this
    return scales.filter((s) => series.find((ss) => ss.scale === s.scale))
  }

  static fromRepr(repr, intl, allFields) {
    let {
      id,
      t: title,
      d: description,
      s: seriesReprs,
      k: stacked,
      c: scales
    } = repr

    let chart = new CustomChart()
    Object.assign(chart, { id, title, description, stacked })

    for (let { s: scale, i: min, a: max } of scales) {
      Object.assign(
        chart.scales.find((s) => s.scale === scale),
        { min, max }
      )
    }

    chart.series.pushObjects(
      seriesReprs.map((r) => CustomSeries.fromRepr(r, intl, allFields))
    )

    return chart
  }
}
