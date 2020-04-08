import Controller from '@ember/controller'
import { tracked } from '@glimmer/tracking'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { scheduleOnce } from '@ember/runloop'
import moment from 'moment'
import env from 'corona/config/environment'
import { generateDataset, formatYTick, plugins } from 'corona/utils/chart'
import presets from 'corona/utils/presets'

const { buildID, buildDate } = env.APP
const { hideTooltipOnLegend } = plugins

const LEGEND_LIMIT = 20
const START_OFFSET = 50

export default class ApplicationController extends Controller {
  @service data
  @service media

  queryParams = [
    { dataset: 'd' },
    { xSelection: 'x' },
    { xLog: 'xl' },
    { xMin: 'x1' },
    { xMax: 'x2' },
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

  @tracked _xMin

  get xMin() {
    return this._xMin
  }

  set xMin(value) {
    this._xMin = value
  }

  @tracked _xMax

  get xMax() {
    return this._xMax
  }

  set xMax(value) {
    this._xMax = value
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

  @tracked _sideNavOpen = null

  get sideNavOpen() {
    let newValue = this.media.isWide ? null : this._sideNavOpen

    if (this.chart && newValue !== this._sideNavOpen) {
      // Force resize of the chart, needed because the sidenav animation
      // when switching between narrow and wide screen (eg. when rotating
      // the device) prevents chartjs detecting the resize
      setTimeout(() => this.chart.resize(), 1500)
    }

    return newValue
  }

  set sideNavOpen(value) {
    this._sideNavOpen = value
  }

  get sideNavLockedOpen() {
    return this.media.isWide
  }

  @tracked speedDialOpen = false
  @tracked showAboutDialog = false
  @tracked showSourcesDialog = false
  @tracked showShareDialog = false
  @tracked showPresetDialog = false
  @tracked shareURL = location.href

  presets = presets

  @action selectPreset(preset) {
    this.setProperties(preset.params)
    this.showPresetDialog = false
  }

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

  @action
  setXSelection(xSelection) {
    this.send('applyZoom', null, null)
    this.xSelection = xSelection
  }

  @action
  setXLog(xLog) {
    this.send('applyZoom', null, null)
    this.xLog = xLog
  }

  get chartPlugins() {
    return [hideTooltipOnLegend]
  }

  get chartOptions() {
    let {
      xSelection,
      xLog,
      xStartOffset,
      xMin,
      xMax,
      ySelection,
      yChange,
      yMovingAverage,
      yLog,
      yRatio,
      showLegend,
      stacked
    } = this

    let controller = this

    let xLabel, yLabel

    if (xSelection === 'date') {
      xLabel = 'Date'
    } else if (xSelection === 'start') {
      xLabel = `Days since ${xStartOffset}th confirmed case`
    } else {
      xLabel = 'Confirmed cases'
    }

    if (ySelection === 'confirmed') {
      yLabel = yChange
        ? 'Daily increase in confirmed cases'
        : 'Total confirmed cases'
    } else {
      yLabel = yChange ? 'Daily increase in deaths' : 'Total deaths'
    }

    let yLabelDetails = []

    if (yChange && yMovingAverage) {
      yLabelDetails.push('7-day moving average')
    }

    if (yRatio) {
      yLabelDetails.push('per million people')
    }

    if (yLabelDetails.length) {
      yLabel = `${yLabel} (${yLabelDetails.join(', ')})`
    }

    let xTicksConfig = {}

    if (xMin) xTicksConfig.min = Number(xMin)
    if (xMax) xTicksConfig.max = Number(xMax)
    if (xSelection === 'confirmed') xTicksConfig.callback = formatYTick

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
            time: {
              unit: 'day'
            },
            scaleLabel: {
              display: true,
              labelString: xLabel,
              fontSize: 14
            },
            ticks: xTicksConfig
          }
        ],
        yAxes: [
          {
            position: 'right',
            type: yLog ? 'logarithmic' : 'linear',
            scaleLabel: {
              display: true,
              labelString: yLabel,
              fontSize: 14
            },
            ticks: {
              callback: formatYTick
            },
            stacked
          }
        ]
      },
      plugins: {
        crosshair: xLog
          ? false
          : {
              line: {
                color: '#888',
                width: 1
              },
              snap: {
                enabled: true
              },
              zoom: {
                enabled: !xLog,
                zoomboxBackgroundColor: 'rgba(128, 128, 128,0.2)',
                zoomboxBorderColor: '#888'
              },
              callbacks: {
                beforeZoom(from, to) {
                  controller.send('applyZoom', Number(from), Number(to))
                  return false
                }
              }
            }
      }
    }
  }

  get chartData() {
    let {
      xSelection,
      ySelection,
      yChange,
      yMovingAverage,
      yRatio,
      yLog,
      selectedOptions,
      stacked
    } = this

    let xField = xSelection
    let yField = ySelection

    if (yChange) {
      if (yMovingAverage) {
        yField = `${yField}Weekly`
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
            yField,
            yRatio ? 1000000 / population : 1,
            yLog,
            START_OFFSET,
            {
              label: option.longLabel,
              fill: stacked && xSelection === 'date',
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

  chart = null

  @action
  chartChanged(chart) {
    this.chart = chart
  }

  @tracked downloadURL = null

  @action
  downloadChart() {
    this.downloadURL = document.querySelector('canvas').toDataURL('image/png')
  }

  @action
  applyZoom(from, to) {
    this.xMin = from
    this.xMax = to
    this.notifyPropertyChange('chartOptions')
  }
}
