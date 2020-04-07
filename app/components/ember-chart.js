import EmberChartComponent from 'ember-cli-chart/components/ember-chart'

// Override to be able to retrieve chart object

export default EmberChartComponent.extend({
  onChart: null,

  didInsertElement() {
    this._super(...arguments)
    if (this.onChart) this.onChart(this.chart)
  },

  willDestroyElement() {
    this._super(...arguments)
    if (this.onChart) this.onChart(null)
  }
})
