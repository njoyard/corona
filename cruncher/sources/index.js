import CSSEUSDataSource from './csse-us'
import CSSEGlobalDataSource from './csse-global'
import FranceHospitalsDataSource from './france-hospitals'
import FranceTestsDataSource from './france-tests'

const sources = {
  'csse-us': new CSSEUSDataSource(),
  'csse-global': new CSSEGlobalDataSource(),
  'france-hospitals': new FranceHospitalsDataSource(),
  'france-tests': new FranceTestsDataSource()
}

export default sources
