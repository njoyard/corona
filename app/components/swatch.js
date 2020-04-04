import Component from '@glimmer/component'

export default class SwatchComponent extends Component {
  get style() {
    let {
      args: {
        color: { hue, saturation, lightness }
      }
    } = this
    return `background-color: hsla(${hue}, ${saturation}%, ${lightness}%, 100%);`
  }
}
