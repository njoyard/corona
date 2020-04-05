function generateDataset(
  source,
  xField,
  xLog,
  yField,
  yLog,
  yRatio,
  startOffset,
  options = {}
) {
  // Remove zeroes for log scales
  if (xLog) {
    source = source.filter((p) => p[xField])
  }

  if (yLog) {
    source = source.filter((p) => p[yField])
  }

  if (xField === 'start') {
    let firstIndex = source.findIndex((p) => p[yField] >= startOffset)
    source = source.slice(firstIndex)
  }

  let data = source.map((point, index) => {
    let datapoint = {
      y: Math.round(point[yField] * yRatio * 10) / 10
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
  if (number >= 1000000) return `${number / 1000000}M`
  if (number >= 1000) return `${number / 1000}k`
  return `${number}`
}

export { generateDataset, formatYTick }
