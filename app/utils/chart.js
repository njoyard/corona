import moment from 'moment'

import { bignum } from 'corona/utils/format'
import { fields } from 'corona/utils/fields'

function generateChartOptions(
  {
    xSelection,
    xLog,
    xStartOffsetOrdinal,
    ySelection,
    yChange,
    yMovingAverage,
    yLog,
    yRatio,
    showLegend,
    stacked
  },
  onLegendClicked
) {
  let xLabel, yLabel

  if (xSelection === 'date') {
    xLabel = 'Date'
  } else if (xSelection === 'start') {
    xLabel = `Days since ${xStartOffsetOrdinal} confirmed case`
  } else {
    xLabel = 'Confirmed cases'
  }

  if (ySelection.indexOf('-') !== -1) {
    yLabel = yChange ? 'Daily increase' : 'Count'
  } else {
    yLabel = `${yChange ? 'Daily increase in' : 'Total'} ${
      fields[ySelection].yLabel || fields[ySelection].label.toLowerCase()
    }`
  }

  let yLabelDetails = []

  if (yChange && yMovingAverage) {
    yLabelDetails.push('7-day moving average')
  }

  if (yRatio) {
    yLabelDetails.push('per million people')
  }

  if (yLabelDetails.length) {
    yLabel = `${yLabel} (${yLabelDetails.join(', ')})`
  }

  let xTicksConfig = {}

  if (xSelection === 'confirmed') xTicksConfig.callback = formatYTick
  if (xSelection === 'date') xTicksConfig.callback = formatXDate

  let xAxisType = 'time'

  if (xSelection === 'start') xAxisType = 'category'
  if (xSelection === 'confirmed') xAxisType = xLog ? 'logarithmic' : 'linear'

  let yAxisType = yLog ? 'logarithmic' : 'linear'

  return {
    fontFamily: 'Roboto, "Helvetica Neue", sans-serif;',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,
      active: { duration: 0 },
      resize: { duration: 0 }
    },
    hover: {
      mode: 'dataset',
      intersect: false
    },
    legend: {
      display: showLegend,
      position: 'bottom',
      onClick: (e, item) => {
        onLegendClicked(item.datasetIndex)
      },
      labels: {
        // Compensate for lack of border in stacked mode
        boxHeight: stacked ? 14 : 12,
        boxWidth: stacked ? 14 : 12
      }
    },
    tooltips: {
      mode: 'nearest',
      position: 'nearest',
      intersect: false,
      callbacks: {
        title: function ([item], { datasets }) {
          let point = datasets[item.datasetIndex].data[item.index]

          if (xSelection === 'date') {
            return moment(point.t).format('ll')
          } else if (xSelection === 'start') {
            return `Day ${item.index} since ${xStartOffsetOrdinal} case`
          } else {
            return `${item.index} confirmed cases`
          }
        }
      }
    },
    elements: {
      point: {
        radius: 2
      }
    },
    scales: {
      x: {
        type: xAxisType,
        time: {
          unit: 'day'
        },
        scaleLabel: {
          display: true,
          labelString: xLabel,
          fontSize: 14
        },
        ticks: xTicksConfig,
        stacked
      },
      y: {
        position: 'right',
        type: yAxisType,
        scaleLabel: {
          display: true,
          labelString: yLabel,
          fontSize: 14
        },
        ticks: {
          callback: formatYTick
        },
        stacked
      }
    },
    plugins: {}
  }
}

function generateDataset(
  { points, xField, yField, yRatio, yLog },
  options = {}
) {
  let data = points.map((point) => {
    let datapoint = {
      y: Math.round(point[yField] * yRatio * 10) / 10
    }

    if (yLog && datapoint.y < 1) {
      // Clamp negative logs to 0
      datapoint.y = 0
    }

    if (xField === 'start') {
      return datapoint.y
    } else if (xField === 'date') {
      datapoint.t = new Date(point.date)
    } else {
      datapoint.x = point[xField]
    }

    return datapoint
  })

  if (xField === 'confirmed') {
    // Remove duplicate points
    data = data.reduce((points, point) => {
      let lastPoint = points[points.length - 1]

      if (!lastPoint || lastPoint.x !== point.x || lastPoint.y !== point.y) {
        points.push(point)
      }

      return points
    }, [])
  }

  return Object.assign({ data }, options)
}

