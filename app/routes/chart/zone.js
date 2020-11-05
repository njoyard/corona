import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default class ChartZoneRoute extends Route {
  @service router

  model({ zone_id }) {
    let { root, chart, start } = this.modelFor('chart')

    return {
      chart,
      zone: root.find(zone_id),
      root,
      start
    }
  }

  redirect(model) {
    if (!model.zone) {
      this.router.transitionTo('chart', model.chart.id)
    }
  }

  setupController(controller, model) {
    let { zone, root } = model
    if (zone.id === root.id && !root.hasSelfData) {
      // Force multi when the zone has no self data
      controller.multi = true
    }

    super.setupController(controller, model)
  }

  renderTemplate() {
    this.render('chart/zone-charts', { into: 'chart', outlet: 'charts' })
    this.render('chart/zone-legend', { into: 'chart', outlet: 'legend' })
    this.render('chart/zone-breadcrumbs', {
      into: 'chart',
      outlet: 'breadcrumbs'
    })
    this.render('chart/zone-options', {
      into: 'application',
      outlet: 'chart-options'
    })
  }
}
