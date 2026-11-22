// src/components/ui/StepCircles.tsx
import React from 'react'

export interface StepItem {
  id: string
  number: string
  label: string
}

export interface StepCirclesProps {
  steps: StepItem[]
  activeStep: number // 0-indexed
  onSelectStep?: (index: number) => void
  className?: string
}

export const StepCircles: React.FC<StepCirclesProps> = ({
  steps,
  activeStep,
  onSelectStep,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {steps.map((step, idx) => {
        const isActive = idx === activeStep
        const isPast = idx < activeStep

        return (
          <button
            key={step.id}
            onClick={() => onSelectStep && onSelectStep(idx)}
            className="transition-all duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-center cursor-pointer"
            style={{
              height: '32px',
              minWidth: isActive ? 'auto' : '32px',
              padding: isActive ? '0 16px 0 10px' : '0',
              borderRadius: 'var(--r-pill)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              opacity: isActive || isPast ? 1 : 0.4,
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              transition: 'all var(--dur) var(--ease)',
            }}
            aria-label={`Step ${step.number}: ${step.label}`}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                fontSize: '11px',
                fontWeight: 700,
                opacity: isActive ? 1 : 0.9,
              }}
            >
              {step.number}
            </span>
            {isActive && (
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                  animation: 'fadeIn 250ms ease-out',
                }}
              >
                {step.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

