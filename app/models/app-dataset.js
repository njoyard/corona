import { tracked } from '@glimmer/tracking'

export default class AppDataSet {
  @tracked selectedRegions
  @tracked rootRegion
  @tracked regionOptions
}
