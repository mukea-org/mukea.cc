import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import HomeBackground from './components/HomeBackground.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(HomeBackground),
    })
  }
}
