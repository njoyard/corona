import { helper } from '@ember/component/helper'

export default helper(function pluralize([name]) {
  if (name.endsWith('y')) {
    return name.replace(/y$/, 'ies')
  }

  return `${name}s`
})
