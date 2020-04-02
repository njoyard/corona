import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | string-matches', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('haystack', '1234');
    this.set('needle1', '23');
    this.set('needle2', '99');

    await render(hbs`{{#if (string-matches haystack needle1)}}yes1{{/if}}{{#unless (string-matches haystack needle2)}}no2{{/unless}}`);

    assert.equal(this.element.textContent.trim(), 'yes1no2');
  });
});

