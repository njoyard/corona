function uniqueKeys(entries) {
  let upper = entries.map((e) => e.toUpperCase())
  let keys = []

  for (let item of upper) {
    let index1 = 0
    let index2 = 1

    let key = `${item.charAt(index1)}${item.charAt(index2)}`

    while (keys.indexOf(key) !== -1) {
      index2++

      if (index2 >= item.length) {
        index1++
        index2 = index1 + 1
      }

      if (index2 >= item.length) {
        throw `Cannot find 2-char key for ${item} among ${upper.join(', ')}`
      }

      key = `${item.charAt(index1)}${item.charAt(index2)}`.trim()
    }

    keys.push(key)
  }

  return keys
}

class CodeRegistry {
  constructor() {
    this.invalidate()
  }

  invalidate() {
    this.subRegistries = {}
    this.items = new Set()

    this.codes = null
    this.entries = null
  }

  register(root, ...sub) {
    let { subRegistries } = this

    this.items.add(root)

    if (sub.length) {
      if (!(root in subRegistries)) {
        subRegistries[root] = new CodeRegistry()
      }

      subRegistries[root].register(...sub)
    }
  }

  generateCodes() {
    let { subRegistries } = this

    let items = [...this.items].sort()
    let keys = uniqueKeys(items)

    let codes = (this.codes = {})
    let entries = (this.entries = {})

    items.forEach((item, index) => {
      codes[item] = keys[index]
      entries[keys[index]] = { item, registry: subRegistries[item] }
    })
  }

  getCode(root, ...sub) {
    if (!this.codes) {
      this.generateCodes()
    }

    let { codes, subRegistries } = this
    let code = codes[root]

    if (sub.length) {
      return `${this.items.size === 1 ? '' : code}${subRegistries[root].getCode(
        ...sub
      )}`
    } else {
      return code
    }
  }
}

export default new CodeRegistry()
