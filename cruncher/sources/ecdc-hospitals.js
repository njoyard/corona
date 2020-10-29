import { fetchText } from '../utils'

const URL =
  'https://opendata.ecdc.europa.eu/covid19/hospitalicuadmissionrates/json/'

const INDICATOR_MAP = {
  'Daily hospital occupancy': 'hospital',
  'Daily ICU occupancy': 'intensive'
}

export default class FranceHospitalsDataSource {
  async fetchData() {
    let entries = JSON.parse(await fetchText(URL))
    let data = {}

    for (let { country, indicator, date, value } of entries) {
      if (!date) continue
      if (!(indicator in INDICATOR_MAP)) continue

      if (!(country in data)) {
        data[country] = { zone: country, meta: {}, points: [] }
      }

      date = Number(new Date(date))
      let point = data[country].points.find((p) => p.date === date)

      if (!point) {
        point = { date }
        data[country].points.push(point)
      }

      point[INDICATOR_MAP[indicator]] = value
    }

    return Object.values(data)
  }
}
