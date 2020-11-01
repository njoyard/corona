import { inject as service } from '@ember/service'
import Component from '@glimmer/component'

import { compareStyle } from 'corona/utils/chart-common'

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
        .sort(({ label: a }, { label: b }) => {
          if (a < b) return -1
          if (a > b) return 1
          return 0
        })
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
