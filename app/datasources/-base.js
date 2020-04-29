import fetch from 'fetch'

import env from 'corona/config/environment'

const { environment } = env
const FETCH_TIMEOUT = 5000
const downloaded = new Set()

/*
  Data sources must extend this class.
  
  Use await `this.fetchText(url)` to fetch text from an URL.
  
  Implement the `fetchData` method asynchronously (try to parallelize async calls if possible).

  To return data, this method must use its `dataCallback` argument which has the following signature:
    `dataCallback(regionLevels, points, population, levelLabels)`

  All calls to `dataCallback` must be done BEFORE `fetchData` returns.

    - `regionLevels` is an array that specifies the region points/population concern. It
      must be a non-empty array of geographic subdivisions of ascending precision, with the country
      as first item (eg. ['United States', 'Arizona', 'Maricopa', 'Phoenix', 'Central City']).
      The subdivision naming scheme must match other datasources to avoid duplicates.
    - `points` is an array of data point for that region. It may be empty for a call that just
      specifies population. Each point must have a `date` key (with a Date as value) and
      may have any number of other fields. Use the same field names as other datasources (eg.
      'confirmed', 'recovered', 'deceased'...). If points already exist for that region, points
      with the same date are merged together (replacing existing property values) and points with
      new dates are added. Note that all points in a single `dataCallback` call MUST have the same
      fields.
    - `population` will replace any previous value set for that region, can be set to null if unknown
    - `levelLabels` is an array of type labels for the corresponding levels (eg ['country', 'region'...])

  Multiple calls for the same region can be made. 

  Population and point fields will be summed up to compute totals for parent regions (ie. it is
  not required to specify cases both for a region and the whole country).  
 */

export default class BaseDataSource {
  fetchText(url) {
    let lsKey = `url-cache:${url}`
    let ls = localStorage.getItem(lsKey)

    return new Promise((resolve, reject) => {
      // Avoid redownloading in the same session or in dev mode
      if (ls && (environment === 'development' || downloaded.has(url))) {
        if (environment === 'development') {
          console.warn(
            'Not downloading data in development, clear local storage to force a refresh'
          )
        }

        return resolve(ls)
      }

      let settled = false
      let lsTimeout = null

      // Resolve with local storage content on timeout
      if (ls) {
        lsTimeout = setTimeout(() => {
          if (!settled) {
            settled = true
            resolve(ls)
          }
        }, FETCH_TIMEOUT)
      }

      fetch(url).then(
        (response) => {
          if (!settled) {
            clearTimeout(lsTimeout)
            settled = true

            response.text().then((text) => {
              try {
                localStorage.setItem(lsKey, text)
                downloaded.add(url)
              } catch (e) {
                console.warn(
                  `Could not save ${url} response to local storage: ${e.message}`
                )
              }

              resolve(text)
            })
          }
        },
        (reason) => {
          if (!settled) {
            clearTimeout(lsTimeout)
            settled = true
            reject(reason)
          }
        }
      )
    })
  }

  async fetchData(/* dataCallback */) {
    throw new Error('Not implemented')
  }
}
