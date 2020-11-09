import { A } from '@ember/array'
import Service from '@ember/service'
import { tracked } from '@glimmer/tracking'

import Chart from 'corona/models/chart'
import { chartDefinitions } from 'corona/utils/chart-definitions'
import slugify from 'corona/utils/slugify'

const LS_KEY = 'corona:custom-charts'

export default class CustomChartsService extends Service {
  @tracked charts = A([])

  constructor() {
    super()

    let reprs

    try {
      reprs = JSON.parse(localStorage.getItem(LS_KEY)) || []
    } catch (e) {
      console.warn('Error reloading charts from localStorage')
      reprs = []
    }

    for (let repr of reprs) {
      try {
        this.charts.pushObject(this._toChart(repr))
      } catch (e) {
        console.warn('Skipping unimportable chart:', repr)
      }
    }
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

    while (
      charts.find((c) => c.id === slug) ||
      chartDefinitions.find((c) => c.id === slug)
    ) {
      slug = `${base}-${++counter}`
    }

    repr.id = slug

    charts.pushObject(this._toChart(repr))
    this._persist()

    return slug
  }

  remove(id) {
    let { charts } = this
    let chart = this.get(id)

    if (!chart) {
      throw new Error(`Unknown chart: ${id}`)
    }

    charts.removeObject(chart)
    this._persist()
  }

  update(id, repr) {
    let { charts } = this
    let chart = this.get(id)

    if (!chart) {
      throw new Error(`Unknown chart: ${id}`)
    }

    repr.id = id
    charts.replace(charts.indexOf(chart), 1, [this._toChart(repr)])
    this._persist()

    return repr.id
  }

  export(id) {
    let chart = this.get(id)

    if (!chart) {
      throw new Error(`Unknown chart: ${id}`)
    }

    let noid = Object.assign({}, chart.custom)
    delete noid.id

    return btoa(JSON.stringify(noid))
  }

  import(b64repr) {
    let repr
    try {
      repr = JSON.parse(atob(b64repr))
    } catch (e) {
      return { error: e }
    }

    let str = JSON.stringify(repr)
    let existing = this.charts.find((c) => {
      let noid = Object.assign({}, c.custom)
      delete noid.id

      return JSON.stringify(noid) === str
    })

    if (existing) {
      return { existing: existing.id }
    }

    return { imported: this.save(repr) }
  }
}
