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
const number = buildFormatter({}, (x) =>
  x > 1000 ? Math.round(x) : Math.round(x * 10) / 10
)
const integer = buildFormatter({}, (x) => Math.round(x))
const abs = buildFormatter({}, (x) => Math.abs(x))
const bignum = buildFormatter({ notation: 'compact' })

export { bignum, number, percent, abs, integer }
