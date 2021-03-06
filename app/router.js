import EmberRouter from '@ember/routing/router'
import config from 'corona/config/environment'

export default class Router extends EmberRouter {
  location = config.locationType
  rootURL = config.rootURL
}

Router.map(function () {
  this.route('chart', { path: '/chart/:chart_id' }, function () {
    this.route('zone', { path: '/:zone_id' })
  })

  this.route('custom', { path: '/custom/:chart_id' })
})
