// src/lib/motion.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// Register ScrollTrigger plugin once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

let lenisInstance: Lenis | null = null

export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function initSmoothScroll(): (() => void) | undefined {
  if (typeof window === 'undefined') return

  if (isReducedMotion()) {
    // Under reduced motion, do not initialize Lenis
    return
  }

  // Set up Lenis smooth scrolling
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  })
  lenisInstance = lenis

  // Sync with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update)

  const updateTicker = (time: number) => {
    lenis.raf(time * 1000)
  }

  gsap.ticker.add(updateTicker)
  gsap.ticker.lagSmoothing(0)

  // Clean up
  return () => {
    gsap.ticker.remove(updateTicker)
    lenis.destroy()
    lenisInstance = null
  }
}

export { gsap, ScrollTrigger, lenisInstance }

