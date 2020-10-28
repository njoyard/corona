import Service, { inject as service } from '@ember/service'

export default class RoutingService extends Service {
  @service router

  get selectedChart() {
    let { router } = this

    let chartRoute = router.currentRoute.find(({ name }) => name === 'chart')

    if (chartRoute) {
      return chartRoute.params.chart_id
    }

    return null
  }

  selectChart(chart) {
    let { router } = this

    let chartRoute = router.currentRoute.find(({ name }) => name === 'chart')

    if (chartRoute && chartRoute.params.chart_id !== chart.id) {
      router.transitionTo('chart', chart.id)
    }
  }

  selectZone(zone) {
    let { router } = this

    router.transitionTo('chart.zone', zone.id)
  }
}
