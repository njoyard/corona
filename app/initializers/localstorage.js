export function initialize() {
  let versionKey = 'corona:version'
  let version = localStorage.getItem(versionKey)

  if (!version) {
    let customKey = 'corona:custom-charts'
    let customCharts = localStorage.getItem(customKey)

    localStorage.clear()

    if (customCharts) {
      localStorage.setItem(customKey, customCharts)
    }
  }

  localStorage.setItem(versionKey, '1')
}

export default {
  initialize
}
