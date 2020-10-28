import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default class ChartRoute extends Route {
  @service intl
  @service('paperToaster') toast

  model({ chart_id }) {
    let { dataset, multi } = this.modelFor('application')
    let chart = dataset.charts.find(({ id }) => id === chart_id)

    return {
      world: dataset.world,
      multi,
      chart,
      root: dataset.forChart(chart)
    }
  }

  redirect(model, transition) {
    let { intl, toast } = this
    let { root, world } = model

    if (transition.to.name === 'chart.index') {
      // Stay in the current zone if any and if available in this dataset, otherwise switch to dataset root zone
      let zone = root.id

      if (transition.from) {
        let zoneRoute = transition.from.find((ri) => ri.name === 'chart.zone')

        if (zoneRoute) {
          if (root.has(zoneRoute.params.zone_id)) {
            zone = zoneRoute.params.zone_id
          } else {
            toast.show(
              intl.t('app.switchZones', {
                from: world.find(zoneRoute.params.zone_id).label,
                to: root.label
              })
            )
          }
        }
      }

      this.transitionTo('chart.zone', zone)
    }
  }
}
