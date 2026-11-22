/* eslint-disable react-refresh/only-export-components */
// src/lib/toast.tsx
// Lightweight inline toast system – no external dependency.
// Rendered via createPortal to document.body.

import React, { createContext, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'

type ToastKind = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

export interface ToastContextValue {
  show: (message: string, kind?: ToastKind) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
})

let _counter = 0

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++_counter
    setToasts((prev) => [...prev, { id, message, kind }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((msg: string) => show(msg, 'success'), [show])
  const error = useCallback((msg: string) => show(msg, 'error'), [show])
  const warning = useCallback((msg: string) => show(msg, 'warning'), [show])
  const info = useCallback((msg: string) => show(msg, 'info'), [show])

  const kindStyle: Record<ToastKind, React.CSSProperties> = {
    success: { background: '#059669', color: '#fff' },
    error: { background: '#DC2626', color: '#fff' },
    warning: { background: '#FFA05A', color: '#0B0B14' },
    info: { background: '#1F4BFF', color: '#fff' },
  }

  const portal = createPortal(
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          style={{
            pointerEvents: 'auto',
            padding: '12px 20px',
            borderRadius: '999px',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '-0.01em',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            cursor: 'pointer',
            userSelect: 'none',
            animation: 'toastIn 0.22s cubic-bezier(0.22,1,0.36,1)',
            ...kindStyle[t.kind],
          }}
        >
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes toastIn { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>
    </div>,
    document.body,
  )

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      {typeof document !== 'undefined' ? portal : null}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}
