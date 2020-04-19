import USCSSEDataSource from 'corona/datasources/csse/us'
import GlobalCSSEDataSource from 'corona/datasources/csse/global'
import Dataset from 'corona/models/dataset'

const us = new USCSSEDataSource()
const world = new GlobalCSSEDataSource()

const datasets = {
  flat: new Dataset({
    title: 'Global simplified data',
    description:
      'Totals for each country, excluding countries with less than 100 confirmed cases to date.',
    sources: [world],
    maxDepth: 1,
    postFilter: (mostRecentPoint) => mostRecentPoint.confirmed >= 100
  }),

  us: new Dataset({
    title: 'United States',
    description: 'United States data with counts for each state.',
    sources: [us],
    maxDepth: 1
  }),

  china: new Dataset({
    title: 'China',
    description:
      'China only with counts for each province (population ratio not available yet)',
    sources: [world],
    dataFilter: ([country]) => country === 'China'
  }),

  australia: new Dataset({
    title: 'Australia',
    description:
      'Australia only with counts for each province (population ratio not available yet)',
    sources: [world],
    dataFilter: ([country]) => country === 'Australia'
  }),

  global: new Dataset({
    title: 'Global data with provinces',
    description:
      'Totals for each country, including counts for each province for selected countries.',
    sources: [world]
  }),

  full: new Dataset({
    title: 'Global data with provinces and US states',
    description:
      'Complete dataset, including country provinces and US states. Will need a bit more time to load than other datasets.',
    sources: [us, world],
    maxDepth: 2
  })
}

const defaultDataset = 'flat'

export { datasets, defaultDataset }
