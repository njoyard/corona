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

  canvas = null
  chartInstance = null
  notifier = null

  @tracked
  loading = true

  @tracked
  dataError = null

  getChartConfig() {
    let {
      args: { chart, zone, title, isPreview, options },
      intl
    } = this

    let data = chart.dataForZone(zone, options, intl)

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
        chart.getOptions(intl, options),
        isPreview ? { maintainAspectRatio: true, aspectRatio: 16 / 9 } : {}
      ),
      data
    }
  }

  @action
  createChart(canvas) {
    if (this.chartInstance) {
      this.chartInstance.destroy()
      this.chartInstance = null
    }

    this.canvas = canvas
    let context = canvas.getContext('2d')
    let config

    try {
      config = this.getChartConfig()
    } catch (e) {
      if (typeof e !== 'string') {
        console.error(`getChartConfig error`, e)
        this.dataError = 'app.errors.chart-error'
      } else {
        this.dataError = e
      }

      this.loading = false
      return
    }

    this.chartInstance = new Chart(context, config)
    this.loading = false
  }

  @action
  updateChart() {
    this.loading = true
    this.dataError = null

    if (this.chartInstance) {
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
    } else {
      this.createChart(this.canvas)
    }
  }

  @action
  destroyChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy()
      this.chartInstance = null
    }

    this.canvas = null
  }
}
