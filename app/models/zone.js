import { getName } from 'ember-i18n-iso-countries'

export default class Zone {
  id = null
  parent = null
  population = null
  subdivision = 'region'
  iso = null
  label = null

  fields = new Set()
  children = []
  points = []

  constructor(id, data, intl, parent = null) {
    this.id = id

    let zoneData = data.find((z) => z.zone === id)
    if (!zoneData) {
      throw new Error(`Cannot build zone: ${id}`)
    }

    this.points = zoneData.points
    if (parent) {
      this.parent = parent
    }

    this._setMeta(zoneData.meta)
    this._setLabel(intl)

    this.children = data
      .filter((z) => z.parent === id)
      .map((z) => new Zone(z.zone, data, intl, this))
      .sort(({ label: a }, { label: b }) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  _setMeta(meta) {
    this.fields = new Set(meta.fields)

    if ('population' in meta) {
      this.population = meta.population
    }

    if ('subdivision' in meta) {
      this.subdivision = meta.subdivision
    }

    if ('iso' in meta) {
      this.iso = meta.iso
    }
  }

  _setLabel(intl) {
    let { id, iso } = this

    if (intl.exists(`zones.${id}`)) {
      this.label = intl.t(`zones.${id}`)
    } else if (iso) {
      let locale = intl.locale
      if (!Array.isArray(locale)) {
        locale = [locale]
      }

      let locales = locale.map((l) => l.split('-')[0].toLowerCase())

      while (!this.label && locales.length) {
        this.label = getName(iso.toUpperCase(), locales.shift())
      }
    }

    if (!this.label) {
      this.label = id.split('|').pop()
    }
  }

  get siblings() {
    return (this.parent && this.parent.children) || []
  }

  get subdivKey() {
    return `subdivision.${this.subdivision}`
  }

  find(id) {
    if (id === this.id) {
      return this
    }

    for (let child of this.children) {
      let found = child.find(id)
      if (found) {
        return found
      }
    }
  }
}
