import CCSEDataSource from './csse-base'

export default class USCSSEDataSource extends CCSEDataSource {
  region = 'US'

  scopes = {
    confirmed: {
      skip: 11,
      levels: ['United States', 6, 5]
    },
    deceased: {
      skip: 12,
      levels: ['United States', 6, 5],
      populationField: 11
    }
  }
}
