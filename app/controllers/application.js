import Controller from '@ember/controller'
import { tracked } from '@glimmer/tracking'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { scheduleOnce } from '@ember/runloop'
import moment from 'moment'
import env from 'corona/config/environment'
import { generateDataset, formatYTick, plugins } from 'corona/utils/chart'

const { buildID, buildDate } = env.APP
const { hideTooltipOnLegend } = plugins

const LEGEND_LIMIT = 20
const START_OFFSET = 50

export default class ApplicationController extends Controller {
  @service data

  queryParams = [
    { dataset: 'd' },
    { xSelection: 'x' },
    { xLog: 'xl' },
    { ySelection: 'y' },
    { yLog: 'yl' },
    { yChange: 'yc' },
    { yMovingAverage: 'ya' },
    { yRatio: 'yr' },
    { showLegend: 'l' },
    { stacked: 's' },
    { selectedRegionCodes: 'r' }
  ]

  /*
    ---- START WORKAROUND for https://github.com/emberjs/ember.js/issues/18715 ----

    Performance issue with @tracked queryParams
  */

  @tracked _xSelection = 'date'

  get xSelection() {
    return this._xSelection
  }

  set xSelection(value) {
    this._xSelection = value
  }

  @tracked _xLog = false

  get xLog() {
    return this._xLog
  }

  set xLog(value) {
    this._xLog = value
  }

  @tracked _ySelection = 'confirmed'

  get ySelection() {
    return this._ySelection
  }

  set ySelection(value) {
    this._ySelection = value
  }

  @tracked _yLog = false

  get yLog() {
    return this._yLog
  }

  set yLog(value) {
    this._yLog = value
  }

  @tracked _yChange = false

  get yChange() {
    return this._yChange
  }

  set yChange(value) {
    this._yChange = value
  }

  @tracked _yMovingAverage = false

  get yMovingAverage() {
    return this._yMovingAverage
  }

  set yMovingAverage(value) {
    this._yMovingAverage = value
  }

  @tracked _yRatio = false

  get yRatio() {
    return this._yRatio
  }

  set yRatio(value) {
    this._yRatio = value
  }

  @tracked _showLegend = true

  get showLegend() {
    return this._showLegend
  }

  set showLegend(value) {
    this._showLegend = value
  }

  @tracked _stacked = false

  get stacked() {
    return this._stacked
  }

  set stacked(value) {
    this._stacked = value
  }

  /* ---- END WORKAROUND ---- */

  @tracked dataset = 'flat'

  @action
  selectDataset(ds) {
    this.data.reloading = true
    this.showSourcesDialog = false
    this.selectedOptions.clear()

    setTimeout(() => {
      this.dataset = ds
    }, 0)
  }

  @tracked speedDialOpen = false
  @tracked showAboutDialog = false
  @tracked showSourcesDialog = false
  @tracked showShareDialog = false
  @tracked shareURL = location.href

  get versionInfo() {
    let info = `This version was built on ${buildDate}`

    if (buildID) {
      info += ` from commit ${buildID}`
    }

    return `${info}.`
  }

  @action
  share() {
    this.shareURL = location.href
    this.showShareDialog = true

    scheduleOnce('afterRender', this, 'shareFocus')
  }

  shareFocus() {
    let input = document.querySelector('.share-input input')

    input.focus()
    input.select()
  }

  @tracked regionFilter = ''
  @tracked regionSortBy = '-deceased'

  get rootOption() {
    return this.model.rootOption
  }

  get regionOptions() {
    return this.model.regionOptions
  }

  get selectedOptions() {
    return this.model.selectedOptions
  }

  set selectedRegionCodes(value) {
    if (!this.model) return

    let { selectedOptions, regionOptions } = this
    let codes = new Set(value.split('-'))

    for (let option of selectedOptions) {
      if (codes.has(option.code)) {
        codes.delete(option.code)
      } else {
        selectedOptions.removeObject(option)
      }
    }

    selectedOptions.pushObjects(
      [...codes].map((c) => regionOptions.findBy('code', c)).filter(Boolean)
    )

    if (this.selectedOptions.length > LEGEND_LIMIT) {
      this.showLegend = false
    }
  }

  get selectedRegionCodes() {
    if (!this.model) return ''

    return this.selectedOptions.map((o) => o.code).join('-')
  }

  @action
  toggleRegion(option) {
    option.selected = !option.selected

    if (option.selected) {
      this.selectedOptions.pushObject(option)
    } else {
      this.selectedOptions.removeObject(option)
    }

    if (this.selectedOptions.length > LEGEND_LIMIT) {
      this.showLegend = false
    }
  }

