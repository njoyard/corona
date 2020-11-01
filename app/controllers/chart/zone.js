import Controller from '@ember/controller'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'

export default class ChartZoneController extends Controller {
  @service intl
  @service routing

  /*********************************
   * Aliases
   */

  get chart() {
    return this.model.chart
  }

  get multi() {
    return this.model.multi
  }

  get zone() {
    return this.model.zone
  }

  get isCompareChart() {
    return this.model.chart.isCompareChart
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

  @action
  selectZone(zone) {
    this.routing.selectZone(zone)
  }
}
