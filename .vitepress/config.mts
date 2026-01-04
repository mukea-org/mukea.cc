import { defineConfig } from 'vitepress'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  vite: {
    plugins: [Icons({ compiler: 'vue3', autoInstall: false })]
  },
  title: "Mukea",
  
  // 共享的主题配置
  themeConfig: {
    logo: '/favicon.ico',
  },
 base: '/', 
  // i18n 配置核心
  locales: {
    // 默认语言（中文） - 对应根目录 /
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: "Mukea",
      description: "一个可爱、主动的桌面 AI 伙伴",
      themeConfig: {
        nav: [
          { text: '下载', link: '/download' },
          { text: '博客', link: '/blog', target: '_blank', rel: 'noreferrer' }
        ],
        sidebar: {
          '/blog/': [
            {
              text: '博客',
              items: [
                { text: '为什么我们要做 Mukea', link: '/blog/' },
                { text: 'Mukea形象', link: '/blog/mukea-image' }
              ]
            }
          ]
        }
      }
    },
    // 英文 - 对应 /en/ 目录
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/', // 指向英文版首页
      title: "Mukea",
      description: "A cute, proactive AI companion.",
      themeConfig: {
        nav: [
          { text: 'Download', link: '/en/download' },
          { text: 'Blog', link: '/en/blog', target: '_blank', rel: 'noreferrer' }
        ],
        sidebar: {
          '/en/blog/': [
            {
              text: 'Blog',
              items: [
                { text: 'Why We’re Building Mukea', link: '/en/blog/' },
                { text: 'Mukea Look', link: '/en/blog/mukea-image' }
              ]
            }
          ]
        }
      }
    }
  }
})
