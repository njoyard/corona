const colors = {
  red: '#f44336',
  pink: '#e91e63',
  purple: '#9c27b0',
  deepPurple: '#673ab7',
  indigo: '#3f51b5',
  blue: '#2196f3',
  lightBlue: '#03a9f4',
  cyan: '#00bcd4',
  teal: '#009688',
  green: '#4caf50',
  lightGreen: '#8bc34a',
  lime: '#cddc39',
  yellow: '#ffeb3b',
  amber: '#ffc107',
  orange: '#ff9800',
  deepOrange: '#ff5722',
  brown: '#795548',
  grey: '#9e9e9e',
  blueGrey: '#607d8b'
}

function alpha(color, opacity, apply = false) {
  let values

  if (color.match(/^#/)) {
    values = color
      .replace(/#(..)(..)(..)/, '0x$1,0x$2,0x$3')
      .split(',')
      .map(Number)
  } else {
    values = color
      .replace(/rgba\((.+),(.+),(.+),(.+)\)/, '$1,$2,$3,$4')
      .split(',')
      .map(Number)

    opacity = opacity * values.pop()
  }

  if (apply) {
    values = values.map((v) => v * opacity + 255 * (1 - opacity))
    opacity = 1
  }

  return `rgba(${values.join(',')},${opacity})`
}

export { alpha, colors }
