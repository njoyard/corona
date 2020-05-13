import { helper } from '@ember/component/helper'

export default helper(function regionState([
  region,
  requiresFields,
  requiresPopulation
]) {
  let { fields, typeLabel, population } = region
  let [missingField] = requiresFields
    .split('-')
    .filter((f) => !fields.includes(f))

  if (missingField) {
    return {
      disabled: true,
      reason: `No ${missingField} data in this ${typeLabel || 'region'}`
    }
  }

  if (requiresPopulation && !population) {
    return {
      disabled: true,
      reason: `No population data in this ${typeLabel || 'region'}`
    }
  }

  return { disabled: false }
})
