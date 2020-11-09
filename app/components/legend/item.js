import Component from '@glimmer/component'

export default class LegendItemComponent extends Component {
  get swatchType() {
    let {
      args: { type }
    } = this

    if (type === 'bar') {
      return 'square'
    }

    if (type === 'points') {
      return 'point'
    }

    return type
  }
}
