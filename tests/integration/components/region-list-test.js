import { module, test } from 'qunit'
import { setupRenderingTest } from 'ember-qunit'
import { render } from '@ember/test-helpers'
import { hbs } from 'ember-cli-htmlbars'

module('Integration | Component | region-list', function (hooks) {
  setupRenderingTest(hooks)

  test('it renders', async function (assert) {
    this.set('regions', [])
    await render(
      hbs`<RegionList @sortBy="" @filter="" @regions={{this.regions}}/>`
    )

    assert.ok(true)
  })
})
