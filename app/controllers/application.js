import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';

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

function getColor(count, index) {
  if (count <= 20) {
    return {
      hue: index * 360 / count,
      sat: '75%'
    }
  } else {
    let cnt = Math.ceil(count / 2)
    let idx = Math.floor(index / 2)
    let desaturate = index % 2

    return {
      hue: idx * 360 / count,
      sat: desaturate ? '25%' : '75%'
    }
  }
}

function formatYTick(number) {
  if (number >= 1000000) return `${number/1000000}M`
  if (number >= 1000) return `${number/1000}k`
  return `${number}`
}

class RegionOption {
  @tracked selected = false;
  @tracked value;
  @tracked label;
  @tracked level = 0;

  children = A([]);

  addChild(child) {
    this.children.pushObject(child)
  }

  get hasChildren() {
    return this.children.length > 0
  }
}

export default class ApplicationController extends Controller {
  @tracked speedDialOpen = false;
  @tracked showAboutDialog = false;

  @tracked regionFilter = '';
  @tracked selectedRegions = A(['World'])

  get regionOptions() {
    let { model } = this

    let worldOption = new RegionOption()
    worldOption.value = 'World'
    worldOption.label = 'World'
    worldOption.selected = true

    let options = A([worldOption])

    for (let country in model) {
      if (country === '_total') continue

      let countryOption = new RegionOption()
      countryOption.value = countryOption.label = country
      countryOption.level = 1

      options.pushObject(countryOption)
      worldOption.addChild(countryOption)

      if (Object.keys(model[country]).length > 2) {
        let provinces = Object.keys(model[country]).filter(p => p !== '_total').sort()
        if (provinces.indexOf('Mainland') !== -1) {
          provinces = provinces.filter(p => p !== 'Mainland')
          provinces.unshift('Mainland')
        }

        for (let province of provinces) {
          let provinceOption = new RegionOption()
          provinceOption.value = `${country},${province}`
          provinceOption.label = province
          provinceOption.level = 2

          countryOption.addChild(provinceOption)
          options.pushObject(provinceOption)
        }
      }
    }

    return options
  }

  @action
  toggleRegion(option) {
    option.selected = !option.selected

    if (option.selected) {
      this.selectedRegions.pushObject(option.value)
    } else {
      this.selectedRegions.removeObject(option.value)
    }
  }

  @action
  toggleChildren(option) {
    let allSelected = option.children.every(c => c.selected)
    let targetState = allSelected ? false : true

    for (let child of option.children) {
      child.selected = targetState

      if (targetState) {
        this.selectedRegions.pushObject(child.value)
      } else {
        this.selectedRegions.removeObject(child.value)
      }
    }
  }

  get hasSelection() {
    return this.selectedRegions.length > 0
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
        intersect: false
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
      model,
      selectedRegions,
      stacked
    } = this

    let xField = xSelection
    let yField = ySelection
    if (yChange) yField = `${yField}Change`

    let regions = selectedRegions.sort().map(s => {
      if (s === 'World') return model
      if (s.indexOf(',') === -1) return model[s]

      let [country, province] = s.split(',')
      return model[country][province]
    })

    return {
      datasets: regions.map((s, i) => {
        let { hue, sat } = getColor(regions.length, i)
        
        return generateDataset(s._total, xField, xLog, yField, yLog, {
          label: selectedRegions[i],
          fill: false,
          lineTension: 0,
          borderColor: `hsla(${hue}, ${sat}, 65%, 100%)`,
          backgroundColor: `hsla(${hue}, ${sat}, 65%, 75%)`,
          hoverBorderColor: `hsla(${hue}, ${sat}, 65%, 100%)`,
          hoverBackgroundColor: `hsla(${hue}, ${sat}, 65%, 75%)`
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

