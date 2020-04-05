import Service from '@ember/service'
import fetchText from 'corona/utils/fetch-text'
import delay from 'corona/utils/delay'

const countryReplacements = {
  US: 'United States',
  'Taiwan*': 'Taiwan',
  'Korea, South': 'South Korea'
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
  for (let [province, country, ...counts] of lines) {
    if (!province) province = 'Mainland'
    if (!(country in data)) data[country] = {}
    if (!(province in data[country])) data[country][province] = { _total: [] }

    counts.forEach((count, index) => {
      let date = dates[index]

      let existing = data[country][province]._total.find((p) => p.date === date)

      if (!existing) {
        existing = { date, confirmed: 0, deceased: 0 }
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
      } else {
        total.push({
          date: point.date,
          confirmed: point.confirmed,
          deceased: point.deceased
        })
      }
    }
  }

  data._total = total
  data._total.sortBy('date')
}

function derive(data) {
  for (let region in data) {
    if (!region.startsWith('_')) {
      derive(data[region])
    }
  }

  let prev = { confirmed: 0, deceased: 0 }
  for (let point of data._total) {
    point.confirmedChange = point.confirmed - prev.confirmed
    point.deceasedChange = point.deceased - prev.deceased

    prev = point
  }
}

export default class DataCeseService extends Service {
  getURL(type, scope) {
    return `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${type}_${scope}.csv`
  }

  async data(updateState, { us, world, deep, limit }) {
    updateState('downloading CSSE data')

    let [
      confirmedGlobalLines,
      deathsGlobalLines,
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
        us ? fetchText(this.getURL('confirmed', 'US')) : Promise.resolve(''),
        us ? fetchText(this.getURL('deaths', 'US')) : Promise.resolve('')
      ])
    ).map(parseCSV)

    let confirmedGlobalDates =
      world && confirmedGlobalLines.shift().slice(4).map(parseDate)
    let deathsGlobalDates =
      world && deathsGlobalLines.shift().slice(4).map(parseDate)
    let confirmedUSDates =
      us && confirmedUSLines.shift().slice(11).map(parseDate)
    let deathsUSDates = us && deathsUSLines.shift().slice(12).map(parseDate)

    let globalData = {}
    let usaData = {}

    updateState('parsing CSSE data')

    await delay(() => {
      if (world) {
        parseLines(
          confirmedGlobalLines.map(([province, country, , , ...counts]) => [
            province,
            country in countryReplacements
              ? countryReplacements[country]
              : country,
            ...counts
          ]),
          confirmedGlobalDates,
          globalData,
          'confirmed'
        )

        parseLines(
          deathsGlobalLines.map(([province, country, , , ...counts]) => [
            province,
            country in countryReplacements
              ? countryReplacements[country]
              : country,
            ...counts
          ]),
          deathsGlobalDates,
          globalData,
          'deceased'
        )
      }

      if (us) {
        parseLines(
          confirmedUSLines.map(
            ([, , , , , county, state, , , , , ...counts]) => [
              county,
              state,
              ...counts
            ]
          ),
          confirmedUSDates,
          usaData,
          'confirmed'
        )

        parseLines(
          deathsUSLines.map(
            ([, , , , , county, state, , , , , , ...counts]) => [
              county,
              state,
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
    }

    updateState('computing totals')

    await delay(() => {
      totalize(globalData)

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

    updateState('computing daily changes')

    await delay(() => derive(globalData))

    return globalData
  }
}
