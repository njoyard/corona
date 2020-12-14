import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default class ApplicationRoute extends Route {
  @service data
  @service intl
  @service router
  @service routing

  constructor() {
    super(...arguments)

    this.router.on('routeDidChange', () => {
      this.routing.savedRoute = this.router.currentURL
    })
  }

  beforeModel() {
    let languages = [...navigator.languages, 'en-us']

    this.intl.setLocale(languages)
    document.title = this.intl.t('title')
  }

  model() {
    return this.data.dataset
  }

  redirect(dataset, transition) {
    if (!transition.from && !location.hash && this.routing.savedRoute) {
      this.transitionTo(this.routing.savedRoute)
      return
    }

    if (transition.to.name === 'index') {
      this.transitionTo('chart', dataset.defaultChart)
    }
  }
}
