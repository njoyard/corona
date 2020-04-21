import Controller from '@ember/controller'
import { tracked } from '@glimmer/tracking'
import { action } from '@ember/object'
import { inject as service } from '@ember/service'
import { scheduleOnce } from '@ember/runloop'
import {
  generateChartData,
  generateChartOptions,
  xOffsetOptions
} from 'corona/utils/chart'
import presets from 'corona/utils/presets'
import { ordinal } from 'corona/utils/format'
import { fields, sortFields } from 'corona/utils/fields'

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

  @action
  selectDataset(ds) {
    this.data.reloading = true
    this.showSourcesDialog = false
    this.selectedRegions.clear()

    setTimeout(() => {
      this.dataset = ds
    }, 0)
  }

  checkModel() {
    let { ySelection, visibleFields } = this

    // Only keep Y fields that are visible, and fallback to the first visible field
    this.ySelection = ySelection =
      ySelection
        .split('-')
        .filter((y) => visibleFields.find((f) => f.key === y))
        .join('-') || visibleFields[0].key

    // Ensure a single region is selected when we have mutliple Y fields
    if (this.ySelection.indexOf('-') !== -1) {
      this.selectFirstRegion()
    }
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

  get visibleFields() {
    let {
      rootRegion: { allFields }
    } = this

    return allFields
      .filter((f) => f in fields && fields[f].label)
      .sort(sortFields)
      .map((f) => Object.assign({ key: f }, fields[f]))
  }

  get hasConfirmed() {
    let {
      rootRegion: { allFields }
    } = this

    return allFields.includes('confirmed')
  }

  get xStartField() {
    let {
      rootRegion: { allFields }
    } = this

    let [startField] = allFields
      .filter((f) => f in fields && fields[f].cases)
      .sort(sortFields)
    return startField
  }

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
  @tracked regionSortBy = '-deaths'

  get rootRegion() {
    return this.model.rootRegion
  }

  get regionOptions() {
    return this.model.regionOptions
  }

  get selectedRegions() {
    return this.model.selectedRegions
  }

  get selectedRegionCount() {
    return this.selectedRegions.length
  }

  get drawableRegions() {
    let {
      regionSortBy,
      selectedRegions,
      yRatio,
      ySelection,
      xSelection,
      xStartOffset,
      xStartField
    } = this

    let regions = selectedRegions.filter(
      (r) =>
        (!yRatio || r.population) &&
        ((ySelection !== 'recovered' && ySelection !== 'active') || r.recovered)
    )

    if (xSelection === 'start') {
      let startOffset = xOffsetOptions[xStartOffset]
      regions = regions.filter(
        ({ points }) => points[points.length - 1][xStartField] >= startOffset
      )
    }

    if (regionSortBy) {
      let reverse = regionSortBy.startsWith('-')
      let key = reverse ? regionSortBy.substr(1) : regionSortBy
      let sorted = regions.sortBy(key)
      regions = reverse ? sorted.reverse() : sorted
    }

    return regions
  }

  set selectedRegionCodes(value) {
    if (!this.model) return

    let { selectedRegions, regionOptions } = this
    let codes = new Set(value.split('-'))

    for (let region of selectedRegions) {
      if (codes.has(region.code)) {
        codes.delete(region.code)
      } else {
        selectedRegions.removeObject(region)
      }
    }

    selectedRegions.pushObjects(
      [...codes].map((c) => regionOptions.findBy('code', c)).filter(Boolean)
    )
  }

  get selectedRegionCodes() {
    if (!this.model) return ''

    return this.selectedRegions.map((r) => r.code).join('-')
  }

  @action
  toggleRegion(region) {
    let { selectedRegions, hasMultipleYSelection } = this

    region.selected = !region.selected

    if (region.selected) {
      if (hasMultipleYSelection) {
        for (let other of selectedRegions) {
          other.selected = false
        }

        selectedRegions.clear()
      }

      selectedRegions.pushObject(region)
    } else {
      selectedRegions.removeObject(region)
    }
  }

  @action
  toggleChildren(region) {
    let { selectedRegions } = this
    let allSelected = region.children.every((c) => c.selected)
    let targetState = allSelected ? false : true

    for (let child of region.children) {
      if (child.selected !== targetState) {
        child.selected = targetState

        if (targetState) {
          selectedRegions.pushObject(child)
        } else {
          selectedRegions.removeObject(child)
        }
      }
    }
  }

  selectFirstRegion() {
    let { selectedRegions, regionSortBy, regionOptions } = this

    if (selectedRegions.length !== 1) {
      let regions = selectedRegions.length ? selectedRegions : regionOptions

      if (regionSortBy) {
        let reverse = regionSortBy.startsWith('-')
        let key = reverse ? regionSortBy.substr(1) : regionSortBy
        let sorted = regions.sortBy(key)
        regions = reverse ? sorted.reverse() : sorted
      }

      let firstRegion = regions.firstObject

      firstRegion.selected = true
      for (let option of selectedRegions) {
        if (option !== firstRegion) option.selected = false
      }

      selectedRegions.clear()
      selectedRegions.pushObject(firstRegion)
    }
  }

  get xStartOffsetOrdinal() {
    return ordinal(xOffsetOptions[this.xStartOffset])
  }

  @action
  ySelect(selection) {
    if (this.selectedRegionCount === 1) {
      let { ySelection } = this
      let selected = new Set(ySelection.split('-'))

      // Refuse deselection if what was clicked was the only selected item
      if (selected.size === 1 && selected.has(selection)) return

      // Toggle selection
      selected.has(selection)
        ? selected.delete(selection)
        : selected.add(selection)

      this.ySelection = [...selected].sort(sortFields).join('-')
    } else {
      this.ySelection = selection
    }
  }

  get hasMultipleYSelection() {
    return this.ySelection.indexOf('-') !== -1
  }

  get chartPlugins() {
    return []
  }

  get chartOptions() {
    return generateChartOptions(this, (dsIndex) => {
      if (this.selectedRegions.length > 1) {
        this.toggleRegion(this.selectedRegions.sortBy('value')[dsIndex])
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
