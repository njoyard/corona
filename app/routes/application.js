import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default class ApplicationRoute extends Route {
  @service data

  queryParams = {
    dataset: {
      refreshModel: true
    }
  }

  model(params) {
    this.data.loadingState = 'initializing'
    return this.data.data(params.dataset, params.regions)
  }
}
