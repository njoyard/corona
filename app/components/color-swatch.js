import { htmlSafe } from '@ember/template'
import Component from '@glimmer/component'

export default class ColorSwatchComponent extends Component {
  get swatchStyle() {
    let {
      args: { type, color }
    } = this

    let style

    if (type === 'square') {
      style = `width: 12px; height: 12px;`
    } else if (type === 'rect') {
      style = `width: 24px; height: 12px;`
    } else if (type === 'point') {
      style = 'margin: 0 3px; width: 6px; height: 6px; border-radius: 3px;'
    } else if (type === 'line') {
      style = `width: 12px; height: 3px;`
    }

    return htmlSafe(`${style} background-color: ${color};`)
  }
}
