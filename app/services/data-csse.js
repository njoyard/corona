import Service from '@ember/service';
import fetchText from 'corona/utils/fetch-text';

function parseCSV(csv) {
  return csv.split('\n')
            .filter(Boolean)
            .map(l => l.replace(/"([^"]+)"/g, (m, p1) => p1.replace(/,/g, "COMMA"))
                       .split(',')
                       .map(c => c.replace(/COMMA/g, ','))
            )
}

function parseDate(date) {
  let [m, d, y] = date.split('/').map(x => Number(x) < 10 ? `0${x}` : x)
  return Number(new Date(`20${y}-${m}-${d}`))
}

function parseLines(lines, dates, data, key) {
  for (let [province, country, ...counts] of lines) {
    if (!province) province = 'Mainland'
    if (!(country in data)) data[country] = {}
    if (!(province in data[country])) data[country][province] = { _total: [] }

    counts.forEach((count, index) => {
      let date = dates[index]

      let existing = data[country][province]._total.find(p => p.date === date)

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
    if (!('_total' in data[region])) {
      totalize(data[region])
    }

    for (let point of data[region]._total) {
      let existing = total.find(p => p.date === point.date)

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
}

function derive(data) {
  for (let region in data) {
    if (region !== '_total') {
      derive(data[region])
    }
  }

  data._total.sortBy('date')

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

  async data() {
    let [
      confirmedGlobalLines,
      deathsGlobalLines,
      confirmedUSLines,
      deathsUSLines
    ] = (await Promise.all([
      fetchText(this.getURL('confirmed', 'global')),
      fetchText(this.getURL('deaths', 'global')),
      fetchText(this.getURL('confirmed', 'US')),
      fetchText(this.getURL('deaths', 'US'))
    ])).map(parseCSV)

    let confirmedGlobalDates = confirmedGlobalLines.shift().slice(4).map(parseDate)
    let deathsGlobalDates = deathsGlobalLines.shift().slice(4).map(parseDate)
    let confirmedUSDates = confirmedUSLines.shift().slice(11).map(parseDate)
    let deathsUSDates = deathsUSLines.shift().slice(12).map(parseDate)

    let globalData = {}

    parseLines(
      confirmedGlobalLines
        .map(([province, country, , , ...counts]) => [province, country, ...counts])
        .filter(([, country]) => country !== 'US'),
      confirmedGlobalDates,
      globalData,
      'confirmed'
    )

    parseLines(
      deathsGlobalLines
        .map(([province, country, , , ...counts]) => [province, country, ...counts])
        .filter(([, country]) => country !== 'US'),
      deathsGlobalDates,
      globalData,
      'deceased'
    )

    let usaData = {}

    parseLines(
      confirmedUSLines
        .map(([, , , , , county, state, , , , , ...counts]) => [county, state, ...counts]),
      confirmedUSDates,
      usaData,
      'confirmed'
    )

    parseLines(
      deathsUSLines
        .map(([, , , , , county, state, , , , , , ...counts]) => [county, state, ...counts]),
      deathsUSDates,
      usaData,
      'deceased'
    )

    globalData.USA = usaData

    totalize(globalData)

    // Drop city data
    for (let country in globalData) {
      if (country === '_total') continue

      for (let province in globalData[country]) {
        if (province === '_total') continue

        for (let city in globalData[country][province]) {
          if (city !== '_total') delete globalData[country][province][city]
        }
      }
    }

    derive(globalData)

    return globalData
  }
}
