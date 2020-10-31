import Service, { inject as service } from '@ember/service'

import fetch from 'fetch'

import config from 'corona/config/environment'
import Chart from 'corona/models/chart'
import ChartSeries from 'corona/models/chart-series'
import Dataset from 'corona/models/dataset'
import { chartDefinitions } from 'corona/utils/chart-definitions'

const {
  environment,
  APP: { dataURL }
} = config

export default class DataService extends Service {
  @service intl

  links = [
    { id: 'github', href: '//github.com/njoyard/corona' },
    { id: 'data', href: '//github.com/njoyard/corona/tree/data' }
  ]

  sources = {
    csse:
      '//github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_time_series',
    ecdc:
      '//www.ecdc.europa.eu/en/publications-data/download-data-hospital-and-icu-admission-rates-and-current-occupancy-covid-19',
    spf:
      '//www.data.gouv.fr/fr/datasets/donnees-hospitalieres-relatives-a-lepidemie-de-covid-19/',
    lizurey:
      '//www.data.gouv.fr/fr/datasets/liste-des-departements-francais-metropolitains-doutre-mer-et-les-com-ainsi-que-leurs-prefectures/'
  }

  get charts() {
    return chartDefinitions.map(
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

  async getData() {
    let response = await fetch(
      environment === 'development' ? '/corona.json' : dataURL
    )

    // Not using .json() as this is most likely not served with the correct content-type
    return JSON.parse(await response.text())
  }

  _dataPromise = null
  get dataPromise() {
    if (!this._dataPromise) {
      this._dataPromise = this.getData()
    }

    return this._dataPromise
  }

  _dataset = null
  get dataset() {
    let { dataPromise, charts, intl } = this
    return dataPromise.then(
      (data) => (this._dataset = new Dataset(data, charts, intl))
    )
  }

  addChart(chart) {
    this._dataset.charts.pushObject(chart)
  }
}
