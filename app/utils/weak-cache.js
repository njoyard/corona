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

/*
  Decorator to cache method results
  Decorated methods must have a single parameter, which will be used as
  a key, and must be an object.
 */
function decorate(prototype, name, descriptor) {
  let getter = descriptor.value
  let instanceCaches = new WeakMap()

  descriptor.value = function (key) {
    let instance = this

    if (!instanceCaches.has(instance)) {
      instanceCaches.set(instance, new WeakCache(getter))
    }

    let cache = instanceCaches.get(instance)
    return cache.get(key, instance)
  }
}

export { decorate }
