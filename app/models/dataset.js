import Zone from 'corona/models/zone'
import DatasetZone from 'corona/models/dataset-zone'

export default class Dataset {
  constructor(data, charts, links, intl) {
    this.world = new Zone('world', data, intl)
    this.charts = charts
    this.links = links
  }

  forChart(chart) {
    return new DatasetZone(chart, this.world).root
  }
}
