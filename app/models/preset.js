import { htmlSafe } from '@ember/template'

export default class Preset {
  title = null
  _description = null
  params = null
  singleRegion = null

  constructor({ title, description, singleRegion, params }) {
    this.title = title
    this._description = description
    this.singleRegion = singleRegion
    this.params = params
  }

  get description() {
    return htmlSafe(this._description)
  }
}
