// src/components/ui/TabPills.tsx
import React from 'react'

export interface TabPillsProps {
  tabs: string[]
  activeTab: string
  onChange: (tab: string) => void
  className?: string
}

export const TabPills: React.FC<TabPillsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 bg-[#E8EDFF] rounded-[999px] ${className}`}
      style={{
        borderRadius: 'var(--r-pill)',
        padding: '4px',
        backgroundColor: 'var(--blue-tint)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className="px-4 py-1.5 text-xs md:text-sm font-semibold rounded-[999px] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] select-none"
            style={{
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: 'var(--r-pill)',
              backgroundColor: isActive ? '#FFFFFF' : 'transparent',
              color: isActive ? 'var(--midnight)' : 'var(--muted-text)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isActive ? '0 2px 6px rgba(11, 11, 20, 0.08)' : 'none',
              transition: 'all var(--dur-fast) var(--ease)',
            }}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}

