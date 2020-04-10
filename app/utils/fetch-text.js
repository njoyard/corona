import fetch from 'fetch'
import env from 'corona/config/environment'

const { environment } = env

const DEFAULT_TIMEOUT = 5000
const downloaded = new Set()

// Fetch text from URL, fallback to local storage cache when too long
// and use local storage cache when downloaded once in the same session
export default function fetchText(url, fallbackCallback) {
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

    if (ls) {
      lsTimeout = setTimeout(() => {
        if (!settled) {
          settled = true
          if (typeof fallbackCallback === 'function') fallbackCallback()
          resolve(ls)
        }
      }, DEFAULT_TIMEOUT)
    }

    fetch(url).then(
      (response) => {
        if (!settled) {
          clearTimeout(lsTimeout)
          settled = true

          response.text().then((text) => {
            localStorage.setItem(lsKey, text)
            downloaded.add(url)
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
