import BaseDataSource from 'corona/datasources/-base'
import population from 'corona/datasources/data.gouv.fr/fr-population'
import parseCSV from 'corona/utils/csv'

export default class DataGouvFrSource extends BaseDataSource {
  async fetchResource(dataset, resource) {
    let url = `https://www.data.gouv.fr/api/1/datasets/${dataset}/resources/${resource}/`

    let { url: staticUrl } = JSON.parse(
      await this.fetchText(url, `datagouv:${dataset}:${resource}`)
    )

    return await this.fetchText(
      staticUrl,
      `datagouv:${dataset}:${resource}:static`
    )
  }

  async depInfo(depCode) {
    let { departements } = this

    if (!departements) {
      departements = this.departements = {}

      let csvLines = parseCSV(
        await this.fetchResource(
          'liste-des-departements-francais-metropolitains-doutre-mer-et-les-com-ainsi-que-leurs-prefectures',
          '8603852d-9ae4-4a32-b65f-d5800106e985'
        )
      )

      csvLines.shift()

      for (let [code, , departement, , region] of csvLines) {
        let pop = population[departement]
        if (!pop) {
          console.warn(`France: no population for ${departement}`)
        }

        departements[code] = departements[`0${code}`] = {
          departement,
          region: region || 'Outre-Mer',
          population: pop
        }
      }
    }

    return departements[depCode]
  }
}
