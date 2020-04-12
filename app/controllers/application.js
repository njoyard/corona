import Controller from '@ember/controller'
import { tracked } from '@glimmer/tracking'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { scheduleOnce } from '@ember/runloop'
import moment from 'moment'
import env from 'corona/config/environment'
import { generateDataset, formatYTick, formatXDate } from 'corona/utils/chart'
import presets from 'corona/utils/presets'
import { ordinal } from 'corona/utils/format'

const { buildID, buildDate } = env.APP

const LEGEND_LIMIT = 20
const XOFFSET_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]

export default class ApplicationController extends Controller {
  @service data
  @service media

  queryParams = [
    { dataset: 'd' },
    { xSelection: 'x' },
    { xLog: 'xl' },
    { xStartOffset: 'xs' },
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

  @tracked _xStartOffset = 5

  get xStartOffset() {
    return this._xStartOffset
  }

  set xStartOffset(value) {
    this._xStartOffset = value
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

    if (
      ds === 'us' &&
      (this.ySelection === 'recovered' || this.ySelection === 'active ')
    ) {
      this.ySelection = 'confirmed'
    }

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

  get xStartOffsetOrdinal() {
    return ordinal(XOFFSET_STEPS[this.xStartOffset])
  }

  get chartPlugins() {
    return []
  }

  get chartOptions() {
    let {
      xSelection,
      xLog,
      xStartOffsetOrdinal,
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
      xLabel = `Days since ${xStartOffsetOrdinal} confirmed case`
    } else {
      xLabel = 'Confirmed cases'
    }

    if (ySelection === 'confirmed') {
      yLabel = yChange
        ? 'Daily increase in confirmed cases'
        : 'Total confirmed cases'
    } else if (ySelection === 'deceased') {
      yLabel = yChange ? 'Daily increase in deaths' : 'Total deaths'
    } else if (ySelection === 'recovered') {
      yLabel = yChange ? 'Daily increase in recoveries' : 'Total recoveries'
    } else if (ySelection === 'active') {
      yLabel = yChange ? 'Daily increase in active cases' : 'Total active cases'
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

    if (xSelection === 'confirmed') xTicksConfig.callback = formatYTick
    if (xSelection === 'date') xTicksConfig.callback = formatXDate

    return {
      fontFamily: 'Roboto, "Helvetica Neue", sans-serif;',
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
        active: { duration: 0 },
        resize: { duration: 0 }
      },
      hover: {
        mode: 'dataset',
        intersect: false
      },
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
        intersect: false,
        callbacks: {
          title: function ([item], { datasets }) {
            let point = datasets[item.datasetIndex].data[item.index]

            if (xSelection === 'date') {
              return moment(point.t).format('ll')
            } else if (xSelection === 'start') {
              return `Day ${item.xLabel} since ${xStartOffsetOrdinal} confirmed case`
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
        x: {
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
        },
        y: {
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
      },
      plugins: {}
    }
  }

  get chartData() {
    let {
      xSelection,
      xStartOffset,
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
        .filter(
          (o) =>
            (!yRatio || o.population) &&
            ((ySelection !== 'recovered' && ySelection !== 'active') ||
              o.recovered)
        )
        .map((option) => {
          let { hue, saturation, lightness, population } = option

          return generateDataset(
            option.points,
            xField,
            yField,
            yRatio ? 1000000 / population : 1,
            yLog,
            XOFFSET_STEPS[xStartOffset],
            'confirmed',
            {
              label: option.longLabel,
              fill: stacked && xSelection === 'date',
              lineTension: 0,
              borderColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
              backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
              borderWidth: 2,
              hoverBorderColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
              hoverBackgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
              hoverBorderWidth: 3,
              pointRadius: 1,
              pointHoverRadius: 1
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
}
