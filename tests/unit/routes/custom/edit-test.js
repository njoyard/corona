import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | custom/edit', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:custom/edit');
    assert.ok(route);
  });
});
