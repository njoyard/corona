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
import { compareLabels } from 'corona/utils/collection'
import { field, scale, ratio } from 'corona/utils/fields'
import { number } from 'corona/utils/formats'
import { decorate as cached } from 'corona/utils/weak-cache'

const {
  APP: { compareMaxSeries, styleMode }
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

  getOptions(intl, { perCapita }) {
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
          label: labelCallback(this.format, { perCapita }, intl)
        }
      }
    }
  }

  _validChildren(field, zone, truncate = false) {
    let validChildren = zone.children
      .filter((c) => field.canApply(c))
      .sort((a, b) => field.sortValue(b) - field.sortValue(a))

    if (truncate && validChildren.length > compareMaxSeries) {
      let truncated = validChildren.length - compareMaxSeries

      validChildren = validChildren.slice(0, compareMaxSeries)
      validChildren.truncated = truncated
    }

    return validChildren
  }

  @cached
  _validChildrenPerCapita(zone) {
    return this._validChildren(this.pcField, zone)
  }

  @cached
  _validChildrenFullScale(zone) {
    return this._validChildren(this.field, zone)
  }

  @cached
  _allValidChildrenPerCapita(zone) {
    return this._validChildren(this.pcField, zone, false)
  }

  @cached
  _allValidChildrenFullScale(zone) {
    return this._validChildren(this.field, zone, false)
  }

  validChildren(zone, { perCapita }, truncate = true) {
    if (truncate) {
      if (perCapita) {
        return this._validChildrenPerCapita(zone)
      } else {
        return this._validChildrenFullScale(zone)
      }
    } else {
      if (perCapita) {
        return this._allValidChildrenPerCapita(zone)
      } else {
        return this._allValidChildrenFullScale(zone)
      }
    }
  }

  validForZone(zone, options = {}) {
    return this.validChildren(zone, options).length > 1
  }

  legendFor(zone, intl, options) {
    let validChildren = this.validChildren(zone, options)

    if (options.selected) {
      validChildren = validChildren.filter((c) =>
        options.selected.includes(c.id)
      )
    }

    let entries = validChildren
      .map((c, index) => ({
        label: c.label,
        ...compareStyle(styleMode === 'rank' ? c.rank : index)
      }))
      .sort(compareLabels)

    if (validChildren.truncated) {
      entries.push({ type: 'truncate-hint', count: validChildren.truncated })
    }

    return entries
  }

  @cached
  rangeForZone(zone) {
    let { field } = this

    return this.validChildren(zone, {})
      .map((zone) => {
        let points = field.apply(zone)
        let firstValue = points.find((p) => !isNaN(p.value))
        let lastValue =
          firstValue && [...points].reverse().find((p) => !isNaN(p.value))

        return {
          min: firstValue ? firstValue.date : Infinity,
          max: lastValue ? lastValue.date : -Infinity
        }
      })
      .reduce(
        ({ min, max }, { min: thisMin, max: thisMax }) => ({
          min: Math.min(min, thisMin),
          max: Math.max(max, thisMax)
        }),
        { min: Infinity, max: -Infinity }
      )
  }

  dataForZone(zone, options, intl) {
    let { scale, format, field } = this

    let children = this.validChildren(zone, options)

    if (options.selected) {
      children = children.filter((c) => options.selected.includes(c.id))
    }

    return {
      datasets: children.map((child, index) =>
        new ChartSeries(
          null,
          field,
          Object.assign(
            { label: child.label, scale, format },
            compareStyle(styleMode === 'rank' ? child.rank : index)
          )
        ).dataForZone(child, options, intl)
      )
    }
  }
}
