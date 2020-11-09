import { inject as service } from '@ember/service'
import Component from '@glimmer/component'

import { compareStyle } from 'corona/utils/chart-common'
import { compareLabels } from 'corona/utils/collection'

export default class LegendComponent extends Component {
  @service intl

  get items() {
    let {
      args: { chart, zone },
      intl
    } = this

    if (!chart) {
      return []
    }

    if (zone) {
      return chart
        .validChildren(zone)
        .map(({ label }, index) => ({
          label,
          ...compareStyle(index)
        }))
        .sort(compareLabels)
    } else {
      return chart.series.map(({ label, id, color, type }) => ({
        label:
          label ||
          (intl.exists(`fields.${id}.long`)
            ? intl.t(`fields.${id}.long`)
            : intl.t(`fields.${id}.short`)),
        color,
        type
      }))
    }
  }
}
