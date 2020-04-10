import { bignum } from 'corona/utils/format'

function generateDataset(
  source,
  xField,
  yField,
  yRatio,
  yLog,
  startOffset,
  startField,
  options = {}
) {
  if (xField === 'start') {
    let firstIndex = source.findIndex((p) => p[startField] >= startOffset)
    source = source.slice(firstIndex)
  }

  let data = source.map((point, index) => {
    let datapoint = {
      y: Math.round(point[yField] * yRatio * 10) / 10
    }

    if (yLog && datapoint.y < 1) {
      // Clamp negative logs to 0
      datapoint.y = 0
    }

    if (xField === 'date') {
      datapoint.t = new Date(point.date)
    } else if (xField === 'start') {
      datapoint.x = index
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

function formatYTick(number) {
  return bignum(number)
}

const plugins = {
  hideTooltipOnLegend: {
    beforeEvent(chart, e) {
      if (e.type === 'mousemove') {
        chart.tooltip._options.enabled = e.y < chart.chartArea.bottom
      }
    }
  }
}

export { generateDataset, formatYTick, plugins }
