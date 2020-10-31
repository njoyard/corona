import { change, ratio, reverse, weekly } from 'corona/utils/fields'
import { colors, alpha } from 'corona/utils/colors'
import { abs, percent } from 'corona/utils/formats'

const { blue, teal, orange, red, grey } = colors

const positivity = ratio('positives', 'tests')
const confirmedChange = change('confirmed')
const deceasedChange = change('deceased')
const hospitalChange = change('hospital')

const chartDefinitions = [
  {
    id: 'cases',
    series: [
      {
        id: 'confirmed',
        field: 'confirmed',
        options: { color: orange }
      },
      {
        id: 'deceased',
        field: 'deceased',
        options: { color: red }
      },
      {
        id: 'mortality-weekly',
        field: weekly(ratio('deceased', 'confirmed')),
        options: { color: grey, scale: 'percent', format: percent }
      }
    ]
  },
  {
    id: 'change',
    series: [
      {
        id: 'confirmed-change',
        field: confirmedChange,
        options: { color: alpha(blue, 0.75), type: 'points', scale: 'log' }
      },
      {
        id: 'confirmed-weekly',
        field: weekly(confirmedChange),
        options: { color: blue, scale: 'log' }
      },
      {
        id: 'deceased-change',
        field: deceasedChange,
        options: { color: alpha(grey, 0.75), type: 'points', scale: 'log' }
      },
      {
        id: 'deceased-weekly',
        field: weekly(deceasedChange),
        options: { color: grey, scale: 'log' }
      }
    ]
  },
  {
    id: 'hospital',
    series: [
      {
        id: 'dismissed',
        field: 'dismissed',
        options: { type: 'bar', color: teal, stack: 'stack' }
      },
      {
        id: 'hospital',
        field: 'hospital',
        options: { type: 'bar', color: orange, stack: 'stack' }
      },
      {
        id: 'intensive',
        field: 'intensive',
        options: { type: 'bar', color: red, stack: 'stack' }
      },
      {
        id: 'deceased',
        field: reverse('deceased'),
        options: {
          type: 'bar',
          color: grey,
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
        options: { type: 'bar', color: blue }
      },
      {
        id: 'positives',
        field: 'positives',
        options: { type: 'bar', color: orange }
      },
      {
        id: 'positivity',
        field: positivity,
        options: {
          type: 'points',
          color: alpha(red, 0.75),
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

const compareFields = {
  confirmed: { field: 'confirmed' },
  deceased: { field: 'deceased' },
  tests: { field: 'tests' },
  positivity: { field: positivity, options: { scale: 'percent' } }
}

export { chartDefinitions, compareFields }
