import Controller from '@ember/controller'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { tracked } from '@glimmer/tracking'

import config from 'corona/config/environment'

const {
  APP: { dataThreshold }
} = config

const DAY = 86400000

export default class ChartZoneController extends Controller {
  @service intl
  @service routing

  queryParams = [
    { multi: 'm' },
    { perCapita: 'c' },
    { rangeStart: 'f' },
    { rangeEnd: 't' }
  ]

  /*********************************
   * Aliases
   */

  get chart() {
    return this.model.chart
  }

  get zone() {
    return this.model.zone
  }

  get isCompareChart() {
    return this.chart.isCompareChart
  }

  /*********************************
   * Multi option
   */

  @tracked multi = false

  get hasMultiOption() {
    return !this.isCompareChart
  }

  /*********************************
   * Per capita option
   */

  @tracked perCapita = false

  get hasPerCapitaOption() {
    let {
      zone: { zone },
      zones,
      isCompareChart,
      chart
    } = this

    let checkedZones = isCompareChart ? zone.children : zones
    let hasCountSeries = isCompareChart
      ? chart.scale === 'count'
      : chart.series.some((s) => (s.scale || 'count') === 'count')

    return checkedZones.every((z) => z.population) && hasCountSeries
  }

  /*********************************
   * Date range
   */

  @tracked rangeStart = null
  @tracked rangeEnd = null
  @tracked pending = false
  @tracked pendingStart = null
  @tracked pendingEnd = null

  get hasRangeOption() {
    return true
  }

  rangeStep = DAY
  rangeMinDistance = dataThreshold * DAY

  get rangeMin() {
    let {
      zone: {
        zone: { points }
      }
    } = this
    let { date } = points[0]
    return date
  }

  get rangeMax() {
    let {
      zone: {
        zone: { points }
      }
    } = this
    let { date } = points[points.length - 1]
    return date
  }

  get displayStart() {
    let { rangeStart, pending, pendingStart, rangeMin } = this
    let start = pending ? pendingStart : rangeStart

    return start && start > rangeMin ? start : null
  }

  get sliderStart() {
    return this.displayStart || this.rangeMin
  }

  get displayEnd() {
    let { rangeEnd, pending, pendingEnd, rangeMax } = this
    let end = pending ? pendingEnd : rangeEnd

    return end && end < rangeMax ? end : null
  }

  get sliderEnd() {
    return this.displayEnd || this.rangeMax
  }

  @action
  setRange(start, end) {
    this.pendingStart = start <= this.rangeMin ? null : start
    this.pendingEnd = end >= this.rangeMax ? null : end
    this.pending = true
  }

  @action
  commitRange() {
    this.rangeStart = this.pendingStart
    this.rangeEnd = this.pendingEnd
    this.pending = false
  }

  @action
  resetRange() {
    this.rangeStart = this.rangeEnd = this.pendingStart = this.pendingEnd = null
  }

  /*********************************
   * Chart options
   */

  get hasChartOptions() {
    return this.hasMultiOption || this.hasPerCapitaOption || this.hasRangeOption
  }

  get options() {
    let {
      hasPerCapitaOption,
      perCapita,
      hasRangeOption,
      rangeStart,
      rangeEnd,
      rangeMin,
      rangeMax
    } = this

    let options = {
      perCapita: hasPerCapitaOption ? perCapita : false
    }

    if (hasRangeOption) {
      if (rangeStart && rangeStart > rangeMin) options.start = rangeStart
      if (rangeEnd && rangeEnd < rangeMax) options.end = rangeEnd
    }

    return options
  }

  /*********************************
   * Chart display
   */

  get title() {
    let { isCompareChart, chart, zone, zones, intl } = this

    if (isCompareChart) {
      return intl.exists(`fields.${chart.id}.long`)
        ? intl.t(`fields.${chart.id}.long`)
        : intl.t(`fields.${chart.id}.short`)
    } else {
      if (zone === zones.firstObject) {
        return null
      } else {
        return zones.firstObject.label
      }
    }
  }

  get zones() {
    let { zone, multi, isCompareChart } = this

    if (!isCompareChart && multi && zone.children.length > 1) {
      return zone.children.map((c) => c.zone)
    } else {
      return [zone.zone]
    }
  }

  get zoneColumns() {
    let {
      zones: { length },
      isCompareChart
    } = this

    if (!isCompareChart) {
      if (length >= 16) return '1 sm-2 md-3 lg-4 xl-5'
      if (length >= 9) return '1 sm-2 md-3 gt-md-4'
      if (length >= 4) return '1 sm-2 gt-sm-3'
      if (length > 1) return '1 gt-xs-2'
    }

    return null
  }

  get legend() {
    let { chart, intl, perCapita, zone } = this
    return chart.legendFor(zone.zone, intl, { perCapita })
  }

  @action
  selectZone(zone) {
    this.routing.selectZone(zone)
  }
}
