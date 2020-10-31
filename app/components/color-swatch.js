import { htmlSafe } from '@ember/template'
import Component from '@glimmer/component'

export default class ColorSwatchComponent extends Component {
  get swatchStyle() {
    let {
      args: { type, color }
    } = this

    let style
    let bg = true

    if (type === 'square') {
      style = `width: 16px; height: 16px; opacity: 0.75;`
    } else if (type === 'rect') {
      style = `width: 24px; height: 16px; opacity: 0.75;`
    } else if (type === 'point') {
      style = 'margin: 0 3px; width: 6px; height: 6px; border-radius: 3px;'
    } else if (type === 'line') {
      style = `width: 16px; height: 2px;`
    } else if (type === 'thin') {
      style = `width: 16px; height: 1px;`
    } else if (type === 'dashed') {
      style = `width: 16px; height: 1px; border-top: 1px dashed ${color};`
      bg = false
    } else if (type === 'dotted') {
      style = `width: 16px; height: 2px; border-top: 2px dotted ${color};`
      bg = false
    }

    return htmlSafe(`${style} ${bg ? `background-color: ${color};` : ''}`)
  }
}
