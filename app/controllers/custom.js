import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import Controller from '@ember/controller'
import { tracked } from '@glimmer/tracking'

import Chart from 'corona/models/chart'
import CustomSeries from 'corona/models/custom-series'
import { colors } from 'corona/utils/colors'
import slugify from 'corona/utils/slugify'

export default class CustomController extends Controller {
  @service customCharts
  @service intl
  @service('modalsManager') modals
  @service router

  /*********************************
   * Enum values
   */

  colors = Object.values(colors)
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

  get allFields() {
    return this.dataset.allFields
  }

  get fieldNames() {
    return [...this.allFields].sort()
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
    let { intl, allFields, series } = this
    let label = intl.t('custom.new-series')
    let counter = 0

    while (series.find((s) => s.label === label)) {
      label = `${intl.t('custom.new-series')} #${++counter}`
    }

    let created = new CustomSeries(label, intl, allFields)

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
      let newId = chart.id
        ? customCharts.update(chart.id, chart.repr)
        : customCharts.save(chart.repr)

      router.transitionTo('chart', newId)
    }
  }

  @action
  async delete() {
    let {
      chart: { id, title },
      router,
      customCharts,
      modals,
      intl
    } = this

    try {
      await modals.confirm({
        title: '',
        clickOutsideToClose: true,
        escapeToClose: true,
        body: intl.t('custom.delete-confirm.message', { chart: title }),
        confirm: intl.t('custom.delete-confirm.confirm'),
        decline: intl.t('custom.delete-confirm.decline'),
        declineButtonPrimary: true,
        declineButtonRaised: true
      })
    } catch (e) {
      return
    }

    customCharts.remove(id)
    router.transitionTo('application')
  }
}
