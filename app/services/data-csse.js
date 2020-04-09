import Service, { inject as service } from '@ember/service'
import fetchText from 'corona/utils/fetch-text'
import delay from 'corona/utils/delay'

const countryReplacements = {
  US: 'United States',
  'Taiwan*': 'Taiwan',
  'Korea, South': 'South Korea'
}

const populationReplacements = {
  'Congo (Brazzaville)': 'Congo, Rep.',
  'Congo (Kinshasa)': 'Congo, Dem. Rep.',
  Czechia: 'Czech Republic',
  'Korea, South': 'Korea, Rep.',
  Kyrgyzstan: 'Kyrgyz Republic',
  'Saint Lucia': 'St. Lucia',
  'Saint Vincent and the Grenadines': 'St. Vincent and the Grenadines',
  Slovakia: 'Slovak Republic',
  'Saint Kitts and Nevis': 'St. Kitts and Nevis',
  US: 'United States'
}

function parseCSV(csv) {
  return csv
    .split(/\r\n|\r|\n/g)
    .filter(Boolean)
    .map((l) =>
      l
        .replace(/"([^"]+)"/g, (m, p1) => p1.replace(/,/g, 'COMMA'))
        .split(',')
        .map((c) => c.replace(/COMMA/g, ','))
    )
}

function parseDate(date) {
  let [m, d, y] = date.split('/').map((x) => (Number(x) < 10 ? `0${x}` : x))
  return Number(new Date(`20${y}-${m}-${d}`))
}

function parseLines(lines, dates, data, key) {
  for (let [province, country, pmeta, cmeta, ...counts] of lines) {
    if (!province) province = 'Mainland'

    if (!(country in data)) {
      data[country] = {}
    }

    if (cmeta && !data[country]._meta) data[country]._meta = cmeta

    if (!(province in data[country])) data[country][province] = { _total: [] }

    if (pmeta && !data[country][province]._meta)
      data[country][province]._meta = pmeta

    counts.forEach((count, index) => {
      let date = dates[index]

      let existing = data[country][province]._total.find((p) => p.date === date)

      if (!existing) {
        existing = { date, confirmed: 0, deceased: 0, recovered: 0 }
        data[country][province]._total.push(existing)
      }

      existing[key] = Number(count)
    })
  }
}

function totalize(data) {
  let total = []

  for (let region in data) {
    if (region.startsWith('_')) continue

    if (!('_total' in data[region])) {
      totalize(data[region])
    }

    for (let point of data[region]._total) {
      let existing = total.find((p) => p.date === point.date)

      if (existing) {
        if (point.confirmed) existing.confirmed += point.confirmed
        if (point.deceased) existing.deceased += point.deceased
        if (point.recovered) existing.recovered += point.recovered
      } else {
        total.push({
          date: point.date,
          confirmed: point.confirmed,
          deceased: point.deceased,
          recovered: point.recovered || 0
        })
      }
    }
  }

  data._total = total
  data._total.sortBy('date')
}

function totalizePopulation(data) {
  data._meta = data._meta || {}

  if (!data._meta.population) {
    data._meta.population = 0

    for (let region in data) {
      if (region.startsWith('_')) continue

      totalizePopulation(data[region])

      if (data[region]._meta.population)
        data._meta.population += data[region]._meta.population
    }
  }
}

export default class DataCeseService extends Service {
  @service dataWorldbank

  getURL(type, scope) {
    return `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${type}_${scope}.csv`
  }

  async data(updateState, { us, world, root, deep, limit }) {
    updateState('downloading CSSE data')

    let [
      confirmedGlobalLines,
      deathsGlobalLines,
      recoveredGlobalLines,
      confirmedUSLines,
      deathsUSLines
    ] = (
      await Promise.all([
        world
          ? fetchText(this.getURL('confirmed', 'global'))
          : Promise.resolve(''),
        world
          ? fetchText(this.getURL('deaths', 'global'))
          : Promise.resolve(''),
        world
          ? fetchText(this.getURL('recovered', 'global'))
          : Promise.resolve(''),
        us ? fetchText(this.getURL('confirmed', 'US')) : Promise.resolve(''),
        us ? fetchText(this.getURL('deaths', 'US')) : Promise.resolve('')
      ])
    ).map(parseCSV)

    let confirmedGlobalDates =
      world && confirmedGlobalLines.shift().slice(4).map(parseDate)
    let deathsGlobalDates =
      world && deathsGlobalLines.shift().slice(4).map(parseDate)
    let recoveredGlobalDates =
      world && recoveredGlobalLines.shift().slice(4).map(parseDate)
    let confirmedUSDates =
      us && confirmedUSLines.shift().slice(11).map(parseDate)
    let deathsUSDates = us && deathsUSLines.shift().slice(12).map(parseDate)

    let globalData = {}
    let usaData = {}

    let worldPopulation = world
      ? await this.dataWorldbank.getWorldPopulation(updateState)
      : {}

    function getPopulation(country) {
      let key = (populationReplacements[country] || country).toLowerCase()

      if (!(key in worldPopulation)) {
        let candidates = Object.keys(worldPopulation).filter((k) =>
          k.startsWith(key)
        )

        if (candidates.length === 1) {
          key = candidates[0]
        } else {
          console.warn(`No population data for ${country}`)
          return null
        }
      }

      return worldPopulation[key]
    }

    updateState('parsing CSSE data')

    await delay(() => {
      if (world) {
        parseLines(
          confirmedGlobalLines.map(([province, country, , , ...counts]) => [
            province,
            countryReplacements[country] || country,
            null,
            { population: getPopulation(country) },
            ...counts
          ]),
          confirmedGlobalDates,
          globalData,
          'confirmed'
        )

        parseLines(
          deathsGlobalLines.map(([province, country, , , ...counts]) => [
            province,
            countryReplacements[country] || country,
            null,
            { population: getPopulation(country) },
            ...counts
          ]),
          deathsGlobalDates,
          globalData,
          'deceased'
        )

        parseLines(
          recoveredGlobalLines.map(([province, country, , , ...counts]) => [
            province,
            countryReplacements[country] || country,
            null,
            { population: getPopulation(country) },
            ...counts
          ]),
          recoveredGlobalDates,
          globalData,
          'recovered'
        )
      }

      if (us) {
        parseLines(
          confirmedUSLines.map(
            ([, , , , , county, state, , , , , ...counts]) => [
              county,
              state,
              null,
              null,
              ...counts
            ]
          ),
          confirmedUSDates,
          usaData,
          'confirmed'
        )

        parseLines(
          deathsUSLines.map(
            ([, , , , , county, state, , , , , population, ...counts]) => [
              county,
              state,
              { population: Number(population) },
              null,
              ...counts
            ]
          ),
          deathsUSDates,
          usaData,
          'deceased'
        )
      }
    })

    if (world && us) {
      globalData[countryReplacements.US] = usaData
    } else if (us) {
      globalData = usaData
    } else if (root) {
      globalData = globalData[root]
    }

    updateState('computing totals')

    await delay(() => {
      totalize(globalData)
      totalizePopulation(globalData)

      for (let country in globalData) {
        if (country.startsWith('_')) continue

        for (let province in globalData[country]) {
          if (province.startsWith('_')) continue

          if (!deep) {
            delete globalData[country][province]
          }
        }

        if (limit) {
          let points = globalData[country]._total
          if (points[points.length - 1].confirmed < limit)
            delete globalData[country]
        }
      }
    })

    return globalData
  }
}
