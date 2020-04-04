import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service data;

  queryParams = {
    dataset: {
      refreshModel: true
    }
  };

  model(params) {
    let loadingController = this.controllerFor('application-loading')
    loadingController.loadingState = 'initializing'

    return this.data.data(params.dataset, (state) => {
      loadingController.loadingState = state
    })
  }
}
