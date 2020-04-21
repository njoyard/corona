import registry from 'corona/utils/countrycodes'
import RegionOption from 'corona/models/region-option'

const DEFAULT_SELECTED_REGIONS = 5

function getRegions(data) {
  return Object.keys(data).filter((k) => !k.startsWith('_'))
}

function registerRec(data, parents = []) {
  let regions = getRegions(data)

  for (let region of regions) {
    let line = [...parents, region]
    registry.register(...line)
    registerRec(data[region], line)
  }
}

function getLongLabel(...levels) {
  let label = levels.pop()

  if (levels.length) {
    label += ` (${levels.reverse().join(', ')})`
  }

  return label
}

function buildOptions(label, data, selected, level = 0, parents = []) {
  let option
  let line = label === 'World' ? [] : [...parents, label]

  let children = getRegions(data)
  if (children.length === 1) {
    let [child] = children
    return buildOptions(child, data[child], selected, level, parents)
  }

  if (label === 'World') {
    option = new RegionOption('__', label, label, level)
    option.saturation = 0
    option.lightness = 30
  } else {
    option = new RegionOption(
      registry.getCode(...line),
      label,
      getLongLabel(...line),
      level
    )
  }

  option.setData(data)
  option.selected = selected.has(option.code)

  let childOptions = children.map((c) =>
    buildOptions(c, data[c], selected, level + 1, line)
  )

  option.addChild(...childOptions)

  return option
}

export default function buildRegionOptions(
  data,
  rootLabel,
  selectedRegionCodes
) {
  registry.invalidate()
  registerRec(data, rootLabel === 'World' ? [] : [rootLabel])

  let selected = selectedRegionCodes
    ? new Set(selectedRegionCodes.split('-'))
    : new Set()

  let rootOption = buildOptions(rootLabel, data, selected)

  if (!selected.size) {
    // No selection, select regions with top deaths
    for (let region of rootOption.children
      .sortBy('deaths')
      .reverse()
      .slice(0, DEFAULT_SELECTED_REGIONS)) {
      region.selected = true
    }
  }

  return rootOption
}
