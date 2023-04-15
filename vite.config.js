import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 8080,
    open: true
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  }
})
