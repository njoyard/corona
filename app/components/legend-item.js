import { htmlSafe } from '@ember/template'
import Component from '@glimmer/component'

export default class LegendItemComponent extends Component {
  get swatchStyle() {
    let {
      args: { type, color }
    } = this

    let style

    if (type === 'bar') {
      style = `width: 12px; height: 12px;`
    } else if (type === 'points') {
      style = 'margin: 0 3px; width: 6px; height: 6px; border-radius: 3px;'
    } else if (type === 'line') {
      style = `width: 12px; height: 3px;`
    }

    return htmlSafe(`${style} background-color: ${color};`)
  }
}
