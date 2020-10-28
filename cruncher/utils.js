import { resolve, dirname } from 'path'

import { ensureDir, writeFile, readFile, pathExists } from 'fs-extra'
import fetch from 'node-fetch'

const DATA_DIR = resolve(dirname(__dirname), 'data')
const CACHE_DIR = resolve(DATA_DIR, 'cache')
const DEBUG_DIR = resolve(DATA_DIR, 'debug')

function parseCSV(csv, options) {
  let { separator } = Object.assign({ separator: ',' }, options)

  return csv
    .split(/\r\n|\r|\n/g)
    .filter(Boolean)
    .map((l) =>
      l
        .replace(/"([^"]*)"/g, (m, p1) => p1.replace(/,/g, '__SEP__'))
        .split(separator)
        .map((c) => c.replace(/__SEP__/g, separator))
    )
}

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

async function fetchText(url) {
  await ensureDir(CACHE_DIR)

  let cacheKey = `fetch-${url
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/_$/, '')}`
  let cacheFile = resolve(CACHE_DIR, cacheKey)

  if (await pathExists(cacheFile)) {
    console.log(`  reusing cached ${url}`)
    return await readFile(cacheFile, 'utf-8')
  } else {
    console.log(`  fetching ${url}`)

    let response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `When fetching ${url}: got HTTP ${response.status} ${response.statusText}`
      )
    }

    let content = await response.text()
    await writeFile(cacheFile, content)
    return content
  }
}

function sortBy(key) {
  return (a, b) => {
    let av = a[key]
    let bv = b[key]

    if (av < bv) {
      return -1
    } else if (av > bv) {
      return 1
    } else {
      return 0
    }
  }
}

// Returns one item from one of arrays that has the lowest date property
// and removes it from its array.
// Assumes arrays are sorted by ascending dates
function nextByDate(arrays) {
  let firsts = arrays
    .map((a, index) => (a[0] ? { date: a[0].date, index } : null))
    .filter(Boolean)
    .sort(sortBy('date'))

  if (!firsts.length) {
    return null
  }

  let { index } = firsts[0]

  return arrays[index].shift()
}

async function debugOutput(name, data) {
  if (process.env.DEBUG_OUTPUT) {
    let isJson = typeof data !== 'string'

    await ensureDir(DEBUG_DIR)
    await writeFile(
      resolve(DEBUG_DIR, `${name}${isJson ? '.json' : ''}`),
      isJson ? JSON.stringify(data, null, '  ') : data
    )
  }
}

function intersect(...sets) {
  sets = sets.map((s) => (Array.isArray(s) ? new Set(s) : s))

  if (sets.length === 1) {
    return sets[0]
  }

  return sets.reduce((a, b) => {
    let output = new Set()

    for (let x of a) {
      if (b.has(x)) {
        output.add(x)
      }
    }

    return output
  })
}

function union(...sets) {
  sets = sets.map((s) => (Array.isArray(s) ? new Set(s) : s))

  let output = new Set()

  for (let set of sets) {
    for (let x of set) {
      output.add(x)
    }
  }

  return output
}

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\W/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export {
  DATA_DIR,
  parseCSV,
  parseDate,
  fetchText,
  sortBy,
  nextByDate,
  debugOutput,
  intersect,
  union,
  slugify
}
