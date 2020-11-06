export function initialize() {
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
