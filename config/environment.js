'use strict'

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'corona',
    environment,
    rootURL: process.env.CORONA_ROOT_URL || '/',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      buildDate: Date.now(),
      dataThreshold: 5,
      compareMaxSeries: 12,
      dataURL:
        'https://raw.githubusercontent.com/njoyard/corona/data/corona.json'
    }
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none'

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false
    ENV.APP.LOG_VIEW_LOOKUPS = false

    ENV.APP.rootElement = '#ember-testing'
    ENV.APP.autoboot = false
  }

  return ENV
}
