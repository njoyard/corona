import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service data;

  model() {
    let loadingController = this.controllerFor('application-loading')
    loadingController.loadingState = 'initializing'

    return this.data.data((state) => {
      loadingController.loadingState = state
    })
  }
}
