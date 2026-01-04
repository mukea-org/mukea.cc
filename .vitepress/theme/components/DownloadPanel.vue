<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, h, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'

type Locale = 'zh' | 'en'
type BubbleKey = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'web' | 'wechatOA'

type ApiResponse = {
  ok: boolean
  data?: {
    current?: {
      version?: string
      code?: string
      notes?: string
    }
    downloads?: {
      windows?: { filename: string; url: string; available: boolean } | null
      macos?: { filename: string; url: string; available: boolean } | null
      linux?: { filename: string; url: string; available: boolean } | null
    }
  }
}

const props = defineProps<{
  locale?: Locale
}>()

const { lang } = useData()
const locale = computed<Locale>(() => {
  if (props.locale) return props.locale
  return (lang.value || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
})

const t = computed(() => {
  const isZh = locale.value === 'zh'
  return {
    brand: 'Mukea',
    slogan: isZh ? '不说话，也懂你' : 'Silence, yet I Understand.',
    version: isZh ? '版本' : 'Version',
    code: isZh ? '代号' : 'Codename',
    notes: isZh ? '更新说明' : 'Notes',
    loading: isZh ? '正在获取最新版本信息…' : 'Fetching latest release info…',
    failed: isZh ? '获取失败，请稍后重试。' : 'Failed to load. Please try again.',
    retry: isZh ? '重试' : 'Retry',
    download: isZh ? '下载' : 'Download',
    comingSoon: isZh ? '建设中' : 'Coming soon',
    comingSoonWith: isZh ? (name: string) => `${name} 建设中` : (name: string) => `${name} is coming soon`,
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    android: isZh ? '安卓' : 'Android',
    ios: isZh ? '苹果' : 'Apple',
    web: isZh ? '网页' : 'Web',
    wechatOA: isZh ? '微信公众号' : 'WeChat OA'
  }
})

const apiUrl = 'https://api.mukea.cc/api/app-version'
const cacheKey = 'mukea:app-version:cache:v1'
const cacheTtlMs = 10 * 60 * 1000

const state = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref<string>('')
const payload = ref<ApiResponse['data'] | null>(null)
const activeKey = ref<BubbleKey>('web')

const current = computed(() => payload.value?.current)
const downloads = computed(() => payload.value?.downloads)

function detectActiveKey(): BubbleKey {
  if (typeof navigator === 'undefined') return 'web'
  const ua = navigator.userAgent || ''
  if (/micromessenger/i.test(ua)) return 'wechatOA'
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/windows/i.test(ua)) return 'windows'
  if (/macintosh|mac os x/i.test(ua)) return 'macos'
  if (/linux/i.test(ua)) return 'linux'
  return 'web'
}

const windowsExe = computed(() => {
  const d = downloads.value?.windows
  if (!d?.available) return null
  if (!/\.exe$/i.test(d.filename)) return null
  return d
})

const macosDmg = computed(() => {
  const d = downloads.value?.macos
  if (!d?.available) return null
  if (!/\.dmg$/i.test(d.filename)) return null
  return d
})

const IconWindows = {
  render() {
    return h(
      'svg',
      { viewBox: '0 0 24 24', class: 'icon', 'aria-hidden': 'true' },
      [
        h('path', { d: 'M3 4.5h8.5V12H3V4.5Zm9.5 0H21V12h-8.5V4.5ZM3 13h8.5v6.5H3V13Zm9.5 0H21v6.5h-8.5V13Z', fill: 'currentColor' })
      ]
    )
  }
}

