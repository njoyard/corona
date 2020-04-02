import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DataService extends Service {
  @service dataCsse;
  
  @tracked sourceName = 'csse';

  get source() {
    if (this.sourceName === 'csse') {
      return this.dataCsse
    }
  }

  data() {
    return this.source.data()
  }
}
