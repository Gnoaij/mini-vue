import { render, h } from 'vue'
import { reactive, computed, watch, effect } from './reactivity'

const state = reactive({
  count: 1
})

const doubleCount = computed(() => state.count * 2)

watch(
  () => state.count,
  (newValue, oldValue) => {
    console.log('watch run', newValue, oldValue)
  }
)

const app = document.querySelector('#app')

effect(() => {
  render(
    h('div', null, [
      h('p', null, `The count is: ${state.count}`),
      h('p', null, `The double count is: ${doubleCount.value}`),
      h(
        'button',
        {
          onClick: () => state.count++
        },
        'click'
      )
    ]),
    app
  )
})
