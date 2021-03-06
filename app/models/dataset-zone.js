import { compareLabels } from 'corona/utils/collection'

export default class DatasetZone {
  constructor(chart, zone, parent = null) {
    this.zone = zone
    this.chart = chart
    this._parent = parent

    let { id, label, subdivision, iso, rank, children } = zone
    Object.assign(this, { id, label, subdivision, iso, rank })

    let allChildren = children.map((c) => new DatasetZone(chart, c, this))
    this.children = allChildren.filter((dz) => dz.hasData)

    this.hasSelfData = chart.validForZone(zone)
    this.hasData = this.hasSelfData || this.children.length

    if (this.hasData) {
      if (this.hasSelfData || this.children.length > 1) {
        this.root = this
      } else if (this.children.length === 1) {
        this.root = this.children[0].root
      }

      if (!this.root) {
        throw new Error(`No root for zone ${id} with chart ${chart.id}`)
      }

      let all = []
      let rec = [this]

      while (rec.length) {
        let dz = rec.shift()
        all.push(dz)
        rec.push(...dz.children)
      }

      this.all = all.sort(compareLabels)
    }
  }

  find(id) {
    return this.all.find((dz) => dz.id === id)
  }

  has(id) {
    return Boolean(this.find(id))
  }

  get parent() {
    if (this._parent && this._parent.root !== this) {
      return this._parent
    }

    return null
  }

  get siblings() {
    return this.parent ? this.parent.children : []
  }

  get subdivKey() {
    return `subdivision.${this.subdivision}`
  }
}
