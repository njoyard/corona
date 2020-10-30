import Controller from '@ember/controller'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { tracked } from '@glimmer/tracking'

export default class ApplicationController extends Controller {
  @service data
  @service intl
  @service router
  @service('customCharts') custom

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
   * Aliases
   */

  get charts() {
    return this.model.dataset.charts
  }

  get customCharts() {
    return this.custom.charts
  }

  get links() {
    return this.data.links
  }

  /*********************************
   * Charting options
   */

  @tracked multi = false

  /*********************************
   * Custom charts
   */

  @action
  createChart() {
    this.router.transitionTo('custom', 'new')
  }

  @action
  editChart(chart) {
    this.router.transitionTo('custom', chart.id)
  }

  /*********************************
   * About & Links
   */

  @tracked showAbout = false

  @action
  openLink(id) {
    document.querySelector(`a.hidden-link#${id}`).click()
  }
}
