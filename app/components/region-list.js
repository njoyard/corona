import Component from '@glimmer/component'
import { action } from '@ember/object'

export default class RegionListComponent extends Component {
  @action
  toggle(option) {
    this.args.onToggle(option)
  }

  @action
  toggleChildren(option) {
    this.args.onToggleChildren(option)
  }

  get options() {
    let {
      args: { options, sortBy }
    } = this

    if (!sortBy) return options

    let reverse = sortBy.startsWith('-')
    let key = reverse ? sortBy.substr(1) : sortBy

    let sorted = options.sortBy(key)

    return reverse ? sorted.reverse() : sorted
  }
}
