import fetch from 'fetch'

import env from 'corona/config/environment'

const { environment } = env
const FETCH_TIMEOUT = 5000

const downloadPromises = {}

function cleanup() {
  // Cleanup legacy keys
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i)

    if (key.startsWith('url-cache:')) {
      localStorage.removeItem(key)
    }
  }
}

export default function fetchText(url, key) {
  if (!key) {
    throw new Error('Missing fetch key')
  }

  key = `fetch-cache:${key}`

  if (!downloadPromises[url]) {
    let ls = localStorage.getItem(key)
    cleanup()

    downloadPromises[url] = new Promise((resolve, reject) => {
      if (ls && environment === 'development') {
        console.warn(
          'Not downloading data in development, clear local storage to force a refresh'
        )

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
                localStorage.setItem(key, text)
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

  return downloadPromises[url]
}
