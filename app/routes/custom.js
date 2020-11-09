import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

import CustomChart from 'corona/models/custom-chart'
import CustomSeries from 'corona/models/custom-series'

export default class CustomRoute extends Route {
  @service customCharts
  @service intl
  @service('paperToaster') toast

  model({ chart_id }) {
    let dataset = this.modelFor('application')
    let { allFields } = dataset
    let { intl, customCharts } = this

    let model = { dataset }

    if (chart_id.startsWith('import:')) {
      return Object.assign(
        model,
        customCharts.import(chart_id.replace(/import:/, ''))
      )
    }

    if (chart_id === 'new') {
      let chart = new CustomChart()
      chart.series.pushObject(
        new CustomSeries(intl.t('custom.new-series'), intl, allFields)
      )

      chart.title = this.intl.t('custom.new')
      model.chart = chart
    } else {
      let customChart = customCharts.get(chart_id)
      model.chart = CustomChart.fromRepr(customChart.custom, intl, allFields)
    }

    return model
  }

  redirect(model, transition) {
    let { toast, intl } = this

    if (model.imported) {
      toast.show(intl.t('app.share.imported'))
      this.transitionTo('chart', model.imported)
    } else if (model.existing) {
      toast.show(intl.t('app.share.existing'))
      this.transitionTo('chart', model.existing)
    } else if (model.error) {
      toast.show(intl.t('app.share.error'))

      if (transition.from) {
        transition.abort()
      } else {
        this.transitionTo('chart', model.dataset.defaultChart)
      }
    }
  }
}
