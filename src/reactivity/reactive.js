import { track, trigger } from './effect'

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)

      return target[key]
    },
    set(target, key, newValue) {
      target[key] = newValue

      trigger(target, key)

      return true
    }
  })
}

export { reactive }
