import Service from '@ember/service'
import { tracked } from '@glimmer/tracking'
import { A } from '@ember/array'

import AppDataSet from 'corona/models/app-dataset'
import delay from 'corona/utils/delay'
import { datasets, defaultDataset } from 'corona/utils/datasets'
import { computeFields } from 'corona/utils/fields'
import buildRegionOptions from 'corona/utils/regions'

function visit(option) {
  let all = [option]
  for (let child of option.children) {
    all.push(...visit(child))
  }
  return all
}

export default class DataService extends Service {
  @tracked reloading = false
  @tracked loadingState = null

  datasets = datasets
  defaultDataset = defaultDataset

  async data(datasetName, selectedRegionCodes) {
    let { datasets, defaultDataset } = this
    let dataset = datasets[datasetName] || datasets[defaultDataset]

    this.loadingState = 'fetching data'

    let { label: rootLabel, data: sourceData } = await dataset.fetchData(
      (state) => (this.loadingState = state)
    )

    this.loadingState = 'computing daily changes'

    await delay(() => computeFields(sourceData))

    this.loadingState = 'building region options'

    let data = await delay(() => {
      let root = buildRegionOptions(sourceData, rootLabel, selectedRegionCodes)

      let options = visit(root)
      let dataset = new AppDataSet()

      dataset.rootRegion = root
      dataset.regionOptions = A(options)
      dataset.selectedRegions = A(options.filter((o) => o.selected))

      return dataset
    })

    this.loadingState = 'starting application'

    await delay(() => {})

    return data
  }
}
