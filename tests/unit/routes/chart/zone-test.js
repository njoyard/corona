import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | chart/zone', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:chart/zone');
    assert.ok(route);
  });
});
