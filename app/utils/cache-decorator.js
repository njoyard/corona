function cached(target, name, descriptor) {
  let cache = new WeakMap()
  let getter = descriptor.get

  descriptor.get = function () {
    if (!cache.has(this)) {
      cache.set(this, getter.call(this))
    }
    return cache.get(this)
  }

  return descriptor
}

export default cached
