function normalize(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function compareLabels(a, b) {
  let na = normalize(a.label)
  let nb = normalize(b.label)

  if (na < nb) return -1
  if (na > nb) return 1
  return 0
}

export { compareLabels }
