import Controller from '@ember/controller'
import { tracked } from '@glimmer/tracking'

export default class ApplicationLoadingController extends Controller {
  @tracked loadingState = null
}
