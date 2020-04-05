import Service from '@ember/service'
import fetchText from 'corona/utils/fetch-text'

export default class DataWorldBankService extends Service {
  popUrl =
    'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?mrv=1&format=json&per_page=300'

  async getWorldPopulation(updateState) {
    updateState('downloading Worldbank population data')

    let worldPop = JSON.parse(await fetchText(this.popUrl))

    return worldPop[1].reduce((data, item) => {
      data[item.country.value.toLowerCase()] = item.value
      return data
    }, {})
  }
}
