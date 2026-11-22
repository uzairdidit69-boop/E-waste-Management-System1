// src/components/PhoneMockup.tsx
import React from 'react'

export interface PhoneMockupProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  screenStyle?: React.CSSProperties
  variant?: 'midnight' | 'light' | 'blue'
  showDynamicIsland?: boolean
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  className = '',
  style = {},
  screenStyle = {},
  variant = 'midnight',
  showDynamicIsland = true,
}) => {
  const isLight = variant === 'light'

  return (
    <div
      className={`phone-mockup-wrapper relative select-none ${className}`}
      style={{
        width: '320px',
        maxWidth: '90vw',
        height: '650px',
        borderRadius: '50px',
        background: isLight ? '#E5E7EB' : '#15151F',
        padding: '11px',
        boxShadow:
          '0 25px 70px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 0 0 2px rgba(255, 255, 255, 0.08)',
        position: 'relative',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {/* Side buttons accents */}
      <div
        style={{
          position: 'absolute',
          left: '-3px',
          top: '115px',
          width: '3px',
          height: '28px',
          background: isLight ? '#9CA3AF' : '#2A2A38',
          borderRadius: '2px 0 0 2px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '-3px',
          top: '155px',
          width: '3px',
          height: '45px',
          background: isLight ? '#9CA3AF' : '#2A2A38',
          borderRadius: '2px 0 0 2px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '-3px',
          top: '210px',
          width: '3px',
          height: '45px',
          background: isLight ? '#9CA3AF' : '#2A2A38',
          borderRadius: '2px 0 0 2px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '-3px',
          top: '160px',
          width: '3px',
          height: '65px',
          background: isLight ? '#9CA3AF' : '#2A2A38',
          borderRadius: '0 2px 2px 0',
        }}
      />

      {/* Screen container */}
      <div
        className="phone-mockup-screen"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '40px',
          overflow: 'hidden',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          color: '#0B0B14',
          boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)',
          ...screenStyle,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: '42px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            fontSize: '12px',
            fontWeight: 600,
            zIndex: 30,
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          <span>9:41</span>

          {/* Dynamic Island – single dark pill, no coloured dots */}
          {showDynamicIsland && (
            <div
              style={{
                width: '80px',
                height: '22px',
                background: '#0B0B14',
                borderRadius: '14px',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: '9px',
              }}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {/* Cellular */}
            <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor">
              <rect x="0" y="9" width="3" height="3" rx="0.5" />
              <rect x="4" y="6" width="3" height="6" rx="0.5" />
              <rect x="8" y="3" width="3" height="9" rx="0.5" />
              <rect x="12" y="0" width="3" height="12" rx="0.5" />
            </svg>
            {/* Wifi */}
            <svg width="13" height="10" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4.2-3.2a6 6 0 0 1 8.4 0 .7.7 0 0 1-.9 1 4.6 4.6 0 0 0-6.6 0 .7.7 0 0 1-.9-1zm-2.8-2.8a10 10 0 0 1 14 0 .7.7 0 0 1-.9 1 8.6 8.6 0 0 0-12.2 0 .7.7 0 0 1-.9-1z" />
            </svg>
            {/* Battery */}
            <div
              style={{
                width: '18px',
                height: '9px',
                border: '1px solid currentColor',
                borderRadius: '2.5px',
                padding: '1px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '80%',
                  height: '100%',
                  background: 'currentColor',
                  borderRadius: '1px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Screen inner content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {children}
        </div>

        {/* Home indicator bar */}
        <div
          style={{
            height: '20px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            zIndex: 30,
          }}
        >
          <div
            style={{
              width: '100px',
              height: '4px',
              background: '#0B0B14',
              borderRadius: '2px',
              opacity: 0.3,
            }}
          />
        </div>
      </div>
    </div>
  )
}

