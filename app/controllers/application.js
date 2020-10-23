import Controller from '@ember/controller'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { tracked } from '@glimmer/tracking'

function focusSearch() {
  let input = document.querySelector(
    '.main-toolbar .ember-power-select-trigger input'
  )

  if (input) {
    input.focus()
  } else {
    setTimeout(focusSearch, 0)
  }
}

export default class ApplicationController extends Controller {
  @service data

  queryParams = [{ zoneID: 'zone' }, { chartID: 'chart' }, { multi: 'multi' }]

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

  get world() {
    return this.model
  }

  get charts() {
    return this.data.charts
  }

  /*********************************
   * Zone selection
   */

  @tracked zoneID = 'World'
  @tracked multi = false

  get zone() {
    return this.world.find(this.zoneID)
  }

  set zone(zone) {
    this.zoneID = zone.id
  }

  get zones() {
    let { chart, zone, multi } = this

    if (!chart || !zone) return []
    return (multi && zone.children.length
      ? zone.children
      : [zone]
    ).filter((z) => chart.validForZone(z))
  }

  get zoneColumns() {
    let {
      zones: { length }
    } = this

    if (length >= 16) return '1 sm-2 md-3 lg-4 xl-5'
    if (length >= 9) return '1 sm-2 md-3 gt-md-4'
    if (length >= 4) return '1 sm-2 gt-sm-3'
    if (length > 1) return '1 gt-xs-2'

    return null
  }

  /*********************************
   * Zone search
   */

  @tracked searchActive = false

  get allZones() {
    let { world } = this

    let all = []
    let rec = [world]

    while (rec.length) {
      let zone = rec.shift()
      all.push(zone)
      rec.push(...zone.children)
    }

    return all.sort(({ label: a }, { label: b }) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
  }

  @action
  toggleSearch() {
    this.searchActive = !this.searchActive

    if (this.searchActive) {
      focusSearch()
    }
  }

  @action
  disableSearch(_, event) {
    if (
      event.relatedTarget &&
      event.relatedTarget.classList.contains('md-autocomplete-suggestion')
    ) {
      return false
    }

    this.searchActive = false
  }

  @action
  searchSelect(zone) {
    this.zone = zone
    this.searchActive = false
  }

  /*********************************
   * Chart selection
   */

  @tracked chartID = 'cases'

  get chart() {
    return this.charts.find(({ id }) => id === this.chartID)
  }

  set chart(chart) {
    this.chartID = chart.id
  }

  /*********************************
   * links
   */

  links = [
    { id: 'github', href: '//github.com/njoyard/corona' },
    { id: 'data', href: '//github.com/njoyard/corona/tree/data' }
  ]

  @action
  openLink(id) {
    document.querySelector(`a.hidden-link#${id}`).click()
  }
}
