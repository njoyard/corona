import ChartSeries from 'corona/models/chart-series'
import {
  baseOptions,
  labelCallback,
  timeScale,
  timeTitleCallback,
  yScales
} from 'corona/utils/chart-common'

export default class Chart {
  id = null
  series = []
  title = null
  description = null
  custom = null

  static fromCustomRepr(repr) {
    let { id, t: title, d: description, s: seriesReprs, k: stacked } = repr

    let chart = new Chart(
      id,
      seriesReprs.map((r, index) =>
        ChartSeries.fromCustomRepr(`${id}-series-${index}`, r, stacked)
      )
    )

    Object.assign(chart, {
      custom: repr,
      title,
      description
    })

    return chart
  }

  constructor(id, series) {
    this.id = id
    this.series = series
  }

  getOptions(intl) {
    let { series } = this

    return {
      ...baseOptions,
      scales: {
        x: timeScale,
        ...yScales(series, intl)
      },
      tooltips: {
        callbacks: {
          title: timeTitleCallback,
          label: labelCallback(series, intl)
        }
      }
    }
  }

  validForZone(zone) {
    let { series } = this
    let threshold = series.length > 2 ? 2 : 1

    return series.filter((s) => s.validForZone(zone)).length >= threshold
  }

  dataForZone(zone, intl) {
    let { series } = this

    return {
      datasets: series.map((s, index) =>
        Object.assign(
          { order: series.length - index },
          s.dataForZone(zone, intl)
        )
      )
    }
  }
}
