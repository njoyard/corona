import BaseDataSource from 'corona/datasources/-base'
import parseCSV from 'corona/utils/csv'

const countryReplacements = {
  US: 'United States',
  'Taiwan*': 'Taiwan',
  'Korea, South': 'South Korea'
}

const scopeReplacements = {
  deceased: 'deaths'
}

const baseURL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master'

// pop:  https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv

function parseDate(date) {
  let [m, d, y] = date.split('/').map((x) => (Number(x) < 10 ? `0${x}` : x))
  return Number(new Date(`20${y}-${m}-${d}`))
}

function zipDateCounts(dates, counts, countKey) {
  return dates.map((date, index) => {
    let point = { date }
    point[countKey] = counts[index]
    return point
  })
}

export default class CCSEDataSource extends BaseDataSource {
  get region() {
    throw new Error('Not implemented')
  }

  get scopes() {
    throw new Error('Not implemented')
  }

  urlFor(scope) {
    scope = scopeReplacements[scope] || scope
    return `${baseURL}/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${scope}_${this.region}.csv`
  }

  async populationFor(country, province = '', admin = '') {
    let { populationData } = this
    if (!populationData) {
      populationData = this.populationData = {}

      let csvLines = parseCSV(
        await this.fetchText(
          `${baseURL}/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv`,
          'csse:lut'
        )
      )

      for (let [, , , , , a, p, c, , , , pop] of csvLines) {
        populationData[`${c}|${p}|${a}`] = pop ? Number(pop) : null
      }
    }

    return populationData[`${country}|${province}|${admin}`] || null
  }

  async fetchScope(scope, dataCallback) {
    let { skip, levels, levelLabels } = this.scopes[scope]
    let csvLines = parseCSV(
      await this.fetchText(this.urlFor(scope), `csse:${this.region}:${scope}`)
    )
    let dates = csvLines.shift().slice(skip).map(parseDate)

    let entries = csvLines.map((line) => {
      let levelNames = levels.map((l) => (typeof l === 'string' ? l : line[l]))

      let counts = line.slice(skip).map(Number)

      return {
        levelsJoined: levelNames.join('|'),
        levelNames,
        dates,
        counts
      }
    })

    for (let entry of entries) {
      let { levelsJoined, levelNames, dates, counts } = entry
      let pop = await this.populationFor(...levelNames)

      while (levelsJoined.endsWith('|')) {
        // Do we have other entries with the same parent level names?
        let hasOther = entries.find(
          (e) => e !== entry && e.levelsJoined.startsWith(levelsJoined)
        )

        if (hasOther) {
          // Yes, call this one 'Mainland'
          levelNames[levelNames.length - 1] = 'Mainland'
        } else {
          // No, move this one up
          levelNames.pop()
        }

        levelsJoined = levelNames.join('|')
      }

      if (levelNames[0] in countryReplacements) {
        levelNames[0] = countryReplacements[levelNames[0]]
      }

      dataCallback(
        levelNames,
        zipDateCounts(dates, counts, scope),
        pop,
        levelLabels
      )
    }
  }

  async fetchData(dataCallback) {
    await Promise.all(
      Object.keys(this.scopes).map((scope) =>
        this.fetchScope(scope, dataCallback)
      )
    )
  }
}
