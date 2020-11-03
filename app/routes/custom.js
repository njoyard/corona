import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

import CustomChart from 'corona/models/custom-chart'
import CustomSeries from 'corona/models/custom-series'

export default class CustomRoute extends Route {
  @service intl
  @service customCharts

  model({ chart_id }) {
    let dataset = this.modelFor('application')
    let { allFields } = dataset
    let { intl, customCharts } = this
    let chart

    if (chart_id === 'new') {
      chart = new CustomChart()
      chart.series.pushObject(
        new CustomSeries(intl.t('custom.new-series'), intl, allFields)
      )

      chart.title = this.intl.t('custom.new')
    } else {
      let customChart = customCharts.get(chart_id)
      chart = CustomChart.fromRepr(customChart.custom, intl, allFields)
    }

    return { chart, dataset }
  }
}
