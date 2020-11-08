import Controller from '@ember/controller'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { tracked } from '@glimmer/tracking'

import { compareFields } from 'corona/utils/chart-definitions'

export default class ApplicationController extends Controller {
  @service('customCharts') custom
  @service data
  @service intl
  @service modals
  @service router
  @service routing

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

  get dataset() {
    return this.model
  }

  get charts() {
    return this.dataset.charts
  }

  get customCharts() {
    return this.custom.charts
  }

  get links() {
    return this.data.links
  }

  /*********************************
   * Comparison charts
   */

  compareFields = Object.keys(compareFields)

  get isCompareChart() {
    return (
      this.routing.selectedChart &&
      this.routing.selectedChart.startsWith('compare:')
    )
  }

  get compareField() {
    return this.routing.selectedChart.replace(/compare:/, '')
  }

  @action
  showCompareChart(field) {
    if (typeof field !== 'string') {
      field = this.compareFields[0]
    }

    this.routing.selectChart(`compare:${field}`)
  }

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

  @action
  showAbout() {
    this.modals.about()
  }

  @action
  noop() {}
}
