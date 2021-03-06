import Service, { inject as service } from '@ember/service'

const LS_KEY = 'corona:route'

export default class RoutingService extends Service {
  @service router

  get selectedChart() {
    let { router } = this

    let chartRoute =
      router.currentRoute &&
      router.currentRoute.find(({ name }) => name === 'chart')

    if (chartRoute) {
      return chartRoute.params.chart_id
    }

    return null
  }

  get savedRoute() {
    return localStorage.getItem(LS_KEY)
  }

  set savedRoute(route) {
    localStorage.setItem(LS_KEY, route)
  }
}
