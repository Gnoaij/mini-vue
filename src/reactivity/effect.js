import { queueJob } from './queue'

let activeEffect

const effectStack = []

const reactiveWeakMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) {
    return
  }

  let depsMap = reactiveWeakMap.get(target)

  if (!depsMap) {
    reactiveWeakMap.set(target, (depsMap = new Map()))
  }

  let deps = depsMap.get(key)

  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }

  deps.add(activeEffect)

  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = reactiveWeakMap.get(target)

  if (!depsMap) {
    return
  }

  const deps = depsMap.get(key)

  const effectsToRun = new Set()

  deps &&
    deps.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })

  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]

    deps.delete(effectFn)
  }

  effectFn.deps.length = 0
}

function effect(
  fn,
  options = {
    scheduler: queueJob
  }
) {
  const effectFn = () => {
    let i = effectStack.length
    let parent

    while ((parent = effectStack[--i])) {
      if (parent === effectFn) {
        return
      }
    }

    cleanup(effectFn)

    activeEffect = effectFn

    effectStack.push(effectFn)

    const res = fn()

    effectStack.pop()

    activeEffect = effectStack[effectStack.length - 1]

    return res
  }

  effectFn.options = options
  effectFn.deps = []

  if (!effectFn.options.lazy) {
    effectFn()
  }

  return effectFn
}

export { track, trigger, effect }
