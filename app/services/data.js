import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

const MIN_LIGHTNESS = 50;
const MAX_LIGHTNESS = 80;
const LIGHTNESS_LEVELS = 4;

const HUE_VARIANT = 5;

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
    this.saturation = MIN_LIGHTNESS + (Math.floor(crc / (360 * HUE_VARIANT)) % LIGHTNESS_LEVELS) * (MAX_LIGHTNESS - MIN_LIGHTNESS) / LIGHTNESS_LEVELS
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
}

export default class DataService extends Service {
  @service dataCsse;
  
  get source() {
    return this.dataCsse
  }

  async data(selected = ['World']) {
    let sourceData = await this.source.data()

    let worldOption = new RegionOption('World', 'World', selected.indexOf('World') !== -1)
    worldOption.saturation = 0
    worldOption.lightness = 30

    let options = [worldOption]

    let countries = Object.keys(sourceData).filter(c => c !== '_total').sort()
    for (let country of countries) {
      let countryOption = new RegionOption(country, country, selected.indexOf(country) !== -1, 1)

      options.push(countryOption)
      worldOption.addChild(countryOption)

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
    dataset.worldOption = worldOption
    dataset.regionOptions = A(options)
    dataset.selectedOptions = A(options.filter(o => o.selected))

    return dataset
  }
}
