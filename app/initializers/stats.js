import config from 'corona/config/environment'

const { environment } = config

export function initialize() {
  if (environment === 'production') {
    window.goatcounter = { no_onload: true }

    let script = document.createElement('script')
    script.setAttribute('data-goatcounter', 'https://stats.njoyard.fr/count')
    script.setAttribute('src', '//stats.njoyard.fr/count.js')
    document.body.appendChild(script)

    let ready = false
    let available = true
    let pending = location.hash ? [location.pathname + location.hash] : []

    let sendCounts = () => {
      while (pending.length) {
        window.goatcounter.count({ path: pending.shift() })
      }
    }

    let readyStart = Date.now()
    let readyInterval = setInterval(() => {
      if (window.goatcounter && window.goatcounter.count) {
        clearInterval(readyInterval)
        ready = true
        sendCounts()
      } else if (Date.now() > readyStart + 20000) {
        clearInterval(readyInterval)
        pending = null
        available = false
        console.warn('not logging stats: unavailable')
      }
    }, 1000)

    window.addEventListener('hashchange', () => {
      if (available) {
        pending.push(location.pathname + location.hash)

        if (ready) {
          sendCounts()
        }
      }
    })
  } else {
    console.warn('not logging stats: not in production')
  }
}

export default {
  initialize
}