function generateChartData({
  xSelection,
  xStartOffset,
  xStartField,
  ySelection,
  yChange,
  yMovingAverage,
  yRatio,
  yLog,
  drawableRegions,
  stacked
}) {
  let xField = xSelection
  let yField = ySelection

  let drawOptions = {}
  let alpha = '100%'

  if (stacked) {
    alpha = '75%'
    drawOptions.type = 'bar'
    drawOptions.borderWidth = 0
  } else {
    drawOptions.fill = false
    drawOptions.lineTension = 0
    drawOptions.borderWidth = 2
    drawOptions.hoverBorderWidth = 3
    drawOptions.pointRadius = 1
    drawOptions.pointHoverRadius = 1
  }

  let offsets = []
  let zeroes = []
  let zeroPoint = {}
  let pointCount = null

  if (xSelection === 'start') {
    pointCount = Math.max(...drawableRegions.map((r) => r.points.length))

    let startOffset = xOffsetOptions[xStartOffset]

    offsets = drawableRegions.map(({ points }) => {
      return points.findIndex((p) => p[xStartField] >= startOffset)
    })

    let minOffset = Math.min(...offsets)
    pointCount -= minOffset

    if (stacked) {
      zeroes = offsets.map((o) => o - minOffset)
      zeroPoint[yField] = 0
    }
  }

  let datasetSources

  if (ySelection.indexOf('-') !== -1) {
    let [region] = drawableRegions
    datasetSources = ySelection.split('-').map((yField) => {
      let { label, hue, saturation, lightness } = fields[yField]

      if (yChange) {
        if (yMovingAverage) {
          yField = `${yField}Weekly`
        }

        yField = `${yField}Change`
      }

      return {
        index: 0,
        region,
        yField,
        label: `${label} (${region.label})`,
        hue,
        saturation,
        lightness
      }
    })
  } else {
    if (yChange) {
      if (yMovingAverage) {
        yField = `${yField}Weekly`
      }

      yField = `${yField}Change`
    }

    datasetSources = drawableRegions.map((region, index) => {
      return {
        index,
        region,
        yField,
        label: region.longLabel,
        hue: region.hue,
        saturation: region.saturation,
        lightness: region.lightness
      }
    })
  }

  let data = {
    datasets: datasetSources.map(
      ({ region, yField, label, hue, saturation, lightness, index }) => {
        let { population, points } = region

        if (xSelection === 'start') {
          points = points.slice(offsets[index])

          if (stacked && zeroes[index]) {
            // Add zero-value points for correct stacking
            points = points.concat(
              [...Array(zeroes[index])].map(() => zeroPoint)
            )
          }
        }

        return generateDataset(
          {
            points,
            xField,
            yField,
            yRatio: yRatio ? 1000000 / population : 1,
            yLog
          },
          Object.assign(
            {
              label,
              borderColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
              backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
              hoverBorderColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`,
              hoverBackgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 100%)`
            },
            drawOptions
          )
        )
      }
    )
  }

  if (xSelection === 'start') {
    data.labels = [...Array(pointCount)].map((_, index) => index)
  }

  return data
}

function formatYTick(number) {
  return bignum(number)
}

function formatXDate(date) {
  if (typeof date === 'string' && date.match(/^\w+ \d+$/)) {
    return date
  }

  return moment(date).format('MMM D')
}

const plugins = {}

const xOffsetOptions = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]

export { generateChartData, generateChartOptions, plugins, xOffsetOptions }
