import Controller from '@ember/controller'
import { tracked } from '@glimmer/tracking'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import moment from 'moment'
import env from 'corona/config/environment'

const { buildID, buildDate } = env.APP

const LEGEND_LIMIT = 20
const START_OFFSET = 10

function generateDataset(source, xField, xLog, yField, yLog, options = {}) {
  // Remove zeroes for log scales
  if (xLog) {
    source = source.filter((p) => p[xField])
  }

  if (yLog) {
    source = source.filter((p) => p[yField])
  }

  if (xField === 'start') {
    let firstIndex = source.findIndex((p) => p[yField] >= START_OFFSET)
    source = source.slice(firstIndex)
  }

  let data = source.map((point, index) => {
    let datapoint = {
      y: point[yField]
    }

    if (xField === 'date') {
      datapoint.t = new Date(point.date)
    } else if (xField === 'start') {
      datapoint.x = index
    } else {
      datapoint.x = point[xField]
    }

    return datapoint
  })

  if (xField === 'confirmed') {
    // Remove duplicate points
    data = data.reduce((points, point) => {
      let lastPoint = points[points.length - 1]

      if (!lastPoint || lastPoint.x !== point.x || lastPoint.y !== point.y) {
        points.push(point)
      }

      return points
    }, [])
  }

  return Object.assign({ data }, options)
}

function formatYTick(number) {
  if (number >= 1000000) return `${number / 1000000}M`
  if (number >= 1000) return `${number / 1000}k`
  return `${number}`
}

export default class ApplicationController extends Controller {
  @service data

  queryParams = ['dataset']

  @tracked dataset = 'csse-global-flat'

  @action
  selectDataset(ds) {
    this.data.reloading = true
    this.showSourcesDialog = false
    this.dataset = ds
  }

  @tracked showAboutDialog = false
  @tracked showSourcesDialog = false

  get versionInfo() {
    let info = `This version was built on ${buildDate}`

    if (buildID) {
      info += ` from commit ${buildID}`
    }

    return `${info}.`
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

  @action
  resetRegions() {
    for (let option of this.selectedOptions) {
      option.selected = false
    }
    this.selectedOptions.clear()

    this.rootOption.selected = true
    this.selectedOptions.pushObject(this.rootOption)
  }

  get hasSelection() {
    return this.selectedOptions.length > 0
  }

  @tracked xStartOffset = START_OFFSET
  @tracked xSelection = 'date'
  @tracked xLog = false

  @tracked ySelection = 'confirmed'
  @tracked yLog = false
  @tracked yChange = false

  @tracked showLegend = true
  @tracked stacked = false

  get chartOptions() {
    let {
      xSelection,
      xLog,
      xStartOffset,
      ySelection,
      yChange,
      yLog,
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

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      hover: { animationDuration: 0 },
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
      }
    }
  }

  get chartData() {
    let {
      xSelection,
      xLog,
      ySelection,
      yLog,
      yChange,
      model: { data },
      selectedOptions,
      rootOption
    } = this

    let xField = xSelection
    let yField = ySelection
    if (yChange) yField = `${yField}Change`

    let selectedRegions = selectedOptions.sortBy('value')
    let regions = selectedRegions.map((s) => {
      let v = s.value

      if (v === rootOption.value) return data
      if (v.indexOf('|') === -1) return data[v]

      let [country, province] = v.split('|')
      return data[country][province]
    })

    return {
      datasets: regions.map((s, i) => {
        let { hue, saturation, lightness } = selectedRegions[i]

        return generateDataset(s._total, xField, xLog, yField, yLog, {
          label: selectedRegions[i].value.replace(
            /(.*)\|(.*)/,
            (m, p1, p2) => `${p1} (${p2})`
          ),
          fill: false,
          lineTension: 0,
          borderColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
          backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
          hoverBorderColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
          hoverBackgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`
        })
      })
    }
  }

  @tracked downloadURL = null

  @action
  downloadChart() {
    this.downloadURL = document.querySelector('canvas').toDataURL('image/png')
  }
}
