import { A } from '@ember/array'
import { tracked } from '@glimmer/tracking'

import colorFor from 'corona/utils/colors'

export default class RegionOption {
  @tracked selected = false
  @tracked label
  @tracked longLabel
  @tracked code
  @tracked points
  @tracked level = 0
  @tracked confirmed
  @tracked deceased
  @tracked population
  @tracked recovered

  @tracked hue
  @tracked saturation
  @tracked lightness = 65

  children = A([])
  fields = A([])

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

  setData(data) {
    let points = (this.points = data._points)
    let lastPoint = points[points.length - 1]

    this.population = data._meta.population
    this.fields = A([...data._meta.fields])

    this.confirmed = lastPoint.confirmed
    this.deceased = lastPoint.deceased
    this.recovered = lastPoint.recovered
  }
}
