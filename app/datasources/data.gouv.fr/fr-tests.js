import DataGouvFrSource from 'corona/datasources/data.gouv.fr/-base'
import parseCSV from 'corona/utils/csv'

function parseDate(dateString) {
  let matchBadFormat = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (matchBadFormat) {
    return new Date(
      `${matchBadFormat[3]}-${matchBadFormat[2]}-${matchBadFormat[1]}`
    )
  } else {
    return new Date(dateString)
  }
}

export default class FranceTestsDataSource extends DataGouvFrSource {
  async fetchData(dataCallback) {
    let lines = parseCSV(
      await this.fetchResource(
        'donnees-relatives-aux-resultats-des-tests-virologiques-covid-19',
        '406c6a23-e283-4300-9484-54e78c8ae675'
      ),
      { separator: ';' }
    )

    lines.shift()

    for (let [dep, date, positives, tests, ageClass] of lines) {
      if (!dep) continue
      if (ageClass !== '0') continue // Ignore lines with specific age class data

      let depInfo = await this.depInfo(dep)

      if (depInfo) {
        let { departement, region, population } = depInfo

        dataCallback(
          ['France', region, departement],
          [
            {
              date: Number(parseDate(date)),
              tests: Number(tests),
              positives: Number(positives)
            }
          ],
          population,
          ['country', 'region', 'department']
        )
      }
    }
  }
}
