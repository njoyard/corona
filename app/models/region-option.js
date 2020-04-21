import { A } from '@ember/array'
import { tracked } from '@glimmer/tracking'

import colorFor from 'corona/utils/colors'
import { fields as fieldDefinitions } from 'corona/utils/fields'

export default class RegionOption {
  @tracked selected = false
  @tracked label
  @tracked longLabel
  @tracked code
  @tracked points
  @tracked level = 0
  @tracked population

  @tracked hue
  @tracked saturation
  @tracked lightness = 65

  @tracked deaths
  @tracked cases

  children = A([])
  fields = A([])
  allFields = A([])

  constructor(code, label, longLabel, level = 0) {
    this.code = code
    this.label = label
    this.longLabel = longLabel
    this.level = level

    let { hue, saturation } = colorFor(longLabel)
    this.hue = hue
    this.saturation = saturation
  }

  addChild(...children) {
    children.forEach((child) => this.children.pushObject(child))
  }

  get hasChildren() {
    return this.children.length > 0
  }

  setData({ _points, _meta: { population, fields, allFields } }) {
    let points = (this.points = _points)
    let lastPoint = points[points.length - 1]

    this.population = population
    this.fields = A([...fields])
    this.allFields = A([...allFields])

    this.deaths = lastPoint.deceased

    let [casesField] = [...allFields].filter(
      (f) =>
        f in fieldDefinitions && fieldDefinitions[f].cases && f in lastPoint
    )

    if (casesField) {
      this.cases = lastPoint[casesField]
    }
  }
}
