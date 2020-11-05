export default class WeakCache {
  constructor(getter) {
    this.map = new WeakMap()
    this.getter = getter
  }

  get(key, context) {
    let { map, getter } = this

    if (!map.has(key)) {
      map.set(key, context ? getter.call(context, key) : getter(key))
    }

    return map.get(key)
  }
}
