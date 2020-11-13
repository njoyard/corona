import { action } from '@ember/object'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

import { compareLabels } from 'corona/utils/collection'

class SelectChildrenOption {
  @tracked selected

  constructor(zone, selected) {
    this.zone = zone
    this.selected = selected
  }

  @action
  toggle() {
    this.selected = !this.selected
  }
}

const options = new WeakMap()

export default class ModalsSelectChildrenComponent extends Component {
  @tracked _options

  get options() {
    let {
      args: { children, selected }
    } = this

    if (!options.has(this)) {
      options.set(
        this,
        children
          .map((c) => new SelectChildrenOption(c, selected.includes(c.id)))
          .sort(({ zone: a }, { zone: b }) => compareLabels(a, b))
      )
    }

    return options.get(this)
  }

  @action
  reset() {
    for (let option of this.options) {
      option.selected = false
    }

    this.confirmSelection()
  }

  @action
  confirmSelection() {
    let {
      args: { onClose },
      options
    } = this

    onClose(
      options
        .filter((o) => o.selected)
        .map((o) => o.zone.id)
        .sort()
    )
  }
}
