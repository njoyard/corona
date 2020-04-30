import crc32 from 'corona/utils/crc32'

const MIN_SATURATION = 25
const MAX_SATURATION = 90
const SATURATION_LEVELS = 4

const HUE_VARIANT = 3

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
