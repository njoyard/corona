import Controller from '@ember/controller'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { tracked } from '@glimmer/tracking'

export default class ApplicationController extends Controller {
  @service intl
  @service('modalsManager') modals

  queryParams = ['multi']

  /*********************************
   * Side nav handling
   */

  @tracked sideNavOpen

  @action
  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen
  }

  /*********************************
   * Proxies
   */

  get charts() {
    return this.model.dataset.charts
  }

  get links() {
    return this.model.dataset.links
  }

  /*********************************
   * Charting optons
   */

  @tracked multi = false

  /*********************************
   * Links
   */

  @action
  openLink(id) {
    document.querySelector(`a.hidden-link#${id}`).click()
  }

  @action
  showAbout() {
    let { modals, intl } = this

    modals.alert({
      title: intl.t('app.about.title'),
      confirm: intl.t('app.about.close'),
      bodyComponent: 'about',
      clickOutsideToClose: true,
      escapeToClose: true
    })
  }
}
