// src/components/HelpFab.tsx
import React, { useState } from 'react'
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react'

export const HelpFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', query: 'pickup', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setIsOpen(false)
      setFormData({ name: '', email: '', query: 'pickup', message: '' })
    }, 2200)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close help chat' : 'Open help chat'}
          className="group rounded-full flex items-center justify-center transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-108 active:scale-96"
          style={{
            width: 'clamp(56px, 4.5vw, 80px)',
            height: 'clamp(56px, 4.5vw, 80px)',
            backgroundColor: '#FFA05A',
            color: '#0B0B14',
            boxShadow: isOpen
              ? '0 8px 30px rgba(255, 160, 90, 0.6)'
              : '0 8px 25px rgba(255, 160, 90, 0.45)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isOpen ? (
            <X size={26} className="text-[#0B0B14]" />
          ) : (
            <MessageSquare size={26} className="text-[#0B0B14]" />
          )}
        </button>
      </div>

      {/* Popover Help Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="EcoTrack Help and Inquiries"
          className="fixed bottom-28 right-6 z-50 w-[360px] max-w-[calc(100vw-32px)] p-6 rounded-[24px] shadow-2xl border border-black/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: 'var(--r-card)',
            boxShadow: '0 24px 60px rgba(11, 11, 20, 0.18)',
            color: '#0B0B14',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div>
              <h3 className="text-lg font-bold text-[#0B0B14]">EcoTrack Support</h3>
              <p className="text-xs text-[#6B6B7B]">Fast assistance for pickups & recycling</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B6B7B] hover:text-[#0B0B14] hover:bg-black/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
              <CheckCircle2 size={44} className="text-[#1F4BFF]" />
              <div className="font-bold text-[#0B0B14] text-base">Message Sent!</div>
              <p className="text-xs text-[#6B6B7B]">
                Our local dispatch team will respond within 15 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B0B14] mb-1">Your Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-[14px] bg-[#E8EDFF]/60 border border-transparent focus:border-[#1F4BFF] focus:bg-white focus:outline-none transition-all"
                  style={{ borderRadius: 'var(--r-input)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B0B14] mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-[14px] bg-[#E8EDFF]/60 border border-transparent focus:border-[#1F4BFF] focus:bg-white focus:outline-none transition-all"
                  style={{ borderRadius: 'var(--r-input)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B0B14] mb-1">How can we help?</label>
                <select
                  value={formData.query}
                  onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-[14px] bg-[#E8EDFF]/60 border border-transparent focus:border-[#1F4BFF] focus:bg-white focus:outline-none transition-all"
                  style={{ borderRadius: 'var(--r-input)' }}
                >
                  <option value="pickup">Schedule bulk e-waste pickup</option>
                  <option value="collector">Collector partner inquiry</option>
                  <option value="recycling">Recycling certs & compliance</option>
                  <option value="other">General question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B0B14] mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your device types or address..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-[14px] bg-[#E8EDFF]/60 border border-transparent focus:border-[#1F4BFF] focus:bg-white focus:outline-none transition-all resize-none"
                  style={{ borderRadius: 'var(--r-input)' }}
                />
              </div>

              <button
                type="submit"
                className="mt-1 w-full py-2.5 px-4 rounded-[999px] bg-[#1F4BFF] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1236C9] transition-all shadow-md active:scale-98"
                style={{ borderRadius: 'var(--r-pill)' }}
              >
                <span>Send Message</span>
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  )
}

