const ordinalSuffixes = {
  '1': 'st',
  '2': 'nd',
  '3': 'rd'
}

function ordinal(number) {
  let str = `${number}`
  let suffix = ordinalSuffixes[str[str.length - 1]] || 'th'
  return `${str}${suffix}`
}

function bignum(number) {
  let suffix = ''

  if (number >= 1000000) {
    number = number / 1000000
    suffix = 'M'
  } else if (number >= 1000) {
    number = number / 1000
    suffix = 'k'
  }

  if (number !== Math.floor(number)) {
    number = number.toFixed(2).replace(/0+$/, '')
  }

  return `${number}${suffix}`
}

export { ordinal, bignum }
