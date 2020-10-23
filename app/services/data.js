import Service, { inject as service } from '@ember/service'

import fetch from 'fetch'

import config from 'corona/config/environment'
import Zone from 'corona/models/zone'
import Chart from 'corona/models/chart'
import ChartSeries from 'corona/models/chart-series'
import chartDefinitions from 'corona/utils/chart-definitions'

const {
  environment,
  APP: { dataURL }
} = config

export default class DataService extends Service {
  @service intl

  _data = null
  _charts = null

  async getData() {
    let response = await fetch(
      environment === 'development' ? '/corona.json' : dataURL
    )

    // Not using .json() as this is most likely not served with the correct content-type
    return JSON.parse(await response.text())
  }

  get dataPromise() {
    if (!this._data) {
      this._data = this.getData()
    }

    return this._data
  }

  get world() {
    let { dataPromise, intl } = this
    return dataPromise.then((data) => new Zone('World', data, intl))
  }

  get charts() {
    if (!this._charts) {
      this._charts = chartDefinitions.map(
        ({ id, series }) =>
          new Chart(
            id,
            series.map(
              ({ id, field, options }) =>
                new ChartSeries(id, field, options || {})
            )
          )
      )
    }

    return this._charts
  }
}
