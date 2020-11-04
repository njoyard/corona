import Controller from '@ember/controller'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { tracked } from '@glimmer/tracking'

import { compareFields } from 'corona/utils/chart-definitions'

export default class ApplicationController extends Controller {
  @service data
  @service intl
  @service router
  @service routing
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
   * Charting options
   */

  @tracked multi = false

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

  @tracked showAbout = false

  @action
  noop() {}
}
