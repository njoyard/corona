import Component from '@glimmer/component'
import env from 'corona/config/environment'

const { buildID, buildDate } = env.APP

export default class AboutDialogComponent extends Component {
  get versionInfo() {
    let info = `This version was built on ${buildDate}`

    if (buildID) {
      info += ` from commit ${buildID}`
    }

    return `${info}.`
  }
}
