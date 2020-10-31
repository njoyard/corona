import { DateTime } from 'luxon'

import { colors } from 'corona/utils/colors'
import { bignum, percent } from 'corona/utils/formats'

// Only use every other color to avoid confusing charts
const styleColors = Object.values(colors).filter((c, index) => index % 2 == 1)

function compareStyle(index) {
  let type = 'line'

  if (index >= styleColors.length) {
    type = 'dotted'
  }

  if (index >= 2 * styleColors.length) {
    type = 'thin'
  }

  if (index >= 3 * styleColors.length) {
    type = 'dashed'
  }

  return { color: styleColors[index % styleColors.length], type }
}

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
  let scales = series
    .map((s) => s.scale)
    .reduce((scales, scale) => {
      if (!(scale in scales)) {
        let isEven = Object.keys(scales).length % 2 === 0
        scales[scale] = {
          axis: 'y',
          gridLines: {
            borderDash: isEven ? [] : [5, 5]
          },
          position: isEven ? 'right' : 'left',
          ticks: {
            callback: scale === 'percent' ? percent(intl) : bignum(intl),
            maxTicksLimit: scale === 'log' ? 6 : 11
          },
          type: scale === 'log' ? 'logarithmic' : 'linear'
        }
      }

      return scales
    }, {})

  return scales
}

function timeTitleCallback([context]) {
  return DateTime.fromMillis(context.dataPoint.x).toLocaleString(
    DateTime.DATE_FULL
  )
}

function labelCallback(seriesOrFormatter, intl) {
  return (context) => {
    let label = context.dataset.label || ''
    let formatter =
      typeof seriesOrFormatter === 'function'
        ? seriesOrFormatter
        : seriesOrFormatter.find((s) => s.id === context.dataset.id).format

    if (label) {
      label += ': '
    }

    if (!isNaN(context.dataPoint.y)) {
      label += formatter(intl, context.dataPoint.y)
    }

    return label
  }
}

export {
  baseOptions,
  compareStyle,
  labelCallback,
  timeScale,
  timeTitleCallback,
  yScales
}
