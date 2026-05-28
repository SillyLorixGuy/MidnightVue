<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'

interface Star {
  x: number
  y: number
  size: number
  delay: number
  duration: number
  peak: number
  depth: number
  phaseX: number
  phaseY: number
  speedX: number
  speedY: number
  ampX: number
  ampY: number
}

const props = withDefaults(
  defineProps<{
    count?: number
    seed?: number
    repelRadius?: number
    repelStrength?: number
  }>(),
  {
    count: 200,
    seed: 0,
    repelRadius: 130,
    repelStrength: 22,
  },
)

function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const stars = computed<Star[]>(() => {
  const rng = props.seed > 0 ? makeRng(props.seed) : Math.random
  const out: Star[] = []
  for (let i = 0; i < props.count; i++) {
    out.push({
      x: rng() * 100,
      y: rng() * 100,
      size: 1 + rng() * 1.8,
      delay: rng() * 12,
      duration: 7 + rng() * 9,
      peak: 0.35 + rng() * 0.5,
      depth: rng(),
      phaseX: rng() * Math.PI * 2,
      phaseY: rng() * Math.PI * 2,
      speedX: 0.18 + rng() * 0.28,
      speedY: 0.18 + rng() * 0.28,
      ampX: 5 + rng() * 9,
      ampY: 5 + rng() * 9,
    })
  }
  return out
})

const starsRef = useTemplateRef<HTMLDivElement>('starsLayer')

const LERP = 0.14
let rafId = 0
let running = false
let mx = -9999
let my = -9999
let anchors: { x: number; y: number }[] = []
let drift: { dx: number; dy: number; tx: number; ty: number }[] = []

function computeAnchors() {
  const w = window.innerWidth
  const h = window.innerHeight
  anchors = stars.value.map((s) => ({ x: (s.x / 100) * w, y: (s.y / 100) * h }))
  while (drift.length < anchors.length) {
    drift.push({ dx: 0, dy: 0, tx: 0, ty: 0 })
  }
  drift.length = anchors.length
}

function onMove(e: MouseEvent) {
  mx = e.clientX
  my = e.clientY
  start()
}

function onLeave() {
  mx = -9999
  my = -9999
  start()
}

function start() {
  if (running) return
  running = true
  rafId = requestAnimationFrame(tick)
}

function tick() {
  const starsLayer = starsRef.value
  if (!starsLayer) {
    running = false
    return
  }
  const els = starsLayer.children as HTMLCollectionOf<HTMLElement>
  const r = props.repelRadius
  const strength = props.repelStrength
  const t = performance.now() / 1000
  const arr = stars.value
  for (let i = 0; i < arr.length; i++) {
    const a = anchors[i]
    const cur = drift[i]
    const s = arr[i]
    if (!a || !cur) continue
    const ax = a.x - mx
    const ay = a.y - my
    const d = Math.hypot(ax, ay)
    let tx = 0
    let ty = 0
    if (d < r) {
      const f = 1 - d / r
      const n = d || 1
      const mag = f * strength * s.depth
      tx = (ax / n) * mag
      ty = (ay / n) * mag
    }
    cur.tx = tx
    cur.ty = ty
    cur.dx += (tx - cur.dx) * LERP
    cur.dy += (ty - cur.dy) * LERP
    const ambX = Math.sin(t * s.speedX + s.phaseX) * s.ampX
    const ambY = Math.cos(t * s.speedY + s.phaseY) * s.ampY
    const el = els[i]
    if (el) {
      el.style.setProperty('--sf-dx', `${(cur.dx + ambX).toFixed(2)}px`)
      el.style.setProperty('--sf-dy', `${(cur.dy + ambY).toFixed(2)}px`)
    }
  }
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  computeAnchors()
  if (reduced) return
  start()
  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mouseleave', onLeave)
  window.addEventListener('blur', onLeave)
  window.addEventListener('resize', computeAnchors)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseleave', onLeave)
  window.removeEventListener('blur', onLeave)
  window.removeEventListener('resize', computeAnchors)
})
</script>

<template>
  <div class="starfield" aria-hidden="true">
    <div ref="starsLayer" class="starfield__stars">
      <span
        v-for="(s, i) in stars"
        :key="i"
        class="starfield__star starfield__star--pulse"
        :style="{
          '--sf-x': `${s.x}vw`,
          '--sf-y': `${s.y}vh`,
          '--sf-size': `${s.size}px`,
          '--sf-delay': `${s.delay}s`,
          '--sf-duration': `${s.duration}s`,
          '--sf-peak': s.peak,
          '--sf-depth': s.depth,
        }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.starfield {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;

  &__stars {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__star {
    position: absolute;
    left: var(--sf-x);
    top: var(--sf-y);
    width: var(--sf-size);
    height: var(--sf-size);
    border-radius: 50%;
    background: $color-text;
    box-shadow: 0 0 calc(var(--sf-size) * 2.5) rgba(255, 255, 255, 0.35);
    opacity: 0;
    will-change: opacity, transform;
  }

  &__star--pulse {
    animation: starfield-pulse var(--sf-duration) ease-in-out var(--sf-delay)
      infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &__star {
      animation: none;
      opacity: calc(var(--sf-peak) * 0.4);
    }
  }
}

@keyframes starfield-pulse {
  0%,
  100% {
    opacity: 0;
    transform: translate(var(--sf-dx, 0px), var(--sf-dy, 0px)) scale(0.6);
  }
  35%,
  65% {
    opacity: var(--sf-peak);
    transform: translate(var(--sf-dx, 0px), var(--sf-dy, 0px)) scale(1);
  }
}
</style>
