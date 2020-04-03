import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import moment from 'moment';
import env from "corona/config/environment";

const { buildID, buildDate } = env.APP;

function generateDataset(source, xField, xLog, yField, yLog, options = {}) {
  // Remove zeroes for log scales
  if (xLog) {
    source = source.filter(p => p[xField])
  }

  if (yLog) {
    source = source.filter(p => p[yField])
  }

  if (xField === "start") {
    let firstIndex = source.findIndex(p => p[yField])
    source = source.slice(firstIndex)
  }

  return Object.assign({
    data: source.map((point, index) => {
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
  }, options)
}

function formatYTick(number) {
  if (number >= 1000000) return `${number/1000000}M`
  if (number >= 1000) return `${number/1000}k`
  return `${number}`
}

export default class ApplicationController extends Controller {
  @tracked speedDialOpen = false;
  @tracked showAboutDialog = false;

  get versionInfo() {
    let info = `This version was built on ${buildDate}`

    if (buildID) {
      info += ` from commit ${buildID}`
    }

    return `${info}.`
  }

  @tracked regionFilter = '';

  get data() {
    return this.model.data
  }

  get worldOption() {
    return this.model.worldOption
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
  }

  @action
  toggleChildren(option) {
    let allSelected = option.children.every(c => c.selected)
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
  }

  @action
  resetRegions() {
    for (let option of this.selectedOptions) {
      option.selected = false
    }
    this.selectedOptions.clear()

    this.worldOption.selected = true
    this.selectedOptions.pushObject(this.worldOption)
  }

  get hasSelection() {
    return this.selectedOptions.length > 0
  }

  get filteredRegions() {
    let {
      regionOptions,
      regionFilter
    } = this

    if (!regionFilter) return regionOptions

    let filter = regionFilter.toLowerCase()
    return regionOptions.filter(o => o.value.toLowerCase().indexOf(filter) !== -1)
  }

  @tracked xSelection = "date"
  @tracked xLog = false;

  @tracked ySelection = "confirmed";
  @tracked yLog = false;
  @tracked yChange = false;

  @tracked showLegend = true;
  @tracked stacked = false;

  get chartOptions() {
    let {
      xSelection, xLog,
      ySelection, yChange, yLog,
      showLegend,
      stacked
    } = this

    let xLabel, yLabel

    if (xSelection === 'date') {
      xLabel = 'Date'
    } else if (xSelection === 'start') {
      xLabel = 'Days since first confirmed case'
    } else {
      xLabel = 'Confirmed cases'
    }

    if (ySelection === 'confirmed') {
      yLabel = yChange ? 'New confirmed cases'  : 'Total confirmed cases'
    } else {
      yLabel = yChange ? 'New deaths' : 'Total deaths'
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      legend: {
        display: showLegend,
        position: 'bottom'
      },
      tooltips: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
        callbacks: {
          title: function([item], { datasets }) {
            let point = datasets[item.datasetIndex].data[item.index]

            if (xSelection === 'date') {
              return moment(point.t).format('ll')
            } else if (xSelection === 'start') {
              return `Day ${item.xLabel} since first confirmed case`
            } else {
              return `${item.xLabel} confirmed cases`
            }
          }
        }
      },
      scales: {
        xAxes: [
          {
            type: xSelection === 'date' ? 'time' : (xLog ? 'logarithmic' : 'linear'),
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
              labelString: yLabel,
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
      xSelection, xLog,
      ySelection, yLog, yChange,
      data,
      selectedOptions
    } = this

    let xField = xSelection
    let yField = ySelection
    if (yChange) yField = `${yField}Change`

    let selectedRegions = selectedOptions.map(o => o.value).sort()
    let regions = selectedRegions.map(s => {
      if (s === 'World') return data
      if (s.indexOf('|') === -1) return data[s]

      let [country, province] = s.split('|')
      return data[country][province]
    })

    return {
      datasets: regions.map((s, i) => {
        let { hue, saturation, lightness } = selectedOptions[i]
        
        return generateDataset(s._total, xField, xLog, yField, yLog, {
          label: selectedRegions[i].replace(/(.*)\|(.*)/, (m, p1, p2) => `${p1} (${p2})`),
          fill: false,
          lineTension: 0,
          borderColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
          backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 75%)`,
          hoverBorderColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
          hoverBackgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 75%)`
        })
      })
    }
  }

  @tracked downloadURL = null;

  @action
  downloadChart() {
    this.downloadURL = document.querySelector('canvas').toDataURL('image/png')
  }
}

