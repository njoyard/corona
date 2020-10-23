/* global Chart */

import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

import config from 'corona/config/environment'

const {
  APP: { dataThreshold }
} = config

export default class ChartComponent extends Component {
  @service intl

  chartInstance = null
  notifier = null

  @tracked
  loading = true

  @tracked
  dataError = null

  get error() {
    let {
      args: { chart, zone },
      dataError
    } = this

    if (!chart) {
      return 'app.errors.no-chart'
    }

    if (!zone) {
      return 'app.errors.no-zone'
    }

    return dataError
  }

  getChartConfig() {
    let {
      args: { chart, zone, title },
      intl
    } = this

    let data = chart.dataForZone(zone, intl)

    if (data.datasets.every((ds) => ds.data.length < dataThreshold)) {
      throw 'app.errors.no-data'
    }

    return {
      options: Object.assign(
        {
          title: {
            display: Boolean(title),
            text: ' '
          }
        },
        chart.getOptions(intl)
      ),
      data
    }
  }

  @action
  createChart(element) {
    let context = element.getContext('2d')

    let config

    try {
      config = this.getChartConfig()
    } catch (e) {
      this.dataError = e
      this.loading = false
      return
    }

    this.chartInstance = new Chart(context, config)

    this.loading = false
  }

  @action
  updateChart() {
    if (this.chartInstance) {
      this.loading = true

      let config

      try {
        config = this.getChartConfig()
      } catch (e) {
        this.dataError = e
        this.loading = false
        return
      }

      this.chartInstance.options = config.options
      this.chartInstance.data = config.data
      this.chartInstance.update('none')

      this.loading = false
    }
  }

  @action
  destroyChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy()
      this.chartInstance = null
    }
  }
}
