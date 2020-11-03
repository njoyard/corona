import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default class ApplicationRoute extends Route {
  @service data
  @service intl

  beforeModel() {
    this.intl.setLocale(navigator.languages)
    document.title = this.intl.t('app.title')
  }

  model() {
    return this.data.dataset
  }

  redirect(dataset, transition) {
    if (transition.to.name === 'index' && dataset.charts.length > 0) {
      this.transitionTo('chart', dataset.charts.firstObject.id)
    }
  }
}
