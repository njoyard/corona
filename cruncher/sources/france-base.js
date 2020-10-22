import population from './france-population'
import { parseCSV, fetchText, debugOutput } from '../utils'

export default class DataGouvFrSource {
  async fetchResource(dataset, resource) {
    let url = `https://www.data.gouv.fr/api/1/datasets/${dataset}/resources/${resource}/`

    let { url: staticUrl } = JSON.parse(await fetchText(url))
    return await fetchText(staticUrl)
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

        if (!(departement in population)) {
          console.warn(`France: no population for ${departement}`)
          continue
        }

        departements[code] = departements[`0${code}`] = {
          departement,
          region: region || 'Outre-Mer',
          population: pop
        }
      }

      await debugOutput('departements', departements)
    }

    return departements[depCode]
  }
}
