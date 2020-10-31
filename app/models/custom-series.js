import { tracked } from '@glimmer/tracking'

import { colors } from 'corona/utils/colors'
import parse from 'corona/utils/field-parser'

export default class CustomSeries {
  @tracked label
  @tracked expr = ''
  @tracked type = 'line'
  @tracked scale = 'count'
  @tracked color = colors.grey

  allFields = null

  constructor(label, intl, allFields) {
    this.label = label
    this.intl = intl
    this.allFields = allFields
  }

  get errors() {
    let { expr, intl, allFields } = this

    try {
      parse(expr.replace(/\s/g, ''), allFields)
    } catch (e) {
      if (e.message.type) {
        return [intl.t(`custom.errors.${e.message.type}`, e.message)]
      } else {
        return [intl.t('custom.errors.syntax')]
      }
    }

    return []
  }

  get repr() {
    let { label, expr, color, type, scale } = this

    return {
      l: label,
      e: expr.replace(/\s/g, ''),
      t: type,
      s: scale,
      c: color
    }
  }

  static fromRepr(repr, intl, allFields) {
    let { l: label, e: expr, t: type, s: scale, c: color } = repr

    let series = new CustomSeries(label, intl, allFields)
    Object.assign(series, { expr, type, scale, color: color })

    return series
  }
}
