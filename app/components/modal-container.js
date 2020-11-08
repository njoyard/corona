import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import Component from '@glimmer/component'

export default class ModalContainerComponent extends Component {
  @service modals

  get active() {
    return this.modals.active
  }

  get params() {
    return this.modals.params
  }

  @action
  close(outcome) {
    this.modals.close(outcome)
  }
}
