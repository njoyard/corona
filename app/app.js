import Application from '@ember/application'
import { registerDeprecationHandler } from '@ember/debug'
import Resolver from 'ember-resolver'
import loadInitializers from 'ember-load-initializers'
import config from 'corona/config/environment'

registerDeprecationHandler((message, options, next) => {
  let { id } = options

  if (
    message.startsWith('<corona@component:paper-') &&
    id === 'ember-views.event-dispatcher.mouseenter-leave-move'
  ) {
    return
  }

  next(message, options)
})

export default class App extends Application {
  modulePrefix = config.modulePrefix
  podModulePrefix = config.podModulePrefix
  Resolver = Resolver
}

loadInitializers(App, config.modulePrefix)
