import Service from '@ember/service'
import { inject as service } from '@ember/service'
import { tracked } from '@glimmer/tracking'
import { A } from '@ember/array'
import delay from 'corona/utils/delay'

const MIN_SATURATION = 25
const MAX_SATURATION = 90
const SATURATION_LEVELS = 4

const HUE_VARIANT = 1

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
  @tracked value
  @tracked label
  @tracked level = 0
  @tracked confirmed
  @tracked deceased

  @tracked hue
  @tracked saturation
  @tracked lightness = 65

  children = A([])

  constructor(value, label, level = 0) {
    this.value = value
    this.label = label
    this.level = level

    let crc = crc32(value)
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

  setStats(data) {
    let points = data._total
    let lastPoint = points[points.length - 1]

    this.confirmed = lastPoint.confirmed
    this.deceased = lastPoint.deceased
  }
}

class DataSet {
  @tracked selectedOptions
  @tracked rootOption
  @tracked regionOptions
  @tracked selectedOptions
}

export default class DataService extends Service {
  @service dataCsse

  @tracked reloading = false
  @tracked loadingState = null

  datasets = {
    'csse-global-flat': {
      title: 'CSSE (Global, simplified)',
      description:
        'Totals for each country, excluding countries with less than 100 confirmed cases to date.',
      us: false,
      world: true,
      deep: false,
      limit: 100
    },
    'csse-global': {
      title: 'CSSE (Global)',
      description:
        'Totals for each country, including counts for each province for selected countries.',
      us: false,
      world: true,
      deep: true
    },
    'csse-us': {
      title: 'CSSE (United States only)',
      description: 'United States data with counts for each state.',
      us: true,
      world: false,
      deep: false
    },
    'csse-global-us': {
      title: 'CSSE (Full)',
      description:
        'Complete dataset, including country provinces and US states. Will need a bit more time to load than other datasets.',
      us: true,
      world: true,
      deep: true
    }
  }

  defaultDataset = 'csse-global-flat'

  async data(dataset) {
    let { dataCsse, datasets, defaultDataset } = this
    let options = datasets[dataset] || datasets[defaultDataset]

    let sourceData = await dataCsse.data((state) => {
      this.loadingState = state
    }, options)
    let root = options.world ? 'World' : 'USA'

    this.loadingState = 'building region options'

    let data = await delay(() => {
      let rootOption = new RegionOption(root, root)
      rootOption.saturation = 0
      rootOption.lightness = 30
      rootOption.setStats(sourceData)

      let options = [rootOption]

      let countries = Object.keys(sourceData).filter((c) => c !== '_total')
      for (let country of countries) {
        let countryOption = new RegionOption(country, country, 1)

        countryOption.setStats(sourceData[country])

        options.push(countryOption)
        rootOption.addChild(countryOption)

        if (Object.keys(sourceData[country]).length > 2) {
          let provinces = Object.keys(sourceData[country]).filter(
            (p) => p !== '_total'
          )
          if (provinces.indexOf('Mainland') !== -1) {
            provinces = provinces.filter((p) => p !== 'Mainland')
            provinces.unshift('Mainland')
          }

          for (let province of provinces) {
            let provinceOption = new RegionOption(
              `${country}|${province}`,
              province,
              2
            )
            provinceOption.setStats(sourceData[country][province])

            countryOption.addChild(provinceOption)
            options.push(provinceOption)
          }
        }
      }

      for (let country of rootOption.children
        .sortBy('deceased')
        .reverse()
        .slice(0, DEFAULT_SELECTED_REGIONS)) {
        country.selected = true
      }

      let dataset = new DataSet()

      dataset.data = sourceData
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
