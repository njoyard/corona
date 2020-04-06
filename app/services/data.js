import Service from '@ember/service'
import { inject as service } from '@ember/service'
import { tracked } from '@glimmer/tracking'
import { A } from '@ember/array'
import delay from 'corona/utils/delay'
import { invalidate, register, codeFor } from 'corona/utils/countrycodes'

const MIN_SATURATION = 25
const MAX_SATURATION = 90
const SATURATION_LEVELS = 4

const HUE_VARIANT = 3

const DEFAULT_SELECTED_REGIONS = 5

let crc32 = (function () {
  let table = []
  let c

  for (let i = 0; i < 256; i++) {
    c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }

  return function (string) {
    let crc = 0 ^ -1

    for (let i = 0; i < string.length; i++)
      crc = (crc >>> 8) ^ table[(crc ^ string.charCodeAt(i)) & 255]

    return (crc ^ -1) >>> 0
  }
})()

class RegionOption {
  @tracked selected = false
  @tracked label
  @tracked longLabel
  @tracked code
  @tracked points
  @tracked level = 0
  @tracked confirmed
  @tracked deceased
  @tracked population

  @tracked hue
  @tracked saturation
  @tracked lightness = 65

  children = A([])

  constructor(code, label, longLabel, level = 0) {
    this.code = code
    this.label = label
    this.longLabel = longLabel
    this.level = level

    let crc = crc32(longLabel)
    this.hue = Math.floor(crc / HUE_VARIANT) % 360
    this.saturation =
      MIN_SATURATION +
      ((Math.floor(crc / (360 * HUE_VARIANT)) % SATURATION_LEVELS) *
        (MAX_SATURATION - MIN_SATURATION)) /
        SATURATION_LEVELS
  }

  addChild(child) {
    this.children.pushObject(child)
  }

  get hasChildren() {
    return this.children.length > 0
  }

  setData(data) {
    let points = (this.points = data._total)
    let lastPoint = points[points.length - 1]

    if (data._meta) {
      this.population = data._meta.population
    }

    this.confirmed = lastPoint.confirmed
    this.deceased = lastPoint.deceased
  }
}

class DataSet {
  @tracked selectedOptions
  @tracked rootOption
  @tracked regionOptions
}

export default class DataService extends Service {
  @service dataCsse

  @tracked reloading = false
  @tracked loadingState = null

  datasets = {
    flat: {
      title: 'Global simplified data',
      description:
        'Totals for each country, excluding countries with less than 100 confirmed cases to date.',
      us: false,
      world: true,
      deep: false,
      limit: 100
    },
    us: {
      title: 'United States',
      description: 'United States data with counts for each state.',
      us: true,
      world: false,
      deep: false
    },
    china: {
      title: 'China',
      description:
        'China only with counts for each province (population ratio not available yet)',
      us: false,
      world: true,
      root: 'China'
    },
    australia: {
      title: 'Australia',
      description:
        'Australia only with counts for each province (population ratio not available yet)',
      us: false,
      world: true,
      root: 'Australia'
    },
    global: {
      title: 'Global data with provinces',
      description:
        'Totals for each country, including counts for each province for selected countries.',
      us: false,
      world: true,
      deep: true
    },
    full: {
      title: 'Global data with provinces and US states',
      description:
        'Complete dataset, including country provinces and US states. Will need a bit more time to load than other datasets.',
      us: true,
      world: true,
      deep: true
    }
  }

  defaultDataset = 'flat'

  async data(dataset, selectedRegionCodes) {
    let { dataCsse, datasets, defaultDataset } = this
    let options = datasets[dataset] || datasets[defaultDataset]

    let selected = selectedRegionCodes
      ? new Set(selectedRegionCodes.split('-'))
      : new Set()

    let sourceData = await dataCsse.data((state) => {
      this.loadingState = state
    }, options)
    let root = options.root || (options.world ? 'World' : 'United States')

    this.loadingState = 'building region options'

    let data = await delay(() => {
      let rootOption = new RegionOption('__', root, root)
      rootOption.saturation = 0
      rootOption.lightness = 30
      rootOption.setData(sourceData)
      rootOption.selected = selected.has(rootOption.code)

      let options = [rootOption]

      invalidate()

      let countries = Object.keys(sourceData).filter((c) => !c.startsWith('_'))
      for (let country of countries) {
        register(country)

        if (Object.keys(sourceData[country]).length > 2) {
          let provinces = Object.keys(sourceData[country]).filter(
            (p) => !p.startsWith('_')
          )

          for (let province of provinces) {
            register(country, province)
          }
        }
      }

      for (let country of countries) {
        let countryOption = new RegionOption(
          codeFor(country),
          country,
          country,
          1
        )

        countryOption.setData(sourceData[country])
        countryOption.selected = selected.has(countryOption.code)

        options.push(countryOption)
        rootOption.addChild(countryOption)

        let provinces = Object.keys(sourceData[country]).filter(
          (k) => !k.startsWith('_')
        )

        if (provinces.length > 1) {
          if (provinces.indexOf('Mainland') !== -1) {
            provinces = provinces.filter((p) => p !== 'Mainland')
            provinces.unshift('Mainland')
          }

          for (let province of provinces) {
            let provinceOption = new RegionOption(
              codeFor(country, province),
              province,
              `${country} (${province})`,
              2
            )
            provinceOption.setData(sourceData[country][province])
            provinceOption.selected = selected.has(provinceOption.code)

            countryOption.addChild(provinceOption)
            options.push(provinceOption)
          }
        }
      }

      if (!selected.size) {
        // No selection, select countries with top deaths
        for (let country of rootOption.children
          .sortBy('deceased')
          .reverse()
          .slice(0, DEFAULT_SELECTED_REGIONS)) {
          country.selected = true
        }
      }

      let dataset = new DataSet()

      dataset.rootOption = rootOption
      dataset.regionOptions = A(options)
      dataset.selectedOptions = A(options.filter((o) => o.selected))

      return dataset
    })

    this.loadingState = 'starting application'

    await delay(() => {})

    return data
  }
}
