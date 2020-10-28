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

export default class ChartController extends Controller {
  @service routing

  /*********************************
   * Proxies
   */

  get chart() {
    return this.model.chart
  }

  get root() {
    return this.model.root
  }

  get zones() {
    return this.root.all
  }

  /*********************************
   * Zone search
   */

  @tracked
  searchActive = false

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
    this.routing.selectZone(zone)
    this.searchActive = false
  }
}
