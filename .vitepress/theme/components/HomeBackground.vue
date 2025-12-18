<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)
let animationId = null

// 配置：颜色和运动速度
const colors = [
  { r: 255, g: 60, b: 137 }, // 粉色 #ff3c89
  { r: 255, g: 155, b: 94 }, // 橙色 #ff9b5e
  { r: 65, g: 88, b: 208 }   // 蓝紫 #4158D0
]

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  let width, height
  let time = 0

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
      
      const c = colors[this.index % colors.length]
      // 核心：颜色透明度渐变
      gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.4)`)
      gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`)

      ctx.globalCompositeOperation = 'screen' // 混合模式：滤色（让重叠部分变亮）
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  let particles = []

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

  window.addEventListener('resize', resize)
  resize()
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <canvas ref="canvasRef" class="mukea-canvas-bg"></canvas>
</template>

<style scoped>
.mukea-canvas-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -99; /* 放在最底层 */
  pointer-events: none; /* 鼠标穿透 */
  opacity: 0.6; /* 整体透明度调节 */
}
</style>
