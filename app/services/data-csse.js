import Service from '@ember/service';
import fetchText from 'corona/utils/fetch-text';
import { hash } from 'rsvp';

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
  globalDeathsURL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
  globalConfirmedURL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';

  async data() {
    let { confirmed, deaths } = await hash({
      confirmed: fetchText(this.globalConfirmedURL),
      deaths: fetchText(this.globalDeathsURL)
    })

    let confirmedCSVLines = parseCSV(confirmed)
    let deathsCSVLines = parseCSV(deaths)
    
    let confirmedDates = confirmedCSVLines.shift().slice(4).map(parseDate)
    let deathsDates = deathsCSVLines.shift().slice(4).map(parseDate)

    let data = {}

    for (let [province, country, , , ...counts] of confirmedCSVLines) {
      if (!province) province = 'Mainland'

      if (!(country in data)) data[country] = {}
      if (!(province in data[country])) data[country][province] = {}

      data[country][province]._total = counts.map((count, index) => { return {
        date: confirmedDates[index],
        confirmed: Number(count),
        deceased: 0
      }})
    }

    for (let [province, country, , , ...counts] of deathsCSVLines) {
      if (!province) province = 'Mainland'

      if (!(country in data)) data[country] = {}
      if (!(province in data[country])) data[country][province] = {}

      counts.forEach((count, index) => {
        let date = deathsDates[index]
        let existing = data[country][province]._total.find(p => p.date === date)

        if (existing) {
          existing.deceased = Number(count)
        } else {
          data[country][province]._total.push({
            date,
            confirmed: 0,
            deceased: Number(count)
          })
        }
      })
    }

    totalize(data)
    derive(data)

    return data
  }
}
