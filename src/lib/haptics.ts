// src/lib/haptics.ts
// ─────────────────────────────────────────────────────────────
// HONEST NOTE: Haptics only work on physical mobile devices.
//   • Android / Chrome: navigator.vibrate() – widely supported.
//   • iOS Safari: navigator.vibrate() is NOT supported. We use a
//     hidden <input type="checkbox" switch> trick as best-effort.
//     Apple may ignore it or only honour it on iPhone 7+.
//   • Desktop: all calls are silent no-ops. The visual press
//     animation (scale + spring ease) is the feedback on desktop.
//
// Rules:
//   • Only call inside user-gesture handlers (pointerdown / click).
//   • Never call on scroll, timers, or in useEffect without gesture.
//   • Enabled by default only on coarse-pointer devices (touchscreens)
//     and only when prefers-reduced-motion is not set.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'eco_haptics'

function isCoarse(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}

function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isEnabled(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === '1'
  } catch {
    // localStorage blocked (private mode, etc.)
  }
  return isCoarse() && !isReducedMotion()
}

export function setHapticsEnabled(val: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, val ? '1' : '0')
  } catch {
    // ignore
  }
}

export function getHapticsEnabled(): boolean {
  return isEnabled()
}

// ── iOS hidden checkbox trick ───────────────────────────────
let _iosLabel: HTMLLabelElement | null = null

function getIosLabel(): HTMLLabelElement | null {
  if (typeof document === 'undefined') return null
  if (_iosLabel) return _iosLabel
  try {
    const label = document.createElement('label')
    label.setAttribute('aria-hidden', 'true')
    label.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;'
    const input = document.createElement('input')
    input.type = 'checkbox'
    // "switch" type is an iOS Safari extension for the taptic engine
    input.setAttribute('switch', '')
    input.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;'
    label.appendChild(input)
    document.body.appendChild(label)
    _iosLabel = label
  } catch {
    _iosLabel = null
  }
  return _iosLabel
}

function vibrateIos(): void {
  try {
    const label = getIosLabel()
    label?.click()
  } catch {
    // unsupported – silent no-op
  }
}

function vibrateAndroid(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    } else {
      vibrateIos()
    }
  } catch {
    // silent no-op
  }
}

function fire(pattern: number | number[]): void {
  if (typeof window === 'undefined') return
  if (!isEnabled()) return
  vibrateAndroid(pattern)
}

export const haptics = {
  /** Light tap: nav open/close, button press. ~10ms. */
  tap: () => fire(10),

  /** Select / toggle feedback. ~8ms. */
  select: () => fire(8),

  /** Form / action success. */
  success: () => fire([12, 40, 12]),

  /** Moderate warning before destructive action. */
  warning: () => fire([20, 30, 20]),

  /** Error / failure. */
  error: () => fire([30, 40, 30, 40, 30]),
}

