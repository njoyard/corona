function buildFormatter(options, transform = (x) => x) {
  let formatter

  return function (intl, value) {
    if (!formatter) {
      formatter = (value) => intl.formatNumber(transform(value), options)
    }

    return value === undefined ? formatter : formatter(value)
  }
}

const percent = buildFormatter({ style: 'percent', maximumFractionDigits: 1 })
const number = buildFormatter({})
const integer = buildFormatter({ maximumFractionDigits: 0 })
const abs = buildFormatter({}, (x) => Math.abs(x))
const bignum = buildFormatter({ notation: 'compact' })

export { bignum, number, percent, abs, integer }
