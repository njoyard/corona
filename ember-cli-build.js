'use strict'

const EmberApp = require('ember-cli/lib/broccoli/ember-app')

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      loose: true
    },
    fingerprint: {
      extensions: ['js', 'css', 'map']
    }
  })

  app.import('node_modules/luxon/build/global/luxon.js')
  app.import('node_modules/chart.js/dist/chart.js')
  app.import('node_modules/chartjs-adapter-luxon/dist/chartjs-adapter-luxon.js')

  return app.toTree()
}
