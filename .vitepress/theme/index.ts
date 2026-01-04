import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import MukeaBackground from './components/MukeaBackground.vue'
import DownloadPanel from './components/DownloadPanel.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('DownloadPanel', DownloadPanel)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => [
        h(MukeaBackground),
        h(Toaster, { position: 'top-center', richColors: true, theme: 'system' })
      ]
    })
  }
}
