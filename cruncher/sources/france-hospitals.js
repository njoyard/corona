import DataGouvFrSource from './france-base'
import { parseCSV, parseDate } from '../utils'

export default class FranceHospitalsDataSource extends DataGouvFrSource {
  async fetchData() {
    let lines = parseCSV(
      await this.fetchResource(
        'donnees-hospitalieres-relatives-a-lepidemie-de-covid-19',
        '63352e38-d353-4b54-bfd1-f1b3ee1cabd7'
      ),
      { separator: ';' }
    )

    lines.shift()

    let data = {}

    for (let [dep, gender, date, hosp, rea, rad, dc] of lines) {
      if (!dep) continue
      if (gender !== '0') continue // Ignore lines with specific male/female data

      let depInfo = await this.depInfo(dep)

      if (depInfo) {
        let { departement, region, population } = depInfo

        if (!(dep in data)) {
          data[dep] = {
            zone: ['France', region, departement].join('|'),
            meta: { population },
            points: []
          }
        }

        date = Number(parseDate(date))
        let point = data[dep].points.find((p) => p.date === date)

        if (!point) {
          point = { date }
          data[dep].points.push(point)
        }

        Object.assign(point, {
          hospital: Number(hosp),
          intensive: Number(rea),
          recovered: Number(rad),
          deceased: Number(dc)
        })
      }
    }
    return Object.values(data)
  }
}
