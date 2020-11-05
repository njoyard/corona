import ChartSeries from 'corona/models/chart-series'
import {
  baseOptions,
  baseTooltipOptions,
  labelCallback,
  timeScale,
  timeTitleCallback,
  yScales
} from 'corona/utils/chart-common'

export default class Chart {
  id = null
  series = []
  scales = []
  title = null
  description = null
  custom = null

  static fromCustomRepr(repr) {
    let {
      id,
      t: title,
      d: description,
      s: seriesReprs,
      k: stacked,
      c: scales
    } = repr

    let chart = new Chart(
      id,
      seriesReprs.map((r, index) =>
        ChartSeries.fromCustomRepr(`${id}-series-${index}`, r, stacked)
      ),
      scales.reduce(
        (scales, { s, i, a }) =>
          Object.assign(scales, { [s]: { min: i, max: a } }),
        {}
      )
    )

    Object.assign(chart, {
      custom: repr,
      title,
      description
    })

    return chart
  }

  constructor(id, series, scales) {
    this.id = id
    this.series = series
    this.scales = scales
  }

  getOptions(intl) {
    let { series, scales } = this

    return {
      ...baseOptions,
      scales: {
        x: timeScale,
        ...yScales(series, intl, scales)
      },
      tooltips: {
        ...baseTooltipOptions,
        callbacks: {
          title: timeTitleCallback,
          label: labelCallback(series, intl)
        }
      }
    }
  }

  legendFor(zone, intl) {
    return this.series.map(({ label, id, color, type }) => ({
      label:
        label ||
        (intl.exists(`fields.${id}.long`)
          ? intl.t(`fields.${id}.long`)
          : intl.t(`fields.${id}.short`)),
      color,
      type
    }))
  }

  rangeForZone(zone) {
    return this.series
      .map((s) => s.rangeForZone(zone))
      .reduce(
        ({ min, max }, { min: thisMin, max: thisMax }) => ({
          min: Math.min(min, thisMin),
          max: Math.max(max, thisMax)
        }),
        { min: Infinity, max: -Infinity }
      )
  }

  validForZone(zone) {
    let { series } = this
    let threshold = series.length > 2 ? 2 : 1

    return series.filter((s) => s.validForZone(zone)).length >= threshold
  }

  dataForZone(zone, options, intl) {
    let { series } = this

    return {
      datasets: series.map((s, index) =>
        Object.assign(
          { order: series.length - index },
          s.dataForZone(zone, options, intl)
        )
      )
    }
  }
}
