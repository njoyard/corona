import Component from '@glimmer/component'
import { inject as service } from '@ember/service'

export default class ChartListComponent extends Component {
  @service data

  get charts() {
    return this.data.charts
  }
}
