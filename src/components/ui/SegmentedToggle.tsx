// src/components/ui/SegmentedToggle.tsx
import React from 'react'

export interface SegmentedToggleProps {
  options: [string, string]
  value: string
  onChange: (val: string) => void
  className?: string
}

export const SegmentedToggle: React.FC<SegmentedToggleProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 bg-white/90 backdrop-blur-md rounded-[999px] shadow-sm border border-black/5 ${className}`}
      style={{
        borderRadius: 'var(--r-pill)',
        padding: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        display: 'inline-flex',
        alignItems: 'center',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
      }}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isActive = value === opt
        return (
          <button
            key={opt}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt)}
            className="px-5 py-2 text-sm font-semibold rounded-[999px] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] select-none"
            style={{
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: 'var(--r-pill)',
              backgroundColor: isActive ? 'var(--electric-blue)' : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--midnight)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isActive ? '0 2px 8px rgba(31, 75, 255, 0.35)' : 'none',
              transition: 'all var(--dur-fast) var(--ease)',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

