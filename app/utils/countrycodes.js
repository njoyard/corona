let registry = {}
let codes = null
let countries = null

function invalidate() {
  registry = {}
  codes = null
  countries = null
}

function uniqueKeys(entries) {
  let upper = entries.map((e) => e.toUpperCase())
  let keys = []

  for (let item of upper) {
    let index1 = 0
    let index2 = 1

    let key = `${item.charAt(index1)}${item.charAt(index2)}`

    while (keys.indexOf(key) !== -1) {
      index2++

      if (index2 >= item.length) {
        index1++
        index2 = index1 + 1
      }

      if (index2 >= item.length) {
        throw `Cannot find 2-char key for ${item} among ${upper.join(', ')}`
      }

      key = `${item.charAt(index1)}${item.charAt(index2)}`.trim()
    }

    keys.push(key)
  }

  return keys
}

function generateCodes() {
  let allCountries = Object.keys(registry).sort()
  let countryCodes = uniqueKeys(allCountries)

  codes = {}
  countries = {}

  allCountries.forEach((country, index) => {
    let countryCode = countryCodes[index]

    codes[country] = countryCode
    countries[countryCode] = { country }

    let provinces = [...registry[country]].sort()
    let provinceCodes = uniqueKeys(provinces)
    provinces.forEach((province, index) => {
      let provinceCode = `${countryCode}${provinceCodes[index]}`

      codes[`${country}:${province}`] = provinceCode
      countries[provinceCode] = { country, province }
    })
  })
}

function register(country, province) {
  if (!(country in registry)) registry[country] = new Set()
  if (province && !registry[country].has(province))
    registry[country].add(province)
}

function codeFor(country, province) {
  if (!codes) generateCodes()

  let key = province ? `${country}:${province}` : country

  return codes[key]
}

function entryFor(code) {
  if (!countries) generateCodes()

  return countries[code]
}

export { invalidate, register, codeFor, entryFor }
