import { DateTime } from 'luxon'

import { bignum, percent } from 'corona/utils/formats'

export default class Chart {
  id = null
  series = []

  constructor(id, series) {
    this.id = id
    this.series = series
  }

  getOptions(intl) {
    let { series } = this
    let yScales = series
      .map((s) => s.scale)
      .reduce((scales, scale) => {
        if (!(scale in scales)) {
          let isEven = Object.keys(scales).length % 2 === 0
          scales[scale] = {
            axis: 'y',
            gridLines: {
              borderDash: isEven ? [] : [5, 5]
            },
            position: isEven ? 'left' : 'right',
            ticks: {
              callback: scale === 'percent' ? percent(intl) : bignum(intl)
            },
            type: 'linear'
          }
        }

        return scales
      }, {})

    return {
      fontFamily: 'Roboto, "Helvetica Neue", sans-serif;',
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      elements: {
        line: {
          tension: 0.1
        },
        point: {
          radius: 1,
          hitRadius: 10
        }
      },
      legend: {
        display: false
      },
      scales: {
        x: {
          gridLines: {
            display: false
          },
          type: 'time',
          time: {
            unit: 'day'
          }
        },
        ...yScales
      },
      tooltips: {
        callbacks: {
          title: ([context]) => {
            return DateTime.fromMillis(context.dataPoint.x).toLocaleString(
              DateTime.DATE_FULL
            )
          },

          label: (context) => {
            let label = context.dataset.label || ''
            let serie = series.find((s) => s.id === context.dataset.id)

            if (label) {
              label += ': '
            }

            if (!isNaN(context.dataPoint.y)) {
              label += serie.format(intl, context.dataPoint.y)
            }

            return label
          }
        }
      }
    }
  }

  validForZone(zone) {
    let { series } = this

    return series.some((s) => s.validForZone(zone))
  }

  dataForZone(zone, intl) {
    let { series } = this

    return {
      datasets: series.map((s, index) =>
        Object.assign(
          { order: series.length - index },
          s.dataForZone(zone, intl)
        )
      )
    }
  }
}
