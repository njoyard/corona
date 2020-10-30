import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default class ChartRoute extends Route {
  @service router
  @service customCharts

  model({ chart_id }) {
    let { dataset, multi } = this.modelFor('application')
    let chart =
      dataset.charts.find(({ id }) => id === chart_id) ||
      this.customCharts.get(chart_id)

    if (!chart) {
      return null
    }

    return {
      world: dataset.world,
      multi,
      chart,
      root: dataset.forChart(chart)
    }
  }

  redirect(model, transition) {
    if (!model) {
      this.router.transitionTo('application')
    }

    let { root } = model

    if (transition.to.name === 'chart.index') {
      // Stay in the current zone if any and if available in this dataset, otherwise switch to dataset root zone
      let zone = root.id

      if (transition.from) {
        let zoneRoute = transition.from.find((ri) => ri.name === 'chart.zone')

        if (zoneRoute) {
          if (root.has(zoneRoute.params.zone_id)) {
            zone = zoneRoute.params.zone_id
          }
        }
      }

      if (zone === root.id && !root.hasSelfData) {
        this.transitionTo('chart.zone', zone, { queryParams: { multi: true } })
      } else {
        this.transitionTo('chart.zone', zone)
      }
    }
  }
}
