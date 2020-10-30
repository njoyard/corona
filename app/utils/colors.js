const yellow = {
  bright: '#fce94f',
  normal: '#edd400',
  dark: '#c4a000'
}

const orange = {
  bright: '#fcaf3e',
  normal: '#f57900',
  dark: '#ce5c00'
}

const brown = {
  bright: '#e9b96e',
  normal: '#c17d11',
  dark: '#8f5902'
}

const green = {
  bright: '#8ae234',
  normal: '#73d216',
  dark: '#4e9a06'
}

const blue = {
  bright: '#729fcf',
  normal: '#3465a4',
  dark: '#204a87'
}

const purple = {
  bright: '#ad7fa8',
  normal: '#75507b',
  dark: '#5c3566'
}

const red = {
  bright: '#ef2929',
  normal: '#cc0000',
  dark: '#a40000'
}

const gray = {
  bright: '#888a85',
  normal: '#555753',
  dark: '#2e3436'
}

function alpha(color, opacity) {
  let alpha = {}

  for (let key in color) {
    let values = color[key]
      .replace(/#(..)(..)(..)/, '0x$1,0x$2,0x$3')
      .split(',')
      .map(Number)
      .join(',')

    alpha[key] = `rgba(${values},${opacity})`
  }

  return alpha
}

const allColors = { yellow, orange, brown, green, blue, purple, red, gray }

export {
  yellow,
  orange,
  brown,
  green,
  blue,
  purple,
  red,
  gray,
  alpha,
  allColors
}
