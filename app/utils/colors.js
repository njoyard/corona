const MIN_SATURATION = 25
const MAX_SATURATION = 90
const SATURATION_LEVELS = 4

const HUE_VARIANT = 3

let crc32 = (function () {
  let table = []
  let c

  for (let i = 0; i < 256; i++) {
    c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }

  return function (string) {
    let crc = 0 ^ -1

    for (let i = 0; i < string.length; i++)
      crc = (crc >>> 8) ^ table[(crc ^ string.charCodeAt(i)) & 255]

    return (crc ^ -1) >>> 0
  }
})()

export default function colorFor(text) {
  let crc = crc32(text)

  return {
    hue: Math.floor(crc / HUE_VARIANT) % 360,
    saturation:
      MIN_SATURATION +
      ((Math.floor(crc / (360 * HUE_VARIANT)) % SATURATION_LEVELS) *
        (MAX_SATURATION - MIN_SATURATION)) /
        SATURATION_LEVELS
  }
}
