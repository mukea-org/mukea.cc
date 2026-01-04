<script setup>
import { useData, useRoute } from 'vitepress'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const canvasRef = ref(null)
let animationId = null

const { isDark } = useData()
const route = useRoute()
const isEnabled = computed(() => {
  const raw = route.path || ''
  const path = raw.replace(/\.html$/, '')
  return (
    path === '/' ||
    path === '/en/' ||
    path === '/download' ||
    path === '/download/' ||
    path === '/en/download' ||
    path === '/en/download/'
  )
})

const shouldRender = computed(() => isEnabled.value && !isDark.value)

const isDownloadPage = computed(() => {
  const raw = route.path || ''
  const path = raw.replace(/\.html$/, '')
  return path === '/download' || path === '/download/' || path === '/en/download' || path === '/en/download/'
})

// 配置：颜色和运动速度
const colors = [
  { r: 177, g: 219, b: 235 }, // #B1DBEB
  { r: 191, g: 217, b: 233 }, // #BFD9E9
  { r: 137, g: 178, b: 205 } // #89B2CD
]

let stop = () => {}

onMounted(() => {
  let canvas = null
  let ctx = null
  let width, height
  let time = 0
  let particles = []
  let running = false

  // 粒子（光斑）类
  class Particle {
    constructor(index) {
      this.index = index
      this.x = Math.random() * width
      this.y = Math.random() * height
      // 随机运动参数
      this.vx = (Math.random() - 0.5) * 0.5 
      this.vy = (Math.random() - 0.5) * 0.5
      this.radius = Math.max(width, height) * 0.6 // 光斑巨大
    }

    update() {
      // 简单的正弦波运动，制造呼吸感
      this.x += Math.sin(time * 0.001 + this.index) * 0.5
      this.y += Math.cos(time * 0.002 + this.index) * 0.5
      
      // 边界检查（虽然光斑很大看不出来，但防止跑太远）
    }

    draw() {
      // 创建径向渐变
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      )
      
      const alpha = 0.4
      const c = colors[this.index % colors.length]
      // 核心：颜色透明度渐变
      gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`)
      gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`)

      ctx.globalCompositeOperation = 'screen' // 混合模式：滤色（让重叠部分变亮）
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const resize = () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
    // 初始化3个大光斑
    particles = [new Particle(0), new Particle(1), new Particle(2)]
  }

  const animate = () => {
    time += 1
    ctx.clearRect(0, 0, width, height)
    
    // 绘制背景底色（深色模式下稍微给点底色，防止全黑）
    // 通过 CSS 控制 Canvas 的背景色，这里只画光斑
    
    particles.forEach(p => {
      p.update()
      p.draw()
    })

    animationId = requestAnimationFrame(animate)
  }

  const start = async () => {
    if (running) return
    await nextTick()
    canvas = canvasRef.value
    if (!canvas) return
    ctx = canvas.getContext('2d')
    if (!ctx) return
    running = true
    window.addEventListener('resize', resize)
    resize()
    animate()
  }

  stop = () => {
    if (!running) return
    running = false
    window.removeEventListener('resize', resize)
    cancelAnimationFrame(animationId)
    animationId = null
  }

  watch(
    shouldRender,
    (value) => {
      if (value) start()
      else stop()
    },
    { immediate: true }
  )

  watch(
    isDownloadPage,
    (value) => {
      if (typeof document === 'undefined') return
      document.documentElement.classList.toggle('mukea-nav-transparent', value)
    },
    { immediate: true }
  )
})

onUnmounted(() => {
  stop()
})
</script>

<template>
  <canvas v-if="shouldRender" ref="canvasRef" class="mukea-bg-canvas"></canvas>
</template>

<style scoped>
.mukea-bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -99;
  pointer-events: none;
  opacity: 0.6; 
}

</style>
