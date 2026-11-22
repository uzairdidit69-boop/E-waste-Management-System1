// src/components/ui/Button.tsx
// Unified button component (replaces ad-hoc buttons everywhere).
// 100% inline styles – no Tailwind dependency.

import React, { useRef } from 'react'
import { haptics } from '../../lib/haptics'

type Variant = 'primary' | 'brand' | 'accent' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  showArrow?: boolean
}

const BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  borderRadius: '999px',
  border: 'none',
  fontFamily: 'inherit',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  cursor: 'pointer',
  userSelect: 'none',
  position: 'relative',
  overflow: 'hidden',
  textDecoration: 'none',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  // Focus ring handled via CSS class pill-btn-focus
  outline: 'none',
}

const SIZE: Record<Size, React.CSSProperties> = {
  sm: { height: '36px', padding: '0 16px', fontSize: '13px', minWidth: '44px' },
  md: { height: '44px', padding: '0 22px', fontSize: '15px', minWidth: '44px' },
  lg: { height: '52px', padding: '0 30px', fontSize: '17px', minWidth: '44px' },
}

const VARIANT: Record<Variant, React.CSSProperties> = {
  primary: { background: '#1F4BFF', color: '#FFFFFF' },
  brand: { background: '#1F4BFF', color: '#FFFFFF' },
  accent: { background: '#FFA05A', color: '#0B0B14' },
  ghost: {
    background: 'transparent',
    color: '#0B0B14',
    border: '1px solid rgba(11,11,20,0.14)',
  },
  danger: {
    background: 'transparent',
    color: '#DC2626',
    border: '1px solid rgba(220,38,38,0.25)',
  },
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: 'currentColor',
        display: 'inline-block',
        animation: 'btnSpin 0.65s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      showArrow = false,
      disabled,
      children,
      style,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      ...rest
    },
    ref,
  ) => {
    const btnRef = useRef<HTMLButtonElement>(null)
    const combinedRef = (node: HTMLButtonElement | null) => {
      (btnRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
    }

    const press = () => {
      if (!btnRef.current) return
      btnRef.current.style.transform = 'scale(0.96)'
      btnRef.current.style.transition = 'transform 80ms cubic-bezier(0.34,1.56,0.64,1)'
    }
    const release = () => {
      if (!btnRef.current) return
      btnRef.current.style.transform = 'scale(1)'
      btnRef.current.style.transition = 'transform 160ms cubic-bezier(0.34,1.56,0.64,1)'
    }

    const isDisabled = disabled || loading

    return (
      <>
        <style>{`
          @keyframes btnSpin { to { transform: rotate(360deg); } }
          .pill-btn:focus-visible {
            outline: 2px solid #FFA05A;
            outline-offset: 2px;
          }
          @media (hover: hover) {
            .pill-btn-primary:hover { background: #1236C9 !important; }
            .pill-btn-brand:hover   { background: #1236C9 !important; }
            .pill-btn-accent:hover  { background: #ff9142 !important; }
            .pill-btn-ghost:hover   { background: #F5F6FA !important; }
            .pill-btn-danger:hover  { background: #FEE2E2 !important; }
          }
          .pill-btn { will-change: transform; }
        `}</style>
        <button
          ref={combinedRef}
          className={`pill-btn pill-btn-${variant}`}
          disabled={isDisabled}
          aria-busy={loading}
          style={{
            ...BASE,
            ...SIZE[size],
            ...VARIANT[variant],
            opacity: isDisabled && !loading ? 0.5 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            transition: 'background 160ms, transform 160ms cubic-bezier(0.34,1.56,0.64,1)',
            ...style,
          }}
          onPointerDown={(e) => {
            if (!isDisabled) { haptics.tap(); press() }
            onPointerDown?.(e)
          }}
          onPointerUp={(e) => { release(); onPointerUp?.(e) }}
          onPointerLeave={(e) => { release(); onPointerLeave?.(e) }}
          onPointerCancel={(e) => { release(); onPointerCancel?.(e) }}
          {...rest}
        >
          {loading && <Spinner />}
          {children}
          {showArrow && !loading && (
            <span aria-hidden="true" style={{ marginLeft: '2px', opacity: 0.75 }}>→</span>
          )}
        </button>
      </>
    )
  },
)
Button.displayName = 'Button'