  @action
  toggleChildren(option) {
    let allSelected = option.children.every((c) => c.selected)
    let targetState = allSelected ? false : true

    for (let child of option.children) {
      if (child.selected !== targetState) {
        child.selected = targetState

        if (targetState) {
          this.selectedOptions.pushObject(child)
        } else {
          this.selectedOptions.removeObject(child)
        }
      }
    }

    if (this.selectedOptions.length > LEGEND_LIMIT) {
      this.showLegend = false
    }
  }

  get hasSelection() {
    return this.selectedOptions.length > 0
  }

  @tracked xStartOffset = START_OFFSET

  get chartPlugins() {
    return [hideTooltipOnLegend]
  }

  get chartOptions() {
    let {
      xSelection,
      xLog,
      xStartOffset,
      ySelection,
      yChange,
      yMovingAverage,
      yLog,
      yRatio,
      showLegend,
      stacked
    } = this

    let xLabel, yLabel

    if (xSelection === 'date') {
      xLabel = 'Date'
    } else if (xSelection === 'start') {
      xLabel = `Days since ${xStartOffset}th confirmed case`
    } else {
      xLabel = 'Confirmed cases'
    }

    if (ySelection === 'confirmed') {
      yLabel = yChange ? 'New confirmed cases' : 'Total confirmed cases'
    } else {
      yLabel = yChange ? 'New deaths' : 'Total deaths'
    }

    if (yChange && yMovingAverage) {
      yLabel += ` (7-day moving average)`
    }

    if (yRatio) {
      yLabel = `${yLabel} (per million people)`
    }

    let pluginConfig = {}

    if (xSelection !== 'confirmed') {
      pluginConfig.crosshair = {
        line: {
          color: '#888',
          width: 1
        },
        snap: {
          enabled: true
        },
        zoom: {
          enabled: false, // TODO: save/restore zoom to/from querystring
          zoomboxBackgroundColor: 'rgba(128, 128, 128,0.2)',
          zoomboxBorderColor: '#888',
          zoomButtonText: 'Reset Zoom',
          zoomButtonClass: 'reset-zoom md-button md-raised'
        }
      }
    }

    return {
      defaultFontFamily: 'Roboto, "Helvetica Neue", sans-serif;',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      hover: {
        animationDuration: 0,
        intersect: false
      },
      responsiveAnimationDuration: 0,
      legend: {
        display: showLegend,
        position: 'bottom',
        onClick: (e, item) => {
          if (this.selectedOptions.length > 1) {
            this.toggleRegion(
              this.selectedOptions.sortBy('value')[item.datasetIndex]
            )
          }
        },
        labels: {
          boxWidth: 12
        }
      },
      tooltips: {
        mode: 'nearest',
        position: 'nearest',
        axis: xSelection === 'confirmed' ? null : 'x',
        intersect: false,
        callbacks: {
          title: function ([item], { datasets }) {
            let point = datasets[item.datasetIndex].data[item.index]

            if (xSelection === 'date') {
              return moment(point.t).format('ll')
            } else if (xSelection === 'start') {
              return `Day ${item.xLabel} since ${xStartOffset}th confirmed case`
            } else {
              return `${item.xLabel} confirmed cases`
            }
          }
        }
      },
      elements: {
        point: {
          radius: 2
        }
      },
      scales: {
        xAxes: [
          {
            type:
              xSelection === 'date' ? 'time' : xLog ? 'logarithmic' : 'linear',
            scaleLabel: {
              display: true,
              labelString: xLabel
            },
            ticks: xSelection === 'confirmed' ? { callback: formatYTick } : {}
          }
        ],
        yAxes: [
          {
            position: 'right',
            type: yLog ? 'logarithmic' : 'linear',
            scaleLabel: {
              display: true,
              labelString: yLabel
            },
            ticks: {
              callback: formatYTick
            },
            stacked
          }
        ]
      },
      plugins: pluginConfig
    }
  }

  get chartData() {
    let {
      xSelection,
      xLog,
      ySelection,
      yLog,
      yChange,
      yMovingAverage,
      yRatio,
      selectedOptions,
      stacked
    } = this

    let xField = xSelection
    let yField = ySelection

    if (yChange) {
      if (yMovingAverage) {
        yField = `${yField}Moving`
      }

      yField = `${yField}Change`
    }

    return {
      datasets: selectedOptions
        .filter((o) => !yRatio || o.population)
        .map((option) => {
          let { hue, saturation, lightness, population } = option

          return generateDataset(
            option.points,
            xField,
            xLog,
            yField,
            yLog,
            yRatio ? 1000000 / population : 1,
            START_OFFSET,
            {
              label: option.longLabel,
              fill: stacked && !yLog && xSelection === 'date',
              lineTension: 0,
              borderColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
              backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
              hoverBorderColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
              hoverBackgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`
            }
          )
        })
    }
  }

  @tracked downloadURL = null

  @action
  downloadChart() {
    this.downloadURL = document.querySelector('canvas').toDataURL('image/png')
  }
}
