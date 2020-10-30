import Zone from 'corona/models/zone'
import DatasetZone from 'corona/models/dataset-zone'

export default class Dataset {
  constructor(data, charts, intl) {
    this.world = new Zone('world', data, intl)
    this.charts = charts
  }

  forChart(chart) {
    return new DatasetZone(chart, this.world).root
  }

  get allFields() {
    let fields = new Set()
    let rec = [this.world]

    while (rec.length) {
      let zone = rec.shift()
      for (let field of zone.fields) {
        fields.add(field)
      }
      rec.push(...zone.children)
    }

    return fields
  }
}
