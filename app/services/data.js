import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

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

    let worldOption = new RegionOption()
    worldOption.value = 'World'
    worldOption.label = 'World'
    worldOption.selected = selected.indexOf('World') !== -1

    let options = [worldOption]

    let countries = Object.keys(sourceData).filter(c => c !== '_total').sort()
    for (let country of countries) {
      let countryOption = new RegionOption()
      countryOption.value = countryOption.label = country
      countryOption.level = 1
      countryOption.selected = selected.indexOf(country) !== -1

      options.push(countryOption)
      worldOption.addChild(countryOption)

      if (Object.keys(sourceData[country]).length > 2) {
        let provinces = Object.keys(sourceData[country]).filter(p => p !== '_total').sort()
        if (provinces.indexOf('Mainland') !== -1) {
          provinces = provinces.filter(p => p !== 'Mainland')
          provinces.unshift('Mainland')
        }

        for (let province of provinces) {
          let provinceOption = new RegionOption()
          provinceOption.value = `${country}|${province}`
          provinceOption.label = province
          provinceOption.level = 2
          provinceOption.selected = selected.indexOf(provinceOption.value) !== -1

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
