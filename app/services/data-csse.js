import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import moment from 'moment';

function parseCSV(csv) {
  return csv.replace(/"Korea, South"/g, 'South Korea').split('\n').map(l => l.split(',').map(c => c.replace(/(^"|"$)/g, '')))
}

function parseDate(date) {
  let [m, d, y] = date.split('/').map(x => Number(x) < 10 ? `0${x}` : x)
  return Number(new Date(`20${y}-${m}-${d}`))
}

function sortBy(array, key) {
  return array.sort(function(a, b) {
    if (a[key] < b[key]) return -1
    if (b[key] < a[key]) return 1
    return 0
  })
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
    let confirmedCSVLines = parseCSV(await (await fetch(this.globalConfirmedURL)).text())
    let deathsCSVLines = parseCSV(await (await fetch(this.globalDeathsURL)).text())
    
    let confirmedDates = confirmedCSVLines.shift().slice(4).map(parseDate)
    let deathsDates = deathsCSVLines.shift().slice(4).map(parseDate)

    let data = {}

    for (let [province, country, lat, lon, ...counts] of confirmedCSVLines) {
      if (!province) province = 'Mainland'

      if (!(country in data)) data[country] = {}
      if (!(province in data[country])) data[country][province] = {}

      data[country][province]._total = counts.map((count, index) => { return {
        date: confirmedDates[index],
        confirmed: Number(count),
        deceased: 0
      }})
    }

    for (let [province, country, lat, lon, ...counts] of deathsCSVLines) {
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
