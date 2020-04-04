import fetch from 'fetch'

const DEFAULT_TIMEOUT = 5000

export default function fetchText(url, fallbackCallback) {
  let lsKey = `url-cache:${url}`
  let ls = localStorage.getItem(lsKey)

  return new Promise((resolve, reject) => {
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
