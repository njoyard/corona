import Controller from '@ember/controller'
import { tracked } from '@glimmer/tracking'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { scheduleOnce } from '@ember/runloop'
import {
  generateChartData,
  generateChartOptions,
  xOffsetOptions,
  yFieldOptions
} from 'corona/utils/chart'
import presets from 'corona/utils/presets'
import { ordinal } from 'corona/utils/format'

function compareYSelections(a, b) {
  return yFieldOptions[a].order - yFieldOptions[b].order
}

export default class ApplicationController extends Controller {
  @service data
  @service media

  queryParams = [
    { dataset: 'd' },
    { xSelection: 'x' },
    { xLog: 'xl' },
    { xStartOffset: 'xs' },
    { ySelection: 'y' },
    { yLog: 'yl' },
    { yChange: 'yc' },
    { yMovingAverage: 'ya' },
    { yRatio: 'yr' },
    { showLegend: 'l' },
    { stacked: 's' },
    { selectedRegionCodes: 'r' }
  ]

  /*
    ---- START WORKAROUND for https://github.com/emberjs/ember.js/issues/18715 ----

    Performance issue with @tracked queryParams
  */

  @tracked _xSelection = 'date'

  get xSelection() {
    return this._xSelection
  }

  set xSelection(value) {
    this._xSelection = value
  }

  @tracked _xLog = false

  get xLog() {
    return this._xLog
  }

  set xLog(value) {
    this._xLog = value
  }

  @tracked _xStartOffset = 5

  get xStartOffset() {
    return this._xStartOffset
  }

  set xStartOffset(value) {
    this._xStartOffset = value
  }

  @tracked _ySelection = 'confirmed'

  get ySelection() {
    return this._ySelection
  }

  set ySelection(value) {
    this._ySelection = value
  }

  @tracked _yLog = false

  get yLog() {
    return this._yLog
  }

  set yLog(value) {
    this._yLog = value
  }

  @tracked _yChange = false

  get yChange() {
    return this._yChange
  }

  set yChange(value) {
    this._yChange = value
  }

  @tracked _yMovingAverage = false

  get yMovingAverage() {
    return this._yMovingAverage
  }

  set yMovingAverage(value) {
    this._yMovingAverage = value
  }

  @tracked _yRatio = false

  get yRatio() {
    return this._yRatio
  }

  set yRatio(value) {
    this._yRatio = value
  }

  @tracked _showLegend = true

  get showLegend() {
    return this._showLegend
  }

  set showLegend(value) {
    this._showLegend = value
  }

  @tracked _stacked = false

  get stacked() {
    return this._stacked
  }

  set stacked(value) {
    this._stacked = value
  }

  /* ---- END WORKAROUND ---- */

  @tracked dataset = 'flat'
  @tracked xStartField = 'confirmed'

  @action
  selectDataset(ds) {
    this.data.reloading = true
    this.showSourcesDialog = false
    this.selectedOptions.clear()

    if (
      ds === 'us' &&
      (this.ySelection === 'recovered' || this.ySelection === 'active ')
    ) {
      this.ySelection = 'confirmed'
    }

    setTimeout(() => {
      this.dataset = ds
    }, 0)
  }

  @tracked _sideNavOpen = null

  get sideNavOpen() {
    let newValue = this.media.isWide ? null : this._sideNavOpen

    if (this.chart && newValue !== this._sideNavOpen) {
      // Force resize of the chart, needed because the sidenav animation
      // when switching between narrow and wide screen (eg. when rotating
      // the device) prevents chartjs detecting the resize
      setTimeout(() => this.chart.resize(), 1500)
    }

    return newValue
  }

  set sideNavOpen(value) {
    this._sideNavOpen = value
  }

  get sideNavLockedOpen() {
    return this.media.isWide
  }

  @tracked speedDialOpen = false
  @tracked showAboutDialog = false
  @tracked showSourcesDialog = false
  @tracked showShareDialog = false
  @tracked showPresetDialog = false
  @tracked shareURL = location.href

  presets = presets

  @action selectPreset(preset) {
    if (preset.singleRegion) this.selectFirstRegion()

    this.setProperties(preset.params)
    this.showPresetDialog = false
  }

  @action
  share() {
    this.shareURL = location.href
    this.showShareDialog = true

    scheduleOnce('afterRender', this, 'shareFocus')
  }

  shareFocus() {
    let input = document.querySelector('.share-input input')

    input.focus()
    input.select()
  }

