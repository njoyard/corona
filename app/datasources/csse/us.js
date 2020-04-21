import CCSEDataSource from 'corona/datasources/csse/-base'

export default class USCSSEDataSource extends CCSEDataSource {
  region = 'US'

  scopes = {
    confirmed: {
      skip: 11,
      levels: ['US', 6, 5],
      levelLabels: ['country', 'state', 'county']
    },
    deceased: {
      skip: 12,
      levels: ['US', 6, 5],
      levelLabels: ['country', 'state', 'county'],
      populationField: 11
    }
  }
}
