import config from 'corona/config/environment'
import ChartSeries from 'corona/models/chart-series'
import {
  baseOptions,
  baseTooltipOptions,
  compareStyle,
  labelCallback,
  timeScale,
  timeTitleCallback,
  yScales
} from 'corona/utils/chart-common'
import { compareFields } from 'corona/utils/chart-definitions'
import { field, scale, ratio } from 'corona/utils/fields'
import { number } from 'corona/utils/formats'

const {
  APP: { compareMaxSeries }
} = config

export default class CompareChart {
  id = null
  scale = 'count'
  format = number

  isCompareChart = true

  static fieldCache = {}

  static create(id) {
    if (!CompareChart.fieldCache[id]) {
      if (compareFields[id]) {
        let { field, options } = compareFields[id]
        CompareChart.fieldCache[id] = new CompareChart(id, field, options)
      }
    }

    return CompareChart.fieldCache[id]
  }

  constructor(id, f, options = {}) {
    Object.assign(
      this,
      { id, field: field(f), pcField: scale(100000, ratio(f, 'population')) },
      options
    )
  }

  getOptions(intl) {
    return {
      ...baseOptions,
      scales: {
        x: timeScale,
        ...yScales([{ scale: this.scale }], intl)
      },
      tooltips: {
        ...baseTooltipOptions,
        callbacks: {
          title: timeTitleCallback,
          label: labelCallback(this.format, intl)
        }
      }
    }
  }

  validChildren(zone, { perCapita }) {
    let cacheKey = perCapita ? 'zoneChildrenCachePC' : 'zoneChildrenCache'

    if (!this[cacheKey]) {
      this[cacheKey] = new WeakMap()
    }

    if (!this[cacheKey].has(zone)) {
      let field = perCapita ? this.pcField : this.field

      this[cacheKey].set(
        zone,
        zone.children
          .filter((c) => field.canApply(c))
          .sort((a, b) => this.field.sortValue(b) - this.field.sortValue(a))
          .slice(0, compareMaxSeries)
      )
    }

    return this[cacheKey].get(zone)
  }

  validForZone(zone, options = {}) {
    return this.validChildren(zone, options).length > 1
  }

  legendFor(zone, intl, options) {
    return this.validChildren(zone, options)
      .map(({ label }, index) => ({
        label,
        ...compareStyle(index)
      }))
      .sort(({ label: a }, { label: b }) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  dataForZone(zone, options, intl) {
    let { scale, format, field } = this

    return {
      datasets: this.validChildren(zone, options).map((zone, index) =>
        new ChartSeries(
          null,
          field,
          Object.assign(
            { label: zone.label, scale, format },
            compareStyle(index)
          )
        ).dataForZone(zone, options, intl)
      )
    }
  }
}
