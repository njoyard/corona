import { parseCSV, fetchText } from '../utils'

const countryReplacements = {
  US: 'United States',
  'Taiwan*': 'Taiwan',
  'Korea, South': 'South Korea'
}

const ignoreRegions = ['Diamond Princess', 'Grand Princess', 'MS Zaandam']

// Force aggregating france because we don't have the same subdivisions in data.gouv.fr datasources
const forceAggregate = ['France']

const scopeReplacements = {
  deceased: 'deaths'
}

const baseURL =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master'

function parseDate(date) {
  let [m, d, y] = date.split('/').map((x) => (Number(x) < 10 ? `0${x}` : x))
  return Number(new Date(`20${y}-${m}-${d}`))
}

function zipDateCounts(dates, counts, countKey) {
  return dates.map((date, index) => ({ date, [countKey]: counts[index] }))
}

let metaData

export default class CCSEDataSource {
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

  async metaFor(country, province = '', admin = '') {
    if (!metaData) {
      metaData = {}

      let csvLines = parseCSV(
        await fetchText(
          `${baseURL}/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv`
        )
      )

      let isos = {}

      for (let [
        ,
        iso2,
        ,
        ,
        ,
        admin,
        province,
        country,
        ,
        ,
        ,
        pop
      ] of csvLines) {
        // Save iso only for entry of country without province (ignore provinces isos that don't match country iso)
        if (!province) {
          isos[country] = iso2.toLowerCase
        }

        metaData[`${country}|${province}|${admin}`] = {
          pop: pop !== '' ? Number(pop) : null
        }
      }

      // Set isos
      for (let [country, iso] of Object.entries(isos)) {
        for (let key of Object.keys(metaData).filter((k) =>
          k.startsWith(`${country}|`)
        )) {
          metaData[key].iso = iso
        }
      }
    }

    return metaData[`${country}|${province}|${admin}`] || null
  }

  async fetchScope(scope) {
    let { skip, levels } = this.scopes[scope]
    let csvLines = parseCSV(await fetchText(this.urlFor(scope)))
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

    let data = []
    let isos = new Set()

    for (let entry of entries) {
      let { levelsJoined, levelNames, dates, counts } = entry

      let meta = await this.metaFor(...levelNames)
      let population, iso

      if (meta) {
        population = meta.pop
        iso = meta.iso
      }

      if (levelNames.some((l) => ignoreRegions.indexOf(l) !== -1)) {
        continue
      }

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

      data.push({
        zone: levelNames.join('|'),
        meta: { population },
        points: zipDateCounts(dates, counts, scope)
      })

      if (iso && !isos.has(iso)) {
        isos.add(iso)
        data.push({
          zone: levelNames[0],
          meta: { iso }
        })
      }
    }

    for (let region of forceAggregate) {
      let zones = data.filter(({ zone }) => zone.startsWith(`${region}|`))

      if (!zones.length) continue

      let aggregated = {
        zone: region,
        meta: {},
        points: []
      }

      for (let zone of zones) {
        for (let point of zone.points) {
          let existing = aggregated.points.find(
            ({ date }) => date === point.date
          )

          if (!existing) {
            existing = { date: point.date, [scope]: 0 }
            aggregated.points.push(existing)
          }

          existing[scope] += point[scope]
        }
      }

      // Remove children
      for (let zone of zones) {
        data.splice(data.indexOf(zone), 1)
      }

      data.push(aggregated)
    }

    return data
  }

  async fetchData() {
    let sets = await Promise.all(
      Object.keys(this.scopes).map((scope) => this.fetchScope(scope))
    )

    return sets.reduce((data, set) => [...data, ...set], [])
  }
}
