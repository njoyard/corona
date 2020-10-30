import config from 'corona/config/environment'

const { environment } = config

export function initialize() {
  if (environment === 'production') {
    let script = document.createElement('script')
    script.setAttribute('data-goatcounter', 'https://stats.njoyard.fr/count')
    script.setAttribute('src', '//stats.njoyard.fr/count.js')
    document.body.appendChild(script)
  }
}

export default {
  initialize
}
