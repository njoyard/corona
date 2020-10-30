import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default class ApplicationRoute extends Route {
  @service data
  @service intl

  queryParams = {
    multi: {
      replace: true,
      refreshModel: true
    }
  }

  beforeModel() {
    this.intl.setLocale(navigator.languages)
    document.title = this.intl.t('app.title')
  }

  async model({ multi }) {
    return {
      dataset: await this.data.dataset,
      multi
    }
  }

  redirect(model, transition) {
    if (transition.to.name === 'index' && model.dataset.charts.length > 0) {
      this.transitionTo('chart', model.dataset.charts.firstObject.id)
    }
  }
}
