import CSSEUSDataSource from './csse-us'
import CSSEGlobalDataSource from './csse-global'
import ECDCHospitalDataSource from './ecdc-hospitals'
import FranceHospitalsDataSource from './france-hospitals'
import FranceTestsDataSource from './france-tests'

const sources = {
  'csse-us': new CSSEUSDataSource(),
  'csse-global': new CSSEGlobalDataSource(),
  'ecdc-hospitals': new ECDCHospitalDataSource(),
  'france-hospitals': new FranceHospitalsDataSource(),
  'france-tests': new FranceTestsDataSource()
}

export default sources