  @tracked regionFilter = ''
  @tracked regionSortBy = '-deceased'

  get rootOption() {
    return this.model.rootOption
  }

  get regionOptions() {
    return this.model.regionOptions
  }

  get selectedOptions() {
    return this.model.selectedOptions
  }

  get hasSingleOption() {
    return this.selectedOptions.length < 2
  }

  get hasSelection() {
    return this.selectedOptions.length > 0
  }

  get drawableOptions() {
    let {
      selectedOptions,
      yRatio,
      ySelection,
      xSelection,
      xStartOffset,
      xStartField
    } = this

    let options = selectedOptions.filter(
      (o) =>
        (!yRatio || o.population) &&
        ((ySelection !== 'recovered' && ySelection !== 'active') || o.recovered)
    )

    if (xSelection === 'start') {
      let startOffset = xOffsetOptions[xStartOffset]
      options = options.filter(
        ({ points }) => points[points.length - 1][xStartField] >= startOffset
      )
    }

    return options
  }

  set selectedRegionCodes(value) {
    if (!this.model) return

    let { selectedOptions, regionOptions } = this
    let codes = new Set(value.split('-'))

    for (let option of selectedOptions) {
      if (codes.has(option.code)) {
        codes.delete(option.code)
      } else {
        selectedOptions.removeObject(option)
      }
    }

    selectedOptions.pushObjects(
      [...codes].map((c) => regionOptions.findBy('code', c)).filter(Boolean)
    )
  }

  get selectedRegionCodes() {
    if (!this.model) return ''

    return this.selectedOptions.map((o) => o.code).join('-')
  }

  @action
  toggleRegion(option) {
    let { selectedOptions, ySelection } = this

    option.selected = !option.selected

    if (option.selected) {
      selectedOptions.pushObject(option)
    } else {
      selectedOptions.removeObject(option)
    }

    if (selectedOptions.length > 1 && ySelection.indexOf('-') !== -1) {
      // Select first ySelection
      this.ySelection = ySelection.split('-')[0]
    }
  }

  @action
  toggleChildren(option) {
    let { selectedOptions, ySelection } = this
    let allSelected = option.children.every((c) => c.selected)
    let targetState = allSelected ? false : true

    for (let child of option.children) {
      if (child.selected !== targetState) {
        child.selected = targetState

        if (targetState) {
          selectedOptions.pushObject(child)
        } else {
          selectedOptions.removeObject(child)
        }
      }
    }

    if (selectedOptions.length > 1 && ySelection.indexOf('-') !== -1) {
      // Select first ySelection
      this.ySelection = ySelection.split('-')[0]
    }
  }

  selectFirstRegion() {
    let { selectedOptions, regionSortBy, regionOptions } = this

    if (selectedOptions.length !== 1) {
      let options = selectedOptions.length ? selectedOptions : regionOptions

      if (regionSortBy) {
        let reverse = regionSortBy.startsWith('-')
        let key = reverse ? regionSortBy.substr(1) : regionSortBy
        let sorted = options.sortBy(key)
        options = reverse ? sorted.reverse() : sorted
      }

      let firstOption = options.firstObject

      firstOption.selected = true
      for (let option of selectedOptions) {
        if (option !== firstOption) option.selected = false
      }

      selectedOptions.clear()
      selectedOptions.pushObject(firstOption)
    }
  }

  get xStartOffsetOrdinal() {
    return ordinal(xOffsetOptions[this.xStartOffset])
  }

  @action
  ySelect(selection) {
    if (this.hasSingleOption) {
      let { ySelection } = this
      let selected = new Set(ySelection.split('-'))

      // Refuse deselection if what was clicked was the only selected item
      if (selected.size === 1 && selected.has(selection)) return

      // Toggle selection
      selected.has(selection)
        ? selected.delete(selection)
        : selected.add(selection)

      this.ySelection = [...selected].sort(compareYSelections).join('-')
    } else {
      this.ySelection = selection
    }
  }

  get chartPlugins() {
    return []
  }

  get chartOptions() {
    return generateChartOptions(this, (dsIndex) => {
      if (this.selectedOptions.length > 1) {
        this.toggleRegion(this.selectedOptions.sortBy('value')[dsIndex])
      }
    })
  }

  get chartData() {
    return generateChartData(this)
  }

  chart = null

  @action
  chartChanged(chart) {
    this.chart = chart
  }

  @tracked downloadURL = null

  @action
  downloadChart() {
    this.downloadURL = document.querySelector('canvas').toDataURL('image/png')
  }
}
