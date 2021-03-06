import CCSEDataSource from './csse-base'

export default class USCSSEDataSource extends CCSEDataSource {
  region = 'global'

  scopes = {
    confirmed: {
      skip: 4,
      levels: [1, 0],
      populationLookup: [1, 0]
    },
    deceased: {
      skip: 4,
      levels: [1, 0]
    },
    recovered: {
      skip: 4,
      levels: [1, 0]
    }
  }
}
