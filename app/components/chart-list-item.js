import { inject as service } from '@ember/service'
import Component from '@glimmer/component'

export default class ChartListItemComponent extends Component {
  @service intl

  get isCustom() {
    return Boolean(this.args.chart.custom)
  }

  get id() {
    return this.args.chart.id
  }

  get img() {
    return `assets/chart-${this.id}.png`
  }

  get title() {
    let {
      id,
      intl,
      isCustom,
      args: {
        chart: { title }
      }
    } = this

    return isCustom ? title : intl.t(`charts.${id}.title`)
  }

  get description() {
    let {
      id,
      intl,
      isCustom,
      args: {
        chart: { description }
      }
    } = this

    return isCustom ? description : intl.t(`charts.${id}.description`)
  }
}
