import Service from '@ember/service'
import { inject as service } from '@ember/service'
import { tracked } from '@glimmer/tracking'
import { A } from '@ember/array'

import AppDataSet from 'corona/models/app-dataset'
import delay from 'corona/utils/delay'
import { datasets, defaultDataset } from 'corona/utils/datasets'
import compute from 'corona/utils/compute'
import buildRegionOptions from 'corona/utils/regions'

function recCompute(data) {
  for (let region in data) {
    if (region.startsWith('_')) continue
    recCompute(data[region])
  }

  compute(data._points)
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

    let { label: rootLabel, data: sourceData } = await dataset.fetchData()

    this.loadingState = 'computing daily changes'

    await delay(() => recCompute(sourceData))

    this.loadingState = 'building region options'

    let data = await delay(() => {
      let { root, options } = buildRegionOptions(
        sourceData,
        rootLabel,
        selectedRegionCodes
      )

      let dataset = new AppDataSet()

      dataset.rootRegion = root
      dataset.regionOptions = A(options)
      dataset.selectedRegions = A(options.filter((o) => o.selected))

      return dataset
    })

    this.loadingState = 'starting application'

    await delay(() => {})
    console.log(data)

    return data
  }
}
