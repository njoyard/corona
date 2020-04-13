import Component from '@glimmer/component'
import { action } from '@ember/object'

export default class RegionListComponent extends Component {
  @action
  toggle(region) {
    this.args.onToggle(region)
  }

  @action
  select(region) {
    if (!region.selected) {
      this.args.onToggle(region)
    }
  }

  @action
  toggleChildren(region) {
    this.args.onToggleChildren(region)
  }

  get regions() {
    let {
      args: { regions, sortBy }
    } = this

    if (!sortBy) return regions

    let reverse = sortBy.startsWith('-')
    let key = reverse ? sortBy.substr(1) : sortBy

    let sorted = regions.sortBy(key)

    return reverse ? sorted.reverse() : sorted
  }
}
