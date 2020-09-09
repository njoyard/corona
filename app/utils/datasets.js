import env from 'corona/config/environment'

import USCSSEDataSource from 'corona/datasources/csse/us'
import GlobalCSSEDataSource from 'corona/datasources/csse/global'
import FranceHospitalsDataSource from 'corona/datasources/data.gouv.fr/fr-hospitals'
import FranceTestsDataSource from 'corona/datasources/data.gouv.fr/fr-tests'
import TestDataSource from 'corona/datasources/test'
import Dataset from 'corona/models/dataset'

const { environment } = env

const us = new USCSSEDataSource()
const world = new GlobalCSSEDataSource()
const france = new FranceHospitalsDataSource()
const frTests = new FranceTestsDataSource()
const test = new TestDataSource()

const datasets = {
  flat: new Dataset({
    title: 'Global simplified data',
    description:
      'Totals for each country, excluding countries with less than 100 confirmed cases to date.',
    sources: [world],
    maxDepth: 1,
    postFilter: (mostRecentPoint) => mostRecentPoint.confirmed >= 100
  }),

  australia: new Dataset({
    title: 'Australia',
    description: 'Australia only with counts for each province',
    sources: [world],
    dataFilter: ([country]) => country === 'Australia'
  }),

  canada: new Dataset({
    title: 'Canada',
    description: 'Canada only with counts for each province',
    sources: [world],
    dataFilter: ([country]) => country === 'Canada'
  }),

  china: new Dataset({
    title: 'China',
    description: 'China only with counts for each province',
    sources: [world],
    dataFilter: ([country]) => country === 'China'
  }),

  france: new Dataset({
    title: 'France',
    description: 'Hospital and test data in France from Santé Publique France',
    sources: [france, frTests]
  }),

  us: new Dataset({
    title: 'United States',
    description: 'United States data with counts for each state.',
    sources: [us],
    maxDepth: 2
  })
}

if (environment === 'development') {
  datasets.test = new Dataset({
    title: 'test',
    sources: [test]
  })
}

const defaultDataset = 'flat'

export { datasets, defaultDataset }
