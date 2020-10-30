import Controller from '@ember/controller'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'

export default class ChartZoneController extends Controller {
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

  /*********************************
   * Chart display
   */

  get zones() {
    let { zone, multi } = this

    if (multi && zone.children.length > 1) {
      return zone.children.map((c) => c.zone)
    } else {
      return [zone.zone]
    }
  }

  get zoneColumns() {
    let {
      zones: { length }
    } = this

    if (length >= 16) return '1 sm-2 md-3 lg-4 xl-5'
    if (length >= 9) return '1 sm-2 md-3 gt-md-4'
    if (length >= 4) return '1 sm-2 gt-sm-3'
    if (length > 1) return '1 gt-xs-2'

    return null
  }

  @action
  selectZone(zone) {
    this.routing.selectZone(zone)
  }
}
