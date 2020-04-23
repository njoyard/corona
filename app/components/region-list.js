import Component from '@glimmer/component'
import { action } from '@ember/object'

function visitRegions({ regions, sortBy, reverse, filterBy, filter }) {
  let visited = []
  let list = regions

  if (sortBy) {
    list = list.sortBy(sortBy)
  }

  if (reverse) {
    list = list.reverse()
  }

  for (let region of list) {
    let children = []

    if (region.children && region.children.length) {
      children = visitRegions({
        regions: region.children,
        sortBy,
        reverse,
        filterBy,
        filter
      })
    }

    if (
      children.length ||
      !filter ||
      region[filterBy].toLowerCase().indexOf(filter) !== -1
    ) {
      visited.push(region)
    }

    visited.push(...children)
  }

  return visited
}

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
  selectOnly(region) {
    this.args.onSelectOnly(region)
  }

  @action
  toggleChildren(region) {
    this.args.onToggleChildren(region)
  }

  get regions() {
    let {
      args: { regions, sortBy, filterBy, filter }
    } = this

    let reverse = sortBy.startsWith('-')
    let key = reverse ? sortBy.substr(1) : sortBy

    return visitRegions({
      regions,
      sortBy: key,
      reverse,
      filterBy,
      filter: filter.toLowerCase()
    })
  }
}
