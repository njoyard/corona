import DataGouvFrSource from 'corona/datasources/data.gouv.fr/-base'
import parseCSV from 'corona/utils/csv'

export default class FranceHospitalsDataSource extends DataGouvFrSource {
  async fetchData(dataCallback) {
    let lines = parseCSV(
      await this.fetchResource(
        'donnees-hospitalieres-relatives-a-lepidemie-de-covid-19',
        '63352e38-d353-4b54-bfd1-f1b3ee1cabd7'
      ),
      { separator: ';' }
    )

    lines.shift()

    for (let [dep, gender, date, hosp, rea, rad, dc] of lines) {
      if (!dep) continue
      if (gender !== '0') continue // Ignore lines with specific male/female data

      let { departement, region, population } = await this.depInfo(dep)

      dataCallback(
        ['France', region, departement],
        [
          {
            date: Number(new Date(date)),
            hospital: Number(hosp),
            intensive: Number(rea),
            recovered: Number(rad),
            deceased: Number(dc)
          }
        ],
        population,
        ['country', 'region', 'department']
      )
    }
  }
}
