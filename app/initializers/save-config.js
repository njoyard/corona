export function initialize(app) {
  let key = 'queryparams'
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
