import Component from '@glimmer/component'
import { htmlSafe } from '@ember/template'

export default class SwatchComponent extends Component {
  get style() {
    let {
      args: {
        color: { hue, saturation, lightness }
      }
    } = this

    return htmlSafe(
      `background-color: hsla(${hue}, ${saturation}%, ${lightness}%, 100%);`
    )
  }
}
