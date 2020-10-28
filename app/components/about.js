import Component from '@glimmer/component'
import { inject as service } from '@ember/service'

import config from 'corona/config/environment'

const {
  APP: { buildDate }
} = config

export default class AboutComponent extends Component {
  @service data

  buildDate = buildDate

  get sources() {
    return this.data.sources
  }
}
