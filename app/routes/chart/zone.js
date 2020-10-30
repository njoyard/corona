import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default class ChartZoneRoute extends Route {
  @service router

  model({ zone_id }) {
    let { root, chart, multi } = this.modelFor('chart')

    return {
      chart,
      multi,
      zone: root.find(zone_id)
    }
  }

  redirect(model) {
    if (!model.zone) {
      this.router.transitionTo('chart', model.chart.id)
    }
  }

  renderTemplate() {
    this.render('chart/zone-charts', { into: 'chart', outlet: 'charts' })
    this.render('chart/zone-breadcrumbs', {
      into: 'chart',
      outlet: 'breadcrumbs'
    })
  }
}
