import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import Controller from '@ember/controller'
import { tracked } from '@glimmer/tracking'

import Chart from 'corona/models/chart'
import CustomSeries from 'corona/models/custom-series'
import { allColors } from 'corona/utils/colors'
import slugify from 'corona/utils/slugify'

export default class CustomController extends Controller {
  @service customCharts
  @service intl
  @service router

  /*********************************
   * Enum values
   */

  colors = Object.values(allColors)
  types = ['line', 'points', 'bar']
  scales = ['count', 'percent', 'log']

  /*********************************
   * Aliases
   */

  get chart() {
    return this.model.chart
  }

  get dataset() {
    return this.model.dataset
  }

  get fieldNames() {
    return this.dataset.allFields
  }

  get series() {
    return this.chart.series
  }

  get hasBars() {
    return this.series.some((s) => s.type === 'bar')
  }

  /*********************************
   * Validity
   */

  get isValid() {
    return (
      this.titleErrors.length === 0 &&
      this.series.every((s) => s.errors.length === 0)
    )
  }

  get titleErrors() {
    if (slugify(this.chart.title) === '') {
      return [this.intl.t('custom.errors.missing-title')]
    }

    return []
  }

  /*********************************
   * Preview
   */

  get isPreviewable() {
    return this.series.some((s) => s.errors.length === 0)
  }

  get preview() {
    let { isPreviewable, chart, dataset } = this

    if (isPreviewable) {
      let preview = Chart.fromCustomRepr(chart.repr)
      let { root } = dataset.forChart(preview)

      return { chart: preview, root }
    }

    return null
  }

  @tracked _previewZone = null

  get previewZone() {
    let { _previewZone, preview } = this

    if (preview) {
      let { root } = preview
      if (_previewZone && root.has(_previewZone.id)) {
        return _previewZone
      }

      return root
    }

    return null
  }

  set previewZone(zone) {
    this._previewZone = zone
  }

  /*********************************
   * Adding/removing series
   */

  createSeries() {
    let { intl, fieldNames, series } = this
    let label = intl.t('custom.new-series')
    let counter = 0

    while (series.find((s) => s.label === label)) {
      label = `${intl.t('custom.new-series')} #${++counter}`
    }

    let created = new CustomSeries(label, intl, fieldNames)

    return created
  }

  @action
  addSeries() {
    this.series.pushObject(this.createSeries())
  }

  @action
  delSeries(s) {
    this.series.removeObject(s)
  }

  /*********************************
   * Saving
   */

  @action
  save() {
    let { isValid, chart, customCharts, router } = this

    if (isValid) {
      let id = chart.id
        ? customCharts.update(chart.repr)
        : customCharts.save(chart.repr)

      router.transitionTo('chart', id)
    }
  }

  @action
  delete() {
    let {
      chart: { id },
      router,
      customCharts
    } = this

    customCharts.remove(id)
    router.transitionTo('application')
  }
}
