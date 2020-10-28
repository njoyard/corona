import { ratio, reverse, weekly } from './fields'
import { blue, orange, red, gray, alpha } from './colors'
import { abs, percent } from './formats'

const positivity = ratio('positives', 'tests')

const chartDefinitions = [
  {
    id: 'cases',
    series: [
      {
        id: 'confirmed',
        field: 'confirmed',
        options: { color: alpha(orange, 0.75) }
      },
      {
        id: 'deceased',
        field: 'deceased',
        options: { color: alpha(red, 0.75) }
      },
      {
        id: 'mortality-weekly',
        field: weekly(ratio('deceased', 'confirmed')),
        options: { color: alpha(gray, 0.75), scale: 'percent', format: percent }
      }
    ]
  },
  {
    id: 'hospital',
    series: [
      {
        id: 'dismissed',
        field: 'dismissed',
        options: { type: 'bar', color: alpha(blue, 0.75), stack: 'stack' }
      },
      {
        id: 'hospital',
        field: 'hospital',
        options: { type: 'bar', color: alpha(orange, 0.75), stack: 'stack' }
      },
      {
        id: 'intensive',
        field: 'intensive',
        options: { type: 'bar', color: alpha(red, 0.75), stack: 'stack' }
      },
      {
        id: 'deceased',
        field: reverse('deceased'),
        options: {
          type: 'bar',
          color: alpha(gray, 0.75),
          stack: 'stack',
          format: abs
        }
      }
    ]
  },

  {
    id: 'tests',
    series: [
      {
        id: 'tests',
        field: 'tests',
        options: { type: 'bar', color: alpha(blue, 0.75) }
      },
      {
        id: 'positives',
        field: 'positives',
        options: { type: 'bar', color: alpha(orange, 0.75) }
      },
      {
        id: 'positivity',
        field: positivity,
        options: {
          type: 'points',
          color: alpha(red, 0.5),
          scale: 'percent',
          format: percent
        }
      },
      {
        id: 'positivity-weekly',
        field: weekly(positivity),
        options: { color: red, scale: 'percent', format: percent }
      }
    ]
  }
]

export default chartDefinitions
