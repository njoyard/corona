import { inject as service } from '@ember/service'
import Component from '@glimmer/component'

export default class ChartListItemComponent extends Component {
  @service intl

  get id() {
    return this.args.chart.id
  }

  get img() {
    return `assets/chart-${this.id}.png`
  }

  get title() {
    let { id, intl } = this
    return intl.t(`charts.${id}.title`)
  }

  get description() {
    let { id, intl } = this
    return intl.t(`charts.${id}.description`)
  }
}
