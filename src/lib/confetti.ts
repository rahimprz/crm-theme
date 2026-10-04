import confetti from 'canvas-confetti'
import { reducedMotion } from './gsap'

function themeColors() {
  const css = getComputedStyle(document.documentElement)
  return ['--primary', '--accent', '--c3', '--c5', '--fg'].map((v) => css.getPropertyValue(v).trim()).filter(Boolean)
}

/** Confetti in the current theme's colors. `origin` is in viewport pixels. */
export function celebrate(origin?: { x: number; y: number }) {
  if (reducedMotion()) return
  const colors = themeColors()
  const o = origin
    ? { x: origin.x / window.innerWidth, y: origin.y / window.innerHeight }
    : { x: 0.5, y: 0.55 }
  const base = { colors, ticks: 240, zIndex: 300, disableForReducedMotion: true, scalar: 0.95 }
  confetti({ ...base, particleCount: 80, spread: 70, startVelocity: 42, origin: o })
  setTimeout(() => confetti({ ...base, particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } }), 160)
  setTimeout(() => confetti({ ...base, particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } }), 280)
}

/** A small burst of particles, used when a task is completed. */
export function sparkle(origin: { x: number; y: number }) {
  if (reducedMotion()) return
  confetti({
    particleCount: 18,
    spread: 360,
    startVelocity: 14,
    gravity: 0.6,
    ticks: 80,
    scalar: 0.6,
    shapes: ['circle'],
    colors: themeColors().slice(0, 3),
    origin: { x: origin.x / window.innerWidth, y: origin.y / window.innerHeight },
    zIndex: 300,
    disableForReducedMotion: true,
  })
}
