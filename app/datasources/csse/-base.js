import BaseDataSource from 'corona/datasources/-base'

const countryReplacements = {
  US: 'United States',
  'Taiwan*': 'Taiwan',
  'Korea, South': 'South Korea'
}

const scopeReplacements = {
  deceased: 'deaths'
}

const baseURL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series'

function parseCSV(csv) {
  return csv
    .split(/\r\n|\r|\n/g)
    .filter(Boolean)
    .map((l) =>
      l
        .replace(/"([^"]+)"/g, (m, p1) => p1.replace(/,/g, 'COMMA'))
        .split(',')
        .map((c) => c.replace(/COMMA/g, ','))
    )
}

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

    return `${baseURL}/time_series_covid19_${scope}_${this.region}.csv`
  }

  async fetchScope(scope, dataCallback) {
    let { skip, levels, population } = this.scopes[scope]
    let csvLines = parseCSV(await this.fetchText(this.urlFor(scope)))
    let dates = csvLines.shift().slice(skip).map(parseDate)

    let entries = csvLines.map((line) => {
      let levelNames = levels.map((l) => (typeof l === 'string' ? l : line[l]))

      if (levelNames[0] in countryReplacements) {
        levelNames[0] = countryReplacements[levelNames[0]]
      }

      let counts = line.slice(skip).map(Number)
      let pop = population ? line[population] : null

      return {
        levelsJoined: levelNames.join('|'),
        levelNames,
        dates,
        counts,
        pop
      }
    })

    for (let entry of entries) {
      let { levelsJoined, levelNames, dates, counts, pop } = entry

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

      dataCallback(levelNames, zipDateCounts(dates, counts, scope), pop)
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