const IconLaptop = {
  render() {
    return h(
      'svg',
      { viewBox: '0 0 24 24', class: 'icon', 'aria-hidden': 'true' },
      [
        h('path', { d: 'M7 5h10a2 2 0 0 1 2 2v8H5V7a2 2 0 0 1 2-2Z', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7' }),
        h('path', { d: 'M3.5 17h17', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round' })
      ]
    )
  }
}

const IconTerminal = {
  render() {
    return h(
      'svg',
      { viewBox: '0 0 24 24', class: 'icon', 'aria-hidden': 'true' },
      [
        h('path', { d: 'M5.5 6.5h13A2.5 2.5 0 0 1 21 9v6a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 15V9a2.5 2.5 0 0 1 2.5-2.5Z', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7' }),
        h('path', { d: 'M7 10l2 2-2 2', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
        h('path', { d: 'M11 14h3.5', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round' })
      ]
    )
  }
}

const IconAndroid = {
  render() {
    return h(
      'svg',
      { viewBox: '0 0 24 24', class: 'icon', 'aria-hidden': 'true' },
      [
        h('path', { d: 'M8 8.5a4 4 0 0 1 8 0V10H8V8.5Z', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7' }),
        h('path', { d: 'M7 10h10v6.5A2.5 2.5 0 0 1 14.5 19h-5A2.5 2.5 0 0 1 7 16.5V10Z', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7' }),
        h('path', { d: 'M9 6.3 7.8 5.1', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round' }),
        h('path', { d: 'M15 6.3 16.2 5.1', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round' })
      ]
    )
  }
}

const IconPhone = {
  render() {
    return h(
      'svg',
      { viewBox: '0 0 24 24', class: 'icon', 'aria-hidden': 'true' },
      [
        h('path', { d: 'M8 4.5h8A2.5 2.5 0 0 1 18.5 7v10A2.5 2.5 0 0 1 16 19.5H8A2.5 2.5 0 0 1 5.5 17V7A2.5 2.5 0 0 1 8 4.5Z', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7' }),
        h('path', { d: 'M10 17h4', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round' })
      ]
    )
  }
}

const IconGlobe = {
  render() {
    return h(
      'svg',
      { viewBox: '0 0 24 24', class: 'icon', 'aria-hidden': 'true' },
      [
        h('path', { d: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7' }),
        h('path', { d: 'M3.7 12h16.6', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round' }),
        h('path', { d: 'M12 3.5c2.2 2.2 3.6 5.3 3.6 8.5S14.2 18.8 12 20.5c-2.2-1.7-3.6-5.3-3.6-8.5S9.8 5.7 12 3.5Z', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linejoin': 'round' })
      ]
    )
  }
}

const IconWechat = {
  render() {
    return h(
      'svg',
      { viewBox: '0 0 24 24', class: 'icon', 'aria-hidden': 'true' },
      [
        h('path', { d: 'M8.5 18.5c-3.3 0-6-2.1-6-4.8S5.2 9 8.5 9c3.3 0 6 2.1 6 4.7s-2.7 4.8-6 4.8Z', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7' }),
        h('path', { d: 'M9 18.3 6.8 19.5l.6-2.1', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
        h('path', { d: 'M15.5 16.5c3 0 5.5-1.8 5.5-4.1s-2.5-4.1-5.5-4.1c-3 0-5.5 1.8-5.5 4.1', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round' })
      ]
    )
  }
}

const bubbles = computed(() => {
  const list: Array<{
    key: BubbleKey
    title: string
    url?: string
    disabled: boolean
    active: boolean
    status?: string
    icon: any
  }> = [
      {
        key: 'windows',
        title: t.value.windows,
        icon: IconWindows,
        url: windowsExe.value?.url,
        disabled: !windowsExe.value,
        active: activeKey.value === 'windows' && !!windowsExe.value
      },
      {
        key: 'macos',
        title: t.value.macos,
        icon: IconLaptop,
        url: macosDmg.value?.url,
        disabled: !macosDmg.value,
        active: activeKey.value === 'macos' && !!macosDmg.value
      },
      {
        key: 'ios',
        title: t.value.ios,
        icon: IconPhone,
        disabled: true,
        active: activeKey.value === 'ios',
        status: t.value.comingSoon
      },
      {
        key: 'linux',
        title: t.value.linux,
        disabled: true,
        status: t.value.comingSoon,
        icon: IconTerminal,
        active: activeKey.value === 'linux'
      },
      {
        key: 'android',
        title: t.value.android,
        icon: IconAndroid,
        disabled: true,
        status: t.value.comingSoon,
        active: activeKey.value === 'android'
      },
      {
        key: 'web',
        title: t.value.web,
        disabled: true,
        status: t.value.comingSoon,
        icon: IconGlobe,
        active: activeKey.value === 'web'
      },
      {
        key: 'wechatOA',
        title: t.value.wechatOA,
        disabled: true,
        status: t.value.comingSoon,
        icon: IconWechat,
        active: activeKey.value === 'wechatOA'
      }
    ]

  return list
})

const primaryBubbles = computed(() =>
  bubbles.value.filter((b) => b.key !== 'web' && b.key !== 'wechatOA')
)

const secondaryBubbles = computed(() =>
  bubbles.value.filter((b) => b.key === 'web' || b.key === 'wechatOA')
)

function readCache() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { at: number; data: ApiResponse['data'] }
    if (!parsed?.at || !parsed?.data) return null
    if (Date.now() - parsed.at > cacheTtlMs) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(data: ApiResponse['data']) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data }))
  } catch {
    // ignore
  }
}

async function load({ force }: { force?: boolean } = {}) {
  if (!force) {
    const cached = readCache()
    if (cached) {
      payload.value = cached
      state.value = 'ready'
      return
    }
  }

  state.value = 'loading'
  errorMessage.value = ''
  payload.value = null
  try {
    const response = await fetch(apiUrl, { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = (await response.json()) as ApiResponse
    if (!json?.ok) throw new Error('API not ok')
    payload.value = json.data || null
    writeCache(payload.value)
    state.value = 'ready'
  } catch (error) {
    state.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
}

onMounted(() => {
  activeKey.value = detectActiveKey()
  load()
})

function onComingSoonClick(name: string) {
  toast(t.value.comingSoonWith(name))
}
</script>

<template>
  <section class="dl">
    <div class="center">
      <div class="top">
        <div class="brand">
          <img class="logo" src="/favicon.ico" alt="Mukea" />
          <div class="name">{{ t.brand }}</div>
        </div>
        <button v-if="state === 'error'" class="retry" @click="load({ force: true })">
          {{ t.retry }}
        </button>
      </div>

      <div class="slogan">{{ t.slogan }}</div>

      <div class="meta">
        <div v-if="state === 'loading'" class="meta-line muted">{{ t.loading }}</div>
        <div v-else-if="state === 'error'" class="meta-line error">
          {{ t.failed }}
          <span class="mono">{{ errorMessage }}</span>
        </div>
        <template v-else>
          <div class="meta-line">
            <span class="k">{{ t.version }}</span>
            <span class="v mono">v{{ current?.version || '-' }}</span>
            <span v-if="current?.code" class="dot">·</span>
            <span v-if="current?.code" class="v">{{ current?.code }}</span>
          </div>
          <div v-if="current?.notes" class="notes">{{ current?.notes }}</div>
        </template>
      </div>

      <div class="bubbles" :class="{ disabled: state !== 'ready' }">
        <component :is="item.disabled ? 'button' : 'a'" v-for="item in primaryBubbles" :key="item.key" class="bubble"
          :class="{ active: item.active, disabled: item.disabled }" :href="item.disabled ? undefined : item.url"
          target="_blank" rel="noreferrer" :aria-disabled="item.disabled ? 'true' : 'false'"
          :title="item.disabled ? t.comingSoon : t.download" :type="item.disabled ? 'button' : undefined"
          @click="item.disabled ? onComingSoonClick(item.title) : undefined">
          <component :is="item.icon" class="icon" />
          <div class="label">{{ item.title }}</div>
        </component>
      </div>

      <div class="bubbles secondary" :class="{ disabled: state !== 'ready' }">
        <component :is="item.disabled ? 'button' : 'a'" v-for="item in secondaryBubbles" :key="item.key" class="bubble"
          :class="{ active: item.active, disabled: item.disabled }" :href="item.disabled ? undefined : item.url"
          target="_blank" rel="noreferrer" :aria-disabled="item.disabled ? 'true' : 'false'"
          :title="item.disabled ? t.comingSoon : t.download" :type="item.disabled ? 'button' : undefined"
          @click="item.disabled ? onComingSoonClick(item.title) : undefined">
          <component :is="item.icon" class="icon" />
          <div class="label">{{ item.title }}</div>
        </component>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dl {
  position: fixed;
  top: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px));
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  width: 100vw;
  padding: 22px 16px;
  z-index: 0;
}

:global(.dark) .dl {
  background: var(--vp-c-bg);
}

.center {
  max-width: 920px;
  height: 100%;
  margin: 0 auto;
  text-align: center;
  color: var(--vp-c-text-1);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 48px;
  height: 48px;
  border-radius: 100px;
}

.name {
  font-weight: 900;
  font-size: clamp(32px, 2.4vw, 42px);
  letter-spacing: 0.2px;
  color: var(--vp-c-brand-1);
}

.retry {
  position: absolute;
  right: 0;
  top: 0;
  appearance: none;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-weight: 900;
  font-size: 12px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.slogan {
  margin-top: 18px;
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 950;
  letter-spacing: -0.3px;
  line-height: 1.12;
}

.meta {
  margin-top: 14px;
  display: grid;
  gap: 10px;
  justify-items: center;
}

.meta-line {
  display: inline-flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 800;
}

.k {
  opacity: 0.7;
}

.v {
  font-weight: 950;
}

.dot {
  opacity: 0.6;
}

.notes {
  max-width: 760px;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.muted {
  opacity: 0.9;
}

.error {
  color: color-mix(in oklab, var(--vp-c-danger-1) 65%, currentColor);
}

.mono {
  font-family: var(--vp-font-family-mono);
}

.bubbles {
  margin-top: 18px;
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

.bubbles.secondary {
  margin-top: 12px;
}

.bubbles.disabled {
  opacity: 0.7;
  pointer-events: none;
}

.bubble {
  appearance: none;
  font: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--vp-c-bg) 70%, var(--vp-c-bg-soft));
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  color: inherit;
  user-select: none;
  transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.bubble:hover {
  transform: translateY(-2px);
  background: color-mix(in oklab, var(--vp-c-bg) 55%, var(--vp-c-bg-soft));
  border-color: color-mix(in oklab, var(--vp-c-brand-1) 35%, var(--vp-c-divider));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.10);
}

.bubble.active {
  background: linear-gradient(180deg,
      color-mix(in oklab, var(--vp-c-brand-1) 88%, #fff),
      color-mix(in oklab, var(--vp-c-brand-1) 78%, var(--vp-c-bg)));
  border-color: color-mix(in oklab, var(--vp-c-brand-1) 82%, var(--vp-c-divider));
  color: #0f172a;
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--vp-c-brand-1) 55%, transparent),
    0 14px 40px color-mix(in oklab, var(--vp-c-brand-1) 22%, transparent);
}

.bubble.active .label {
  letter-spacing: 0.2px;
}

.bubble.active:hover {
  transform: translateY(-3px);
}

.bubble.disabled {
  opacity: 0.8;
}

:global(.dark) .logo {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 10px 28px rgba(0, 0, 0, 0.35);
}

:global(.dark) .bubble:hover {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06),
    0 16px 44px rgba(0, 0, 0, 0.35);
}

:global(.dark) .bubble.active {
  color: #0b1220;
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--vp-c-brand-1) 55%, transparent),
    0 0 22px color-mix(in oklab, var(--vp-c-brand-1) 35%, transparent),
    0 0 46px color-mix(in oklab, var(--vp-c-brand-1) 18%, transparent);
}

.bubble:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--mukea-primary) 70%, #000);
  outline-offset: 3px;
}

.icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.label {
  font-weight: 950;
  font-size: 13px;
}
</style>
