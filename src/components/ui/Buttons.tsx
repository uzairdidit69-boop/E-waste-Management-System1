// src/components/ui/Buttons.tsx
import React from 'react'
import { ArrowRight } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  showArrow?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const baseStyles = `
  inline-flex items-center justify-center gap-2 font-semibold select-none
  transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]
  rounded-[999px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
  active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-[#FFA05A] focus-visible:ring-offset-2
`

const sizeStyles = {
  sm: 'h-[38px] px-5 text-sm',
  md: 'h-[46px] px-6 text-base',
  lg: 'h-[52px] px-8 text-lg',
}

// 1. Primary pill: white background, Midnight text (on blue/dark sections)
export const PrimaryPill: React.FC<ButtonProps> = ({
  children,
  showArrow = false,
  className = '',
  size = 'md',
  ...props
}) => {
  return (
    <button
      className={`group ${baseStyles} ${sizeStyles[size]} bg-white text-[#0B0B14] hover:bg-[#F0F2F8] hover:-translate-y-[1px] shadow-sm ${className}`}
      style={{
        height: size === 'lg' ? '52px' : size === 'sm' ? '38px' : '46px',
        borderRadius: 'var(--r-pill)',
        fontWeight: 600,
        backgroundColor: '#FFFFFF',
        color: '#0B0B14',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: size === 'lg' ? '0 32px' : size === 'sm' ? '0 20px' : '0 24px',
        fontSize: size === 'lg' ? '18px' : size === 'sm' ? '14px' : '16px',
        transition: 'all var(--dur-fast) var(--ease)',
        cursor: 'pointer',
      }}
      {...props}
    >
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          size={18}
          className="transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[3px]"
          style={{ transition: 'transform var(--dur-fast) var(--ease)' }}
        />
      )}
    </button>
  )
}

// 2. Brand pill: Electric Blue background, white text (on white sections)
export const BrandPill: React.FC<ButtonProps> = ({
  children,
  showArrow = false,
  className = '',
  size = 'md',
  ...props
}) => {
  return (
    <button
      className={`group ${baseStyles} ${sizeStyles[size]} bg-[#1F4BFF] text-white hover:bg-[#1236C9] hover:-translate-y-[1px] shadow-md ${className}`}
      style={{
        height: size === 'lg' ? '52px' : size === 'sm' ? '38px' : '46px',
        borderRadius: 'var(--r-pill)',
        fontWeight: 600,
        backgroundColor: '#1F4BFF',
        color: '#FFFFFF',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: size === 'lg' ? '0 32px' : size === 'sm' ? '0 20px' : '0 24px',
        fontSize: size === 'lg' ? '18px' : size === 'sm' ? '14px' : '16px',
        transition: 'all var(--dur-fast) var(--ease)',
        cursor: 'pointer',
      }}
      {...props}
    >
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          size={18}
          className="transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[3px]"
          style={{ transition: 'transform var(--dur-fast) var(--ease)' }}
        />
      )}
    </button>
  )
}

// 3. Accent pill: Cantaloupe background, Midnight text
export const AccentPill: React.FC<ButtonProps> = ({
  children,
  showArrow = false,
  className = '',
  size = 'md',
  ...props
}) => {
  return (
    <button
      className={`group ${baseStyles} ${sizeStyles[size]} bg-[#FFA05A] text-[#0B0B14] hover:bg-[#ff9142] hover:-translate-y-[1px] shadow-sm ${className}`}
      style={{
        height: size === 'lg' ? '52px' : size === 'sm' ? '38px' : '46px',
        borderRadius: 'var(--r-pill)',
        fontWeight: 600,
        backgroundColor: '#FFA05A',
        color: '#0B0B14',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: size === 'lg' ? '0 32px' : size === 'sm' ? '0 20px' : '0 24px',
        fontSize: size === 'lg' ? '18px' : size === 'sm' ? '14px' : '16px',
        transition: 'all var(--dur-fast) var(--ease)',
        cursor: 'pointer',
      }}
      {...props}
    >
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          size={18}
          className="transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[3px]"
          style={{ transition: 'transform var(--dur-fast) var(--ease)' }}
        />
      )}
    </button>
  )
}

// 4. Ghost pill: 1px border (white at 40%), transparent, white text
export const GhostPill: React.FC<ButtonProps> = ({
  children,
  showArrow = false,
  className = '',
  size = 'md',
  ...props
}) => {
  return (
    <button
      className={`group ${baseStyles} ${sizeStyles[size]} bg-transparent text-white border border-white/40 hover:bg-white/10 hover:-translate-y-[1px] ${className}`}
      style={{
        height: size === 'lg' ? '52px' : size === 'sm' ? '38px' : '46px',
        borderRadius: 'var(--r-pill)',
        fontWeight: 600,
        backgroundColor: 'transparent',
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: size === 'lg' ? '0 32px' : size === 'sm' ? '0 20px' : '0 24px',
        fontSize: size === 'lg' ? '18px' : size === 'sm' ? '14px' : '16px',
        transition: 'all var(--dur-fast) var(--ease)',
        cursor: 'pointer',
      }}
      {...props}
    >
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          size={18}
          className="transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[3px]"
          style={{ transition: 'transform var(--dur-fast) var(--ease)' }}
        />
      )}
    </button>
  )
}

// 7A. Round icon button (44px)
export interface RoundIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  size?: number
  bg?: string
  color?: string
  ariaLabel: string
}

export const RoundIconButton: React.FC<RoundIconProps> = ({
  icon,
  size = 44,
  bg = 'rgba(255, 255, 255, 0.12)',
  color = '#FFFFFF',
  ariaLabel,
  className = '',
  ...props
}) => {
  return (
    <button
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-full transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-95 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: bg,
        color: color,
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all var(--dur-fast) var(--ease)',
      }}
      {...props}
    >
      {icon}
    </button>
  )
}

// 7B. Rounded-square icon tile (used in Kinetic words and app headers)
export interface TileIconProps {
  icon: React.ReactNode
  variant?: 'cantaloupe' | 'blue' | 'midnight'
  bg?: string
  color?: string
  size?: string | number
  className?: string
  'aria-label'?: string
}

export const TileIconButton: React.FC<TileIconProps> = ({
  icon,
  variant,
  bg,
  color,
  size = 'clamp(48px, 6vw, 110px)',
  className = '',
  'aria-label': ariaLabel,
}) => {
  let resolvedBg = bg || '#1F4BFF'
  let resolvedColor = color || '#FFFFFF'

  if (variant === 'cantaloupe') {
    resolvedBg = '#FFA05A'
    resolvedColor = '#0B0B14' // Contrast rule: Midnight on Cantaloupe
  } else if (variant === 'blue') {
    resolvedBg = '#1F4BFF'
    resolvedColor = '#FFFFFF'
  } else if (variant === 'midnight') {
    resolvedBg = '#0B0B14'
    resolvedColor = '#FFFFFF'
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center select-none shadow-sm ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        borderRadius: 'var(--r-tile)',
        backgroundColor: resolvedBg,
        color: resolvedColor,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  )
}
