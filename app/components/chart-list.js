import { action } from '@ember/object'
import { inject as service } from '@ember/service'

import Component from '@glimmer/component'

export default class ChartListComponent extends Component {
  @service routing

  get selected() {
    return this.routing.selectedChart
  }

  @action
  select(chart) {
    this.routing.selectChart(chart)
  }
}
