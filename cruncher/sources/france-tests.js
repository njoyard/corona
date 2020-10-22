import DataGouvFrSource from './france-base'
import { parseCSV, parseDate } from '../utils'

export default class FranceTestsDataSource extends DataGouvFrSource {
  async fetchData() {
    let lines = parseCSV(
      await this.fetchResource(
        'donnees-relatives-aux-resultats-des-tests-virologiques-covid-19',
        '406c6a23-e283-4300-9484-54e78c8ae675'
      ),
      { separator: ';' }
    )

    lines.shift()

    let data = {}

    for (let [dep, date, positives, tests, ageClass] of lines) {
      if (!dep) continue
      if (ageClass !== '0') continue // Ignore lines with specific age class data

      let depInfo = await this.depInfo(dep)

      if (depInfo) {
        let { departement, region, population } = depInfo

        // Ignore Outre-Mer as we have no hospitals data
        if (region === 'Outre-Mer') continue

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
          tests: Number(tests),
          positives: Number(positives)
        })
      }
    }

    return Object.values(data)
  }
}
