import Application from 'corona/app'
import config from 'corona/config/environment'
import { setApplication } from '@ember/test-helpers'
import { start } from 'ember-qunit'

setApplication(Application.create(config.APP))

start()
