import { DateTime } from 'luxon'

import { bignum, percent } from 'corona/utils/formats'

const baseOptions = {
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
  }
}

const timeScale = {
  gridLines: {
    display: false
  },
  type: 'time',
  time: {
    unit: 'day'
  }
}

function yScales(series, intl) {
  return series
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
            callback: scale === 'percent' ? percent(intl) : bignum(intl),
            maxTicksLimit: scale === 'log' ? 6 : 11
          },
          type: scale === 'log' ? 'logarithmic' : 'linear'
        }
      }

      return scales
    }, {})
}

function timeTitleCallback([context]) {
  return DateTime.fromMillis(context.dataPoint.x).toLocaleString(
    DateTime.DATE_FULL
  )
}

function labelCallback(series, intl) {
  return (context) => {
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

export { baseOptions, labelCallback, timeScale, timeTitleCallback, yScales }
