import { effect } from './effect'

function traverse(source, seen = new Set()) {
  if (
    typeof source !== 'object' ||
    typeof source === null ||
    seen.has(source)
  ) {
    return
  }

  seen.add(source)

  for (const k in source) {
    traverse(source[k], seen)
  }

  return source
}

function watch(source, cb, options = {}) {
  let getter

  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }

  let oldValue, newValue

  let cleanup

  const onInvalidate = (fn) => {
    cleanup = fn
  }

  const job = () => {
    newValue = effectFn()

    if (cleanup) {
      cleanup()
    }

    cb(newValue, oldValue, onInvalidate)

    oldValue = newValue
  }

  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (options.flush === 'post') {
        Promise.resolve().then(job)
      } else {
        job()
      }
    }
  })

  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

export { watch }
