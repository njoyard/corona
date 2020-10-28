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
}
