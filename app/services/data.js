import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class DataService extends Service {
  @service dataCsse;
  
  get source() {
    return this.dataCsse
  }

  data() {
    return this.source.data()
  }
}
