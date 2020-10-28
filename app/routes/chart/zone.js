import Route from '@ember/routing/route'

export default class ChartZoneRoute extends Route {
  model({ zone_id }) {
    let { root, chart, multi } = this.modelFor('chart')

    return {
      chart,
      multi,
      zone: root.find(zone_id)
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
