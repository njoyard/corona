import { change, ratio, reverse, weekly } from 'corona/utils/fields'
import { colors, alpha } from 'corona/utils/colors'
import { abs, percent } from 'corona/utils/formats'

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
        id: 'confirmed-change',
        field: confirmedChange,
        options: { type: 'bar', color: teal }
      },
      {
        id: 'confirmed-weekly',
        field: weeklyConfirmedChange,
        options: { color: blue }
      },
      {
        id: 'deceased',
        field: 'deceased',
        options: { color: orange }
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
  'confirmed-cumulative': { field: 'confirmed' },
  'confirmed-weekly': { field: weeklyConfirmedChange },
  'deceased-cumulative': { field: 'deceased' },
  'deceased-weekly': { field: weeklyDeceasedChange },
  'hospital-weekly': { field: weeklyHospitalChange },
  'tests-weekly': { field: weekly('tests') },
  'positivity-weekly': {
    field: weeklyPositivity,
    options: { scale: 'percent', format: percent }
  }
}

export { chartDefinitions, compareFields }
