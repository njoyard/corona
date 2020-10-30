import { A } from '@ember/array'
import { tracked } from '@glimmer/tracking'

import CustomSeries from 'corona/models/custom-series'

export default class CustomChart {
  @tracked id
  @tracked title
  @tracked description
  @tracked stacked = false

  series = A([])

  get repr() {
    let { title, description, series, stacked } = this

    return {
      t: title,
      d: description,
      s: series.filter((s) => s.errors.length === 0).map((s) => s.repr),
      k: stacked
    }
  }

  static fromRepr(repr, intl, allFields) {
    let { id, t: title, d: description, s: seriesReprs, k: stacked } = repr

    let chart = new CustomChart()
    Object.assign(chart, { id, title, description, stacked })

    chart.series.pushObjects(
      seriesReprs.map((r) => CustomSeries.fromRepr(r, intl, allFields))
    )

    return chart
  }
}
