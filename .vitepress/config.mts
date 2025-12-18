import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Mukea",
  
  // 共享的主题配置
  themeConfig: {
    logo: '/mukea-logo.png', // 记得放图片
  },

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
          { text: '关于', link: '/about' }
        ],
        // 这里可以配置中文侧边栏等
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
          { text: 'About', link: '/en/about' }
        ],
        // 这里可以配置英文侧边栏等
      }
    }
  }
})
