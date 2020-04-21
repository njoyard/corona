import { helper } from '@ember/component/helper'

export default helper(function regionState([
  region,
  field,
  requiresPopulation
]) {
  if (field.indexOf('-') === -1 && !region.fields.includes(field)) {
    return { disabled: true, reason: `No ${field} data in this region` }
  }

  if (requiresPopulation && !region.population) {
    return { disabled: true, reason: `No population data in this region` }
  }

  return { disabled: false }
})
