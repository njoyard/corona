import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import Component from '@glimmer/component'

export default class ZoneBreadcrumbsInnerComponent extends Component {
  @service routing

  @action
  select(zone) {
    if (this.args.onSelect) {
      this.args.onSelect(zone)
    } else {
      this.routing.selectZone(zone)
    }
  }
}
