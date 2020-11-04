'use strict'

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'corona',
    environment,
    rootURL: process.env.CORONA_ROOT_URL || '/',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {},
      EXTEND_PROTOTYPES: {
        Date: false
      }
    },

    APP: {
      buildDate: Date.now(),

      // Ignore datasets with too few non-NaN points
      dataThreshold: 5,

      // When comparing only keep this number of series
      compareMaxSeries: 15,

      // Data source
      dataURL:
        'https://raw.githubusercontent.com/njoyard/corona/data/corona.json',

      // Sorting method for compare charts, one of 'max' or 'most-recent'
      sortMethod: 'max'
    }
  }

  if (environment === 'test') {
    ENV.locationType = 'none'

    ENV.APP.LOG_ACTIVE_GENERATION = false
    ENV.APP.LOG_VIEW_LOOKUPS = false

    ENV.APP.rootElement = '#ember-testing'
    ENV.APP.autoboot = false
  }

  return ENV
}
