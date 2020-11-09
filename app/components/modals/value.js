import { action } from '@ember/object'
import Component from '@glimmer/component'

export default class ModalsValueComponent extends Component {
  @action
  onInputInserted(element) {
    setTimeout(() => {
      let input = element.querySelector('input')
      input.focus()
      input.select()
    }, 200)
  }
}
