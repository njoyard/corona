import { module, test } from 'qunit'
import { setupRenderingTest } from 'ember-qunit'
import { render } from '@ember/test-helpers'
import { hbs } from 'ember-cli-htmlbars'

module('Integration | Helper | string-contains', function (hooks) {
  setupRenderingTest(hooks)

  // Replace this with your real tests.
  test('it renders', async function (assert) {
    await render(hbs`{{#if (string-contains "inputValue" "tV")}}yes{{/if}}`)

    assert.equal(this.element.textContent.trim(), 'yes')
  })
})
