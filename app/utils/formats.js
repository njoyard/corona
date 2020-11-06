function buildFormatter(options, transform = (x) => x) {
  let formatter

  return function (intl, value) {
    if (!formatter) {
      formatter = (value) => intl.formatNumber(transform(value), options)
    }

    return value === undefined ? formatter : formatter(value)
  }
}

function precision(num) {
  if (num >= 1000) return Math.round(num)
  if (num >= 100) return Math.round(num * 10) / 10
  return Math.round(num * 100) / 100
}

const percent = buildFormatter({ style: 'percent', maximumFractionDigits: 1 })
const number = buildFormatter({}, precision)
const integer = buildFormatter({}, (x) => Math.round(x))
const abs = buildFormatter({}, (x) => Math.abs(x))
const bignum = buildFormatter({ notation: 'compact' })

export { bignum, number, percent, abs, integer }
