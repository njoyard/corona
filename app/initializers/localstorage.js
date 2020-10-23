export function initialize(app) {
  let versionKey = 'corona:ls-version'
  let version = localStorage.getItem(versionKey)

  if (!version) {
    // Clean up previous version keys
    let keys = [...Array(localStorage.length).keys()].map((i) =>
      localStorage.key(i)
    )

    for (let key of keys) {
      if (
        key === 'queryparams' ||
        key === 'corona:queryparams' ||
        key.startsWith('fetch-cache:')
      ) {
        localStorage.removeItem(key)
      }
    }
  }

  localStorage.setItem(versionKey, '1')

  let key = 'corona:query-params'

  let saved = localStorage.getItem(key)
  if (saved && !location.search) {
    location.search = saved
    // Prevent the app from actually booting, browser will refresh anyways
    app.deferReadiness()
  }

  setInterval(() => {
    localStorage.setItem(key, location.search)
  }, 1000)
}

export default {
  initialize
}
