import { track, trigger, effect } from './effect'

function computed(getter) {
  let value
  let dirty = true

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true
        trigger(computedRef, 'value')
      }
    }
  })

  const computedRef = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }

      track(computedRef, 'value')

      return value
    }
  }

  return computedRef
}

export { computed }
