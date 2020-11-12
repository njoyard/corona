import Zone from 'corona/models/zone'
import CompareChart from 'corona/models/compare-chart'
import DatasetZone from 'corona/models/dataset-zone'

export default class Dataset {
  constructor(data, charts, intl) {
    this.world = new Zone('world', data, intl)
    this.charts = charts
  }

  findChart(id) {
    if (id.startsWith('compare:')) {
      return CompareChart.create(id.replace(/compare:/, ''))
    } else {
      return this.charts.find((c) => c.id === id)
    }
  }

  forChart(chart) {
    return new DatasetZone(chart, this.world).root
  }

  get defaultChart() {
    return this.charts.firstObject.id
  }

  get allFields() {
    let fields = new Set(['population'])
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
