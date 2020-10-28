import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import Component from '@glimmer/component'

export default class ZoneBreadcrumbsComponent extends Component {
  @service routing

  @action
  select(zone) {
    this.routing.selectZone(zone)
  }
}
