import { inject as service } from '@ember/service'
import Component from '@glimmer/component'

export default class LegendComponent extends Component {
  @service intl

  get items() {
    if (!this.args.chart) {
      return []
    }

    let series = this.args.chart.series

    return series.map(({ label, id, color, type }) => {
      return {
        label: label || this.intl.t(`fields.${id}`),
        color: color.bright,
        type
      }
    })
  }
}
