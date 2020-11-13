import { DateTime } from 'luxon'

import { contrastColors, alpha, scale } from 'corona/utils/colors'
import { bignum, percent } from 'corona/utils/formats'

const styleColors = Object.values(contrastColors)
const styleTypes = [
  { type: 'line', transform: (c) => c },
  { type: 'line', transform: (c) => alpha(c, 0.75) },
  { type: 'dotted', transform: (c) => c },
  { type: 'thin', transform: (c) => scale(c, 0.75) }
]

const styles = styleTypes
  .map(({ type, transform }) =>
    styleColors.map((color) => ({ type, color: transform(color) }))
  )
  .flat()

function compareStyle(index) {
  if (index >= styles.length) {
    console.warn(`not enough different styles: ${index}`)
    index = styles.length - 1
  }

  return styles[index]
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

const baseTooltipOptions = {
  backgroundColor: 'rgba(0, 0, 0, 0.65)'
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

function yScales(series, intl, scaleOptions = {}) {
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

        if (scaleOptions[scale]) {
          for (let key of ['min', 'max']) {
            if (scaleOptions[scale][key] !== null) {
              scales[scale][key] = scaleOptions[scale][key]
            }
          }
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

function labelCallback(seriesOrFormatter, { perCapita }, intl) {
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

    if (perCapita) {
      label += ` ${intl.t('options.perCapita.legend')}`
    }

    return label
  }
}

export {
  baseOptions,
  baseTooltipOptions,
  compareStyle,
  labelCallback,
  timeScale,
  timeTitleCallback,
  yScales
}
