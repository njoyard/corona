import Service from '@ember/service'
import { tracked } from '@glimmer/tracking'

export default class ModalsService extends Service {
  @tracked active = null
  @tracked params = null

  promise = null

  about() {
    this.active = 'about'
  }

  value(params) {
    this.active = 'value'
    this.params = params
  }

  confirm(params) {
    this.active = 'confirm'
    this.params = params

    return new Promise(
      (resolve, reject) => (this.promise = { resolve, reject })
    )
  }

  selectChildren(params) {
    this.active = 'select-children'
    this.params = params

    return new Promise(
      (resolve, reject) => (this.promise = { resolve, reject })
    )
  }

  close(outcome) {
    this.active = null

    if (this.promise) {
      let { resolve, reject } = this.promise
      this.promise = null
      outcome ? resolve(outcome) : reject()
    }
  }
}
