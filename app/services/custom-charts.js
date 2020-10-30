import { A } from '@ember/array'
import Service from '@ember/service'

import Chart from 'corona/models/chart'
import slugify from 'corona/utils/slugify'

const LS_KEY = 'corona:custom-charts'

export default class CustomChartsService extends Service {
  charts = A([])

  constructor() {
    super()

    let reprs

    try {
      reprs = JSON.parse(localStorage.getItem(LS_KEY)) || []
    } catch (e) {
      reprs = []
    }

    this.charts.pushObjects(reprs.map((r) => this._toChart(r)))
  }

  _toChart(repr) {
    return Chart.fromCustomRepr(repr)
  }

  _persist() {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify(this.charts.map((c) => c.custom))
    )
  }

  get(id) {
    return this.charts.find((c) => c.id === id)
  }

  save(repr) {
    let { charts } = this

    let base = slugify(repr.t)
    let slug = base
    let counter = 0

    while (charts.find((c) => c.id === slug)) {
      slug = `${base}-${++counter}`
    }

    repr.id = slug

    charts.pushObject(this._toChart(repr))
    this._persist()
  }

  remove(id) {
    let { charts } = this

    charts.removeObject(this.get(id))
    this._persist()
  }

  update(id, repr) {
    let { charts } = this
    let chart = this.get(repr)
    charts.replace(charts.indexOf(chart), this._toChart(repr))
    this._persist()
  }
}
