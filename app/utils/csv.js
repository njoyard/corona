export default function parseCSV(csv, options) {
  let { separator } = Object.assign({ separator: ',' }, options)

  return csv
    .split(/\r\n|\r|\n/g)
    .filter(Boolean)
    .map((l) =>
      l
        .replace(/"([^"]*)"/g, (m, p1) => p1.replace(/,/g, 'SEPARATOR'))
        .split(separator)
        .map((c) => c.replace(/SEPARATOR/g, separator))
    )
}
