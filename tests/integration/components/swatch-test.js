import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | swatch', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('color', {})
    await render(hbs`<Swatch @color={{color}} />`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
