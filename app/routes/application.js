import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default class ApplicationRoute extends Route {
  @service data
  @service intl

  beforeModel() {
    let languages = [...navigator.languages, 'en-us']

    this.intl.setLocale(languages)
    document.title = this.intl.t('title')
  }

  model() {
    return this.data.dataset
  }

  redirect(dataset, transition) {
    if (transition.to.name === 'index') {
      this.transitionTo('chart', dataset.defaultChart)
    }
  }
}
