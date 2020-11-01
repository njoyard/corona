import config from 'corona/config/environment'
import ChartSeries from 'corona/models/chart-series'
import {
  baseOptions,
  compareStyle,
  labelCallback,
  timeScale,
  timeTitleCallback,
  yScales
} from 'corona/utils/chart-common'
import { compareFields } from 'corona/utils/chart-definitions'
import { field } from 'corona/utils/fields'
import { number } from 'corona/utils/formats'

const {
  APP: { compareMaxSeries }
} = config

export default class CompareChart {
  id = null
  scale = 'count'
  format = number

  isCompareChart = true

  static create(id) {
    if (compareFields[id]) {
      let { field, options } = compareFields[id]
      return new CompareChart(id, field, options)
    }
  }

  constructor(id, f, options = {}) {
    Object.assign(this, { id, field: field(f) }, options)
  }

  getOptions(intl) {
    return {
      ...baseOptions,
      scales: {
        x: timeScale,
        ...yScales([{ scale: this.scale }], intl)
      },
      tooltips: {
        callbacks: {
          title: timeTitleCallback,
          label: labelCallback(this.format, intl)
        }
      }
    }
  }

  validChildren(zone) {
    if (!this.zoneChildrenCache) {
      this.zoneChildrenCache = new WeakMap()
    }

    if (!this.zoneChildrenCache.has(zone)) {
      this.zoneChildrenCache.set(
        zone,
        zone.children
          .filter((c) => this.field.canApply(c))
          .sort(
            (a, b) =>
              this.field.mostRecentValue(b) - this.field.mostRecentValue(a)
          )
          .slice(0, compareMaxSeries)
      )
    }

    return this.zoneChildrenCache.get(zone)
  }

  validForZone(zone) {
    return this.validChildren(zone).length > 1
  }

  dataForZone(zone, intl) {
    let { scale, format, field } = this

    return {
      datasets: this.validChildren(zone).map((zone, index) =>
        new ChartSeries(
          null,
          field,
          Object.assign(
            { label: zone.label, scale, format },
            compareStyle(index)
          )
        ).dataForZone(zone, intl)
      )
    }
  }
}
