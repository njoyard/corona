import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import delay from 'corona/utils/delay';

const MIN_SATURATION = 25;
const MAX_SATURATION = 90;
const SATURATION_LEVELS = 4;

const HUE_VARIANT = 1;

let crc32 = (function() {
    let table = []
    let c;

    for (let i = 0; i < 256; i++) {
      c = i
      for (let j = 0; j < 8; j++)
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
      table[i] = c
    }

    return function(string) {
      let crc = 0 ^ (-1)

      for (let i = 0; i < string.length; i++)
        crc = (crc >>> 8) ^ table[(crc ^ string.charCodeAt(i)) & 255]

      return (crc ^ (-1)) >>> 0
    }
})()

class RegionOption {
  @tracked selected = false;
  @tracked value;
  @tracked label;
  @tracked level = 0;

  @tracked hue;
  @tracked saturation;
  @tracked lightness = 65;

  children = A([]);

  constructor(value, label, selected = false, level = 0) {
    this.value = value
    this.label = label
    this.selected = selected
    this.level = level

    let crc = crc32(value)
    this.hue = Math.floor(crc / HUE_VARIANT) % 360
    this.saturation = MIN_SATURATION + (Math.floor(crc / (360 * HUE_VARIANT)) % SATURATION_LEVELS) * (MAX_SATURATION - MIN_SATURATION) / SATURATION_LEVELS
  }

  addChild(child) {
    this.children.pushObject(child)
  }

  get hasChildren() {
    return this.children.length > 0
  }
}

class DataSet {
  @tracked selectedOptions;
  @tracked rootOption;
  @tracked regionOptions;
  @tracked selectedOptions;
}

export default class DataService extends Service {
  @service dataCsse;

  datasets = {
    'csse-us': {
      title: 'CSSE (United States only)',
      us: true,
      world: false,
      deep: false
    },
    'csse-global': {
      title: 'CSSE (Global)',
      us: false,
      world: true,
      deep: true
    },
    'csse-global-flat': {
      title: 'CSSE (Global, simplified)',
      us: false,
      world: true,
      deep: false,
      limit: 100
    }
  };

  @tracked dataset = 'csse-global-flat'

  async data(updateState) {
    let { dataCsse, dataset, datasets } = this
    let options = datasets[dataset]

    let sourceData = await this.dataCsse.data(updateState, options)
    let root = options.world ? 'World' : 'USA'
    let selected = [root]

    updateState('building region options')

    let data = await delay(() => {
      let rootOption = new RegionOption(root, root, selected.indexOf(root) !== -1)
      rootOption.saturation = 0
      rootOption.lightness = 30

      let options = [rootOption]

      let countries = Object.keys(sourceData).filter(c => c !== '_total').sort()
      for (let country of countries) {
        let countryOption = new RegionOption(country, country, selected.indexOf(country) !== -1, 1)

        options.push(countryOption)
        rootOption.addChild(countryOption)

        if (Object.keys(sourceData[country]).length > 2) {
          let provinces = Object.keys(sourceData[country]).filter(p => p !== '_total').sort()
          if (provinces.indexOf('Mainland') !== -1) {
            provinces = provinces.filter(p => p !== 'Mainland')
            provinces.unshift('Mainland')
          }

          for (let province of provinces) {
            let provinceOption = new RegionOption(`${country}|${province}`, province, selected.indexOf(`${country}|${province}`) !== -1, 2)

            countryOption.addChild(provinceOption)
            options.push(provinceOption)
          }
        }
      }

      let dataset = new DataSet()

      dataset.data = sourceData
      dataset.rootOption = rootOption
      dataset.regionOptions = A(options)
      dataset.selectedOptions = A(options.filter(o => o.selected))

      return dataset
    })

    updateState('starting application')

    await delay(() => {})

    return data
  }
}
