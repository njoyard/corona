import { bignum } from 'corona/utils/format'
import moment from 'moment'

function generateDataset(
  source,
  xField,
  yField,
  yRatio,
  yLog,
  stacked,
  options = {}
) {
  let data = source.map((point) => {
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

function formatYTick(number) {
  return bignum(number)
}

function formatXDate(date) {
  let mom = moment(date)
  return mom.isValid() ? mom.format('MMM D') : date
}

const plugins = {}

export { generateDataset, formatYTick, formatXDate, plugins }
