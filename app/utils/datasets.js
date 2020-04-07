const datasets = {
  flat: {
    title: 'Global simplified data',
    description:
      'Totals for each country, excluding countries with less than 100 confirmed cases to date.',
    us: false,
    world: true,
    deep: false,
    limit: 100
  },
  us: {
    title: 'United States',
    description: 'United States data with counts for each state.',
    us: true,
    world: false,
    deep: false
  },
  china: {
    title: 'China',
    description:
      'China only with counts for each province (population ratio not available yet)',
    us: false,
    world: true,
    root: 'China'
  },
  australia: {
    title: 'Australia',
    description:
      'Australia only with counts for each province (population ratio not available yet)',
    us: false,
    world: true,
    root: 'Australia'
  },
  global: {
    title: 'Global data with provinces',
    description:
      'Totals for each country, including counts for each province for selected countries.',
    us: false,
    world: true,
    deep: true
  },
  full: {
    title: 'Global data with provinces and US states',
    description:
      'Complete dataset, including country provinces and US states. Will need a bit more time to load than other datasets.',
    us: true,
    world: true,
    deep: true
  }
}

const defaultDataset = 'flat'

export { datasets, defaultDataset }
