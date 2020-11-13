import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import Component from '@glimmer/component'

export default class ZoneBreadcrumbsComponent extends Component {
  @service modals

  @action
  async selectChildren() {
    let {
      args: { onSelect, selectedChildren, selectableChildren, zone }
    } = this

    let selectedIDs

    try {
      selectedIDs = await this.modals.selectChildren({
        children: selectableChildren,
        selected: selectedChildren || []
      })
    } catch (e) {
      return
    }

    onSelect(
      selectedIDs.length ? `${zone.id}:${selectedIDs.join(',')}` : zone.id
    )
  }
}
