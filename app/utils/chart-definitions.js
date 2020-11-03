import { change, ratio, reverse, weekly } from 'corona/utils/fields'
import { colors, alpha } from 'corona/utils/colors'
import { abs, percent, integer } from 'corona/utils/formats'

const { blue, teal, orange, red, grey } = colors

// Fields cache their computations, try to reuse them as much as possible
const positivity = ratio('positives', 'tests')
const weeklyPositivity = weekly(positivity)
const confirmedChange = change('confirmed')
const weeklyConfirmedChange = weekly(confirmedChange)
const deceasedChange = change('deceased')
const weeklyDeceasedChange = weekly(deceasedChange)
const weeklyHospitalChange = weekly(change('hospital'))

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
        field: weeklyPositivity,
        options: { color: red, scale: 'percent', format: percent }
      }
    ]
  }
]

const compareFields = {
  'confirmed-cumulative': { field: 'confirmed', format: integer },
  'confirmed-weekly': {
    field: weeklyConfirmedChange,
    options: { format: integer }
  },
  'deceased-cumulative': { field: 'deceased', format: integer },
  'deceased-weekly': {
    field: weeklyDeceasedChange,
    options: { format: integer }
  },
  'hospital-weekly': {
    field: weeklyHospitalChange,
    options: { format: integer }
  },
  'tests-weekly': { field: weekly('tests'), options: { format: integer } },
  'positivity-weekly': {
    field: weeklyPositivity,
    options: { scale: 'percent', format: percent }
  }
}

export { chartDefinitions, compareFields }
