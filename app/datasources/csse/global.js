import CCSEDataSource from 'corona/datasources/csse/-base'

export default class USCSSEDataSource extends CCSEDataSource {
  region = 'global'

  scopes = {
    confirmed: {
      skip: 4,
      levels: [1, 0]
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
