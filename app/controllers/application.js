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

  get selectedChart() {
    return this.routing.selectedChart
  }

  /*********************************
   * Chart selection
   */

  @action
  selectChart(chart) {
    let { selectedChart } = this

    if (typeof chart !== 'string') {
      chart = chart.id
    }

    if (!selectedChart || selectedChart !== chart) {
      this.transitionToRoute('chart', chart)
    }
  }

  /*********************************
   * Comparison charts
   */

  compareFields = Object.keys(compareFields)

  get isCompareChart() {
    let { selectedChart } = this
    return selectedChart && selectedChart.startsWith('compare:')
  }

  get compareField() {
    return this.selectedChart.replace(/compare:/, '')
  }

  @action
  showCompareChart(field) {
    if (typeof field !== 'string') {
      field = this.compareFields[0]
    }

    this.selectChart(`compare:${field}`)
  }

  /*********************************
   * Custom charts
   */

  @action
  editChart(chart) {
    this.transitionToRoute('custom', chart.id || 'new')
  }

  @action
  shareChart(chart) {
    let url = new URL(location.href)
    url.hash = this.router.urlFor(
      'custom',
      `import:${this.custom.export(chart.id)}`
    )

    this.modals.value({
      title: this.intl.t('share.text'),
      value: url.href
    })
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
