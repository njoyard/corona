export function initialize() {
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
  } else if (version === '1') {
    localStorage.removeItem('corona:query-params')
  }

  localStorage.setItem(versionKey, '2')

  // Clear querystring from previous version
  let url = new URL(location.href)
  if (url.search) {
    url.search = ''
    history.replaceState(null, '', url.href)
  }
}

export default {
  initialize
}
