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

  queryParams = [
    { multi: { scope: 'controller', as: 'm' } },
    { perCapita: { scope: 'controller', as: 'c' } },
    { rangeStart: { scope: 'controller', as: 'f' } },
    { rangeEnd: { scope: 'controller', as: 't' } }
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

  get selected() {
    return this.model.selected
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

  get rangeLimits() {
    return this.chart.rangeForZone(this.zone.zone)
  }

  get rangeMin() {
    return this.rangeLimits.min
  }

  get rangeMax() {
    return this.rangeLimits.max
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
      rangeMax,
      isCompareChart,
      selected
    } = this

    let options = {
      perCapita: hasPerCapitaOption ? perCapita : false
    }

    if (hasRangeOption) {
      if (rangeStart && rangeStart > rangeMin) options.start = rangeStart
      if (rangeEnd && rangeEnd < rangeMax) options.end = rangeEnd
    }

    if (isCompareChart && selected) {
      options.selected = selected
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
    let { zone, multi, isCompareChart, selected } = this

    if (!isCompareChart && multi && zone.children.length > 1) {
      let zones = zone.children.map((c) => c.zone)

      if (selected) {
        zones = zones.filter((z) => selected.includes(z.id))
      }

      return zones
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
    let { chart, intl, perCapita, zone, isCompareChart, selected } = this
    let options = { perCapita }

    if (isCompareChart && selected) {
      options.selected = selected
    }

    return chart.legendFor(zone.zone, intl, options)
  }

  /*********************************
   * Zone selection
   */

  get selectableChildren() {
    let { chart, perCapita, multi, isCompareChart, zone } = this

    if (!isCompareChart && multi && zone.children.length > 1) {
      return zone.children
    } else if (isCompareChart) {
      return chart.validChildren(zone.zone, { perCapita }, false)
    }

    return null
  }

  @action
  selectZone(zone) {
    this.transitionToRoute(
      'chart.zone',
      typeof zone === 'string' ? zone : zone.id
    )
  }
}
