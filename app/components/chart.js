import Component from '@ember/component'

export default Component.extend({
  tagName: 'canvas',
  attributeBindings: ['width', 'height'],
  onChart: null,

  init() {
    this._super(...arguments)

    this.plugins = this.plugins || []
  },

  didInsertElement() {
    this._super(...arguments)
    let { element: context, data, type, options, plugins } = this

    /* global Chart */
    let chart = new Chart(context, {
      type: type,
      data: data,
      options: options,
      plugins: plugins
    })
    this.chart = chart

    if (this.onChart) this.onChart(this.chart)
  },

  willDestroyElement() {
    this._super(...arguments)
    this.chart.destroy()

    if (this.onChart) this.onChart(null)
  },

  didUpdateAttrs() {
    this._super(...arguments)
    this.updateChart()
  },

  updateChart() {
    let { chart, data, options, animate } = this

    if (chart) {
      chart.data = data
      chart.options = options
      if (animate) {
        chart.update()
      } else {
        chart.update(0)
      }
    }
  }
})
