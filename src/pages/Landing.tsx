// src/pages/Landing.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Plus,
  Truck,
  Recycle,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  BatteryCharging,
  Cpu,
  Monitor,
  CheckCircle2,
  Clock,
  MapPin,
  Award,
  Leaf,
  FileCheck2,
} from 'lucide-react'
import { PrimaryPill, BrandPill, AccentPill, TileIconButton } from '../components/ui/Buttons'
import { SegmentedToggle } from '../components/ui/SegmentedToggle'
import { StepCircles } from '../components/ui/StepCircles'
import { PhoneMockup } from '../components/PhoneMockup'
import { isReducedMotion, initSmoothScroll } from '../lib/motion'

// Ensure plugin is registered
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const STEPS_DATA = [
  {
    id: 'step-1',
    number: '01',
    label: 'Account',
    title: 'Sign up in seconds',
    desc: 'Join as an eco-conscious household, enterprise generator, or certified collector. Immediate verified access without complex onboarding.',
  },
  {
    id: 'step-2',
    number: '02',
    label: 'Request',
    title: 'Log items & schedule pickup',
    desc: 'Catalog obsolete electronics, specify condition and quantities, and choose your preferred doorstep collection window.',
  },
  {
    id: 'step-3',
    number: '03',
    label: 'Collect',
    title: 'Verified routing & custody',
    desc: 'Licensed local collectors claim requests, provide real-time GPS tracking, and scan tamper-proof custody tags on handover.',
  },
  {
    id: 'step-4',
    number: '04',
    label: 'Recycle',
    title: 'Certified zero-landfill processing',
    desc: 'Downstream R2/e-Stewards partner facilities safely dismantle, decontaminate, and reclaim high-grade precious metals and raw polymers.',
  },
  {
    id: 'step-5',
    number: '05',
    label: 'Track',
    title: 'Auditable ESG chain & impact',
    desc: 'Get verifiable environmental impact certificates with exact metrics on CO₂ emissions avoided and landfill mass diverted.',
  },
]

export const Landing: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [businessToggle, setBusinessToggle] = useState('Households')

  // Refs for GSAP
  const containerRef = useRef<HTMLDivElement>(null)
  const kineticSectionRef = useRef<HTMLElement>(null)
  const kineticRow1Ref = useRef<HTMLDivElement>(null)
  const kineticRow2Ref = useRef<HTMLDivElement>(null)
  const kineticRow3Ref = useRef<HTMLDivElement>(null)

  const oneAppSectionRef = useRef<HTMLElement>(null)
  const oneAppHeadingRef = useRef<HTMLHeadingElement>(null)
  const oneAppPhoneRef = useRef<HTMLDivElement>(null)

  // Initialize smooth scrolling with Lenis
  useEffect(() => {
    const cleanupLenis = initSmoothScroll()
    return () => {
      if (cleanupLenis) {
        cleanupLenis()
      }
    }
  }, [])

  // GSAP ScrollTrigger Animations
  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = isReducedMotion()

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Desktop animations (> 768px)
      mm.add('(min-width: 769px)', () => {
        if (!reduced) {
          // --- SECTION 1: KINETIC WORDS ---
          // 250vh pinned scroll distance with staggered parallax compression
          const kineticTl = gsap.timeline({
            scrollTrigger: {
              trigger: kineticSectionRef.current,
              start: 'top top',
              end: '+=250%',
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
            },
          })

          // Rows start spread vertically and compress into tight stack
          kineticTl
            .fromTo(
              kineticRow1Ref.current,
              { y: -160, opacity: 0.8 },
              { y: 0, opacity: 1, ease: 'power2.out' },
              0
            )
            .fromTo(
              kineticRow3Ref.current,
              { y: 160, opacity: 0.8 },
              { y: 0, opacity: 1, ease: 'power2.out' },
              0
            )
            .to(
              [kineticRow1Ref.current, kineticRow2Ref.current, kineticRow3Ref.current],
              {
                letterSpacing: '-0.06em',
                ease: 'none',
              },
              0.5
            )

          // --- SECTION 2: ONE APP SCROLL STORY ---
          // 500vh pinned scroll (~100vh per step)
          // Initial phone reveal from below heading with motion blur
          const oneAppTl = gsap.timeline({
            scrollTrigger: {
              trigger: oneAppSectionRef.current,
              start: 'top top',
              end: '+=500%',
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              onUpdate: (self) => {
                // Determine active step (0 to 4) based on scroll progress
                const progress = self.progress
                const step = Math.min(4, Math.floor(progress * 5))
                setActiveStep(step)
              },
            },
          })

          // Phase A: "One App" heading fades out, phone moves up, sharpens and scales to center
          oneAppTl
            .fromTo(
              oneAppPhoneRef.current,
              {
                y: '35vh',
                scale: 0.65,
                filter: 'blur(14px)',
                rotationX: 18,
                rotationZ: -4,
              },
              {
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                rotationX: 0,
                rotationZ: 0,
                ease: 'power2.out',
                duration: 1.2,
              },
              0
            )
            .to(
              oneAppHeadingRef.current,
              {
                opacity: 0.15,
                y: -60,
                scale: 0.9,
                ease: 'power2.out',
                duration: 1,
              },
              0
            )

          // Phase B: Phone subtle floating / inspection tilt while scrolling through steps
          oneAppTl.to(
            oneAppPhoneRef.current,
            {
              y: '-2vh',
              ease: 'sine.inOut',
              duration: 3.8,
            },
            1.2
          )
        }
      })

      // Mobile setup (<= 768px): clean stacked sections without locking scroll
      mm.add('(max-width: 768px)', () => {
        // Subtle entrance fades
        gsap.from([kineticRow1Ref.current, kineticRow2Ref.current, kineticRow3Ref.current], {
          opacity: 0,
          y: 30,
          stagger: 0.15,
          duration: 0.8,
          scrollTrigger: {
            trigger: kineticSectionRef.current,
            start: 'top 80%',
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="landing-page-root"
      style={{
        backgroundColor: '#FFFFFF',
        color: '#0B0B14',
        overflowX: 'hidden',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* ─── 0. TOP HERO (Silent area choice: punchy intro) ─── */}
      <section
        className="top-hero-section"
        style={{
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 24px 80px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at 50% 20%, #E8EDFF 0%, #FFFFFF 65%)',
          position: 'relative',
        }}
      >
        {/* Subtle pill badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: 'var(--r-pill)',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(31, 75, 255, 0.08), 0 0 0 1px rgba(31, 75, 255, 0.12)',
            marginBottom: '28px',
          }}
        >
          <Sparkles size={16} color="#1F4BFF" />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#1F4BFF',
              letterSpacing: '-0.01em',
            }}
          >
            Zero landfill. 100% verified circularity.
          </span>
        </div>

        {/* Hero headline */}
        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            color: '#0B0B14',
            maxWidth: '920px',
            margin: '0 auto 20px',
          }}
        >
          The intelligent operating system for e-waste.
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 1.8vw, 20px)',
            color: '#6B6B7B',
            maxWidth: '640px',
            lineHeight: 1.5,
            margin: '0 auto 36px',
            fontWeight: 400,
          }}
        >
          Seamlessly connecting households and businesses with certified local collectors and
          licensed electronics recyclers.
        </p>

        {/* CTA Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <BrandPill size="lg" showArrow>
              Get started free
            </BrandPill>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <AccentPill size="lg">Sign in</AccentPill>
          </Link>
        </div>

        {/* Scroll down indicator */}
        <div
          style={{
            marginTop: '56px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: '#6B6B7B',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <span>Scroll to explore</span>
          <div
            style={{
              width: '18px',
              height: '30px',
              borderRadius: '12px',
              border: '2px solid rgba(11, 11, 20, 0.2)',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '6px',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '6px',
                background: '#1F4BFF',
                borderRadius: '2px',
                animation: 'bounce 1.6s infinite ease-in-out',
              }}
            />
          </div>
        </div>
      </section>

      {/* ─── 1. SECTION 1: KINETIC WORDS (White BG) ─── */}
      <section
        ref={kineticSectionRef}
        className="kinetic-words-section"
        style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(20px, 3.5vw, 44px)',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Row 1: Cantaloupe + Plus ("Request") */}
          <div
            ref={kineticRow1Ref}
            className="kinetic-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(16px, 3vw, 40px)',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <TileIconButton
              variant="cantaloupe"
              icon={<Plus size={44} strokeWidth={2.8} />}
              aria-label="Request pickup icon"
            />
            <span
              style={{
                fontSize: 'clamp(56px, 7.3vw, 150px)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: 0.9,
                color: '#FFA05A',
                userSelect: 'none',
              }}
            >
              Request
            </span>
          </div>

          {/* Row 2: Electric Blue + Truck ("Collect") */}
          <div
            ref={kineticRow2Ref}
            className="kinetic-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(16px, 3vw, 40px)',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <TileIconButton
              variant="blue"
              icon={<Truck size={44} strokeWidth={2.4} />}
              aria-label="Collect icon"
            />
            <span
              style={{
                fontSize: 'clamp(56px, 7.3vw, 150px)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: 0.9,
                color: '#1F4BFF',
                userSelect: 'none',
              }}
            >
              Collect
            </span>
          </div>

          {/* Row 3: Midnight Black + Recycle ("Recycle") */}
          <div
            ref={kineticRow3Ref}
            className="kinetic-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(16px, 3vw, 40px)',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <TileIconButton
              variant="midnight"
              icon={<Recycle size={44} strokeWidth={2.4} />}
              aria-label="Recycle icon"
            />
            <span
              style={{
                fontSize: 'clamp(56px, 7.3vw, 150px)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: 0.9,
                color: '#0B0B14',
                userSelect: 'none',
              }}
            >
              Recycle
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. SECTION 2: "ONE APP" SCROLL STORY (Electric Blue BG) ─── */}
      <section
        ref={oneAppSectionRef}
        className="one-app-section"
        style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#1F4BFF',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 32px 60px',
        }}
      >
        {/* Top Heading */}
        <h2
          ref={oneAppHeadingRef}
          style={{
            fontSize: 'clamp(64px, 10vw, 160px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: '#FFFFFF',
            textAlign: 'center',
            margin: '0 auto',
            zIndex: 10,
          }}
        >
          One App
        </h2>

        {/* Center / Right Phone Mockup with Motion Blur */}
        <div
          ref={oneAppPhoneRef}
          style={{
            zIndex: 20,
            margin: '20px auto',
            perspective: '1200px',
            transformOrigin: 'center center',
          }}
        >
          <PhoneMockup
            variant="light"
            style={{
              width: '330px',
              height: '660px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.4)',
            }}
          >
            {/* Dynamic Step Content inside phone */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '16px',
                gap: '12px',
                transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {activeStep === 0 && (
                /* 01 Account Screen */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6B6B7B', fontWeight: 600 }}>WELCOME BACK</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#0B0B14' }}>Sarah Connor</div>
                    </div>
                    <div
                      style={{
                        padding: '4px 10px',
                        background: '#E8EDFF',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#1F4BFF',
                      }}
                    >
                      Household
                    </div>
                  </div>

                  {/* Impact quick card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #15151F 0%, #0B0B14 100%)',
                      borderRadius: '16px',
                      padding: '16px',
                      color: '#FFFFFF',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#A0A0B0', marginBottom: '4px' }}>VERIFIED IMPACT</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFA05A' }}>34.2 kg</div>
                    <div style={{ fontSize: '12px', color: '#A0A0B0' }}>diverted from landfills this year</div>
                  </div>

                  {/* Action row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div
                      style={{
                        background: '#F5F6FA',
                        padding: '12px',
                        borderRadius: '14px',
                        textAlign: 'center',
                      }}
                    >
                      <Plus size={20} color="#1F4BFF" style={{ margin: '0 auto 4px' }} />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0B0B14' }}>New Pickup</div>
                    </div>
                    <div
                      style={{
                        background: '#F5F6FA',
                        padding: '12px',
                        borderRadius: '14px',
                        textAlign: 'center',
                      }}
                    >
                      <ShieldCheck size={20} color="#059669" style={{ margin: '0 auto 4px' }} />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0B0B14' }}>Certificate</div>
                    </div>
                  </div>

                  {/* Recent items list */}
                  <div style={{ marginTop: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#0B0B14' }}>
                      Recent pickups
                    </div>
                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#FFEBDB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFA05A',
                          }}
                        >
                          <Cpu size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#0B0B14' }}>MacBook Pro 15"</div>
                          <div style={{ fontSize: '10px', color: '#6B6B7B' }}>Completed • Nov 18</div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#059669',
                          fontWeight: 700,
                          background: '#ECFDF5',
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        Recycled
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                /* 02 Request Screen */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0B0B14' }}>Schedule Pickup</div>
                  <div style={{ fontSize: '11px', color: '#6B6B7B' }}>Select electronics to recycle:</div>

                  {/* Category tiles */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div
                      style={{
                        border: '2px solid #1F4BFF',
                        background: '#E8EDFF',
                        borderRadius: '12px',
                        padding: '10px',
                        textAlign: 'center',
                      }}
                    >
                      <Monitor size={22} color="#1F4BFF" style={{ margin: '0 auto 4px' }} />
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#1F4BFF' }}>Computers (2)</div>
                    </div>
                    <div
                      style={{
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '10px',
                        textAlign: 'center',
                      }}
                    >
                      <BatteryCharging size={22} color="#6B6B7B" style={{ margin: '0 auto 4px' }} />
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#0B0B14' }}>Batteries</div>
                    </div>
                  </div>

                  {/* Pickup slot selection */}
                  <div
                    style={{
                      background: '#F9FAFB',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B6B7B', marginBottom: '4px' }}>
                      PICKUP WINDOW
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                      <Clock size={14} color="#1F4BFF" />
                      Tomorrow, 10:00 AM – 2:00 PM
                    </div>
                  </div>

                  {/* Location field */}
                  <div
                    style={{
                      background: '#F9FAFB',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B6B7B', marginBottom: '4px' }}>
                      SERVICE ADDRESS
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                      <MapPin size={14} color="#FFA05A" />
                      742 Evergreen Terrace, Sector 4
                    </div>
                  </div>

                  <button
                    style={{
                      marginTop: '6px',
                      height: '40px',
                      borderRadius: '999px',
                      background: '#1F4BFF',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Confirm Request
                  </button>
                </div>
              )}

              {activeStep === 2 && (
                /* 03 Collect Screen */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div
                    style={{
                      background: '#E8EDFF',
                      borderRadius: '12px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Truck size={20} color="#1F4BFF" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1F4BFF' }}>Collector Dispatched</div>
                      <div style={{ fontSize: '10px', color: '#1F4BFF', opacity: 0.8 }}>Estimated arrival in 14 mins</div>
                    </div>
                  </div>

                  {/* Collector profile */}
                  <div
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: '14px',
                      padding: '12px',
                      background: '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#0B0B14',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                        }}
                      >
                        MC
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B0B14' }}>Marcus Chen</div>
                        <div style={{ fontSize: '11px', color: '#6B6B7B' }}>Verified Green Courier ★ 4.9</div>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          background: '#FFEBDB',
                          color: '#FFA05A',
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        EV Van #4
                      </span>
                    </div>
                  </div>

                  {/* Custody scan tag */}
                  <div
                    style={{
                      border: '2px dashed #059669',
                      borderRadius: '12px',
                      padding: '12px',
                      background: '#F0FDF4',
                      textAlign: 'center',
                    }}
                  >
                    <CheckCircle2 size={24} color="#059669" style={{ margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>Chain of Custody Active</div>
                    <div style={{ fontSize: '10px', color: '#059669' }}>Tag ID #ET-99482 scanned & signed</div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                /* 04 Recycle Screen */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0B0B14' }}>Facility Processing</div>
                  <div style={{ fontSize: '11px', color: '#6B6B7B' }}>EcoCycle Certified Refining Hub #8</div>

                  {/* Materials breakdown */}
                  <div
                    style={{
                      background: '#15151F',
                      borderRadius: '14px',
                      padding: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#A0A0B0', marginBottom: '8px' }}>
                      PRECIOUS MATERIALS RECLAIMED
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#FFFFFF' }}>Gold (Au)</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFA05A' }}>0.82 grams</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#FFFFFF' }}>Copper (Cu)</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1F4BFF' }}>4.20 kg</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#FFFFFF' }}>Rare Earths</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>1.15 kg</span>
                    </div>
                  </div>

                  {/* Zero Landfill Seal */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      background: '#ECFDF5',
                      borderRadius: '12px',
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    <ShieldCheck size={20} color="#059669" />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#065F46' }}>
                        100% Zero-Landfill Guarantee
                      </div>
                      <div style={{ fontSize: '9px', color: '#047857' }}>R2v3 & e-Stewards Compliant</div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                /* 05 Track Screen */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0B0B14' }}>Impact Certificate</div>
                  <div style={{ fontSize: '11px', color: '#6B6B7B' }}>Cryptographic environmental ledger</div>

                  <div
                    style={{
                      background: 'linear-gradient(135deg, #1F4BFF 0%, #1236C9 100%)',
                      borderRadius: '14px',
                      padding: '16px',
                      color: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  >
                    <Award size={32} color="#FFFFFF" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>148.5 kg CO₂e Saved</div>
                    <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
                      Equivalent to 620 miles driven in gasoline car
                    </div>
                  </div>

                  <div
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      background: '#F9FAFB',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B6B7B' }}>VERIFIED BLOCK HASH</div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#0B0B14',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      0x7b2f4c9a81e3d09a27b140...
                    </div>
                  </div>

                  <button
                    style={{
                      height: '38px',
                      borderRadius: '999px',
                      background: '#0B0B14',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileCheck2 size={14} /> Download ESG Certificate
                  </button>
                </div>
              )}
            </div>
          </PhoneMockup>
        </div>

        {/* Bottom Left Step Info & 01-05 Indicator */}
        <div
          style={{
            zIndex: 20,
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* 1px thin white line */}
          <div
            style={{
              width: '80px',
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
            }}
          />

          {/* Current step title & desc */}
          <div style={{ maxWidth: '520px' }}>
            <h3
              style={{
                fontSize: 'clamp(22px, 2.5vw, 32px)',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                marginBottom: '8px',
              }}
            >
              {STEPS_DATA[activeStep].title}
            </h3>
            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.82)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {STEPS_DATA[activeStep].desc}
            </p>
          </div>

          {/* 01-05 step indicator pills */}
          <StepCircles
            steps={STEPS_DATA}
            activeStep={activeStep}
            onSelectStep={(idx) => setActiveStep(idx)}
          />
        </div>
      </section>

      {/* ─── 3. SECTION 3: CLOSING HERO (Midnight Black BG) ─── */}
      <section
        className="closing-hero-section"
        style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#0B0B14',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px 32px',
        }}
      >
        {/* Animated Glowing Gradient Torus Background */}
        <div
          style={{
            position: 'absolute',
            right: '-10%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '720px',
            height: '720px',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.85,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background:
                'conic-gradient(from 0deg, #1F4BFF, #FFA05A, #1236C9, #FFEBDB, #1F4BFF)',
              filter: 'blur(65px)',
              animation: 'rotateTorus 22s linear infinite',
            }}
          />
        </div>

        {/* Content Container (Two Column Grid) */}
        <div
          style={{
            width: '100%',
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '56px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Left Column: Bold White Typography Overlapping */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              zIndex: 15,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--r-pill)',
                background: 'rgba(255, 255, 255, 0.08)',
                width: 'fit-content',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <Leaf size={14} color="#FFA05A" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFA05A' }}>
                Join 18,000+ generators
              </span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(44px, 5.5vw, 80px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                color: '#FFFFFF',
                margin: 0,
              }}
            >
              All your e-waste, handled in one app.
            </h2>

            <p
              style={{
                fontSize: 'clamp(16px, 1.8vw, 20px)',
                color: '#A0A0B0',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: 0,
              }}
            >
              Turn retired electronic assets into circular resources. From home doorstep pickups
              to industrial IT asset disposition, track the entire lifecycle with cryptographically
              signed proof.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                flexWrap: 'wrap',
                marginTop: '12px',
              }}
            >
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <PrimaryPill size="lg" showArrow>
                  Get started
                </PrimaryPill>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <AccentPill size="lg">Sign in</AccentPill>
              </Link>
            </div>
          </div>

          {/* Right Column: Phone Mockup with Households | Businesses Segmented Toggle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              position: 'relative',
            }}
          >
            <PhoneMockup
              variant="midnight"
              style={{
                width: '340px',
                height: '670px',
                backgroundColor: '#15151F',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
              screenStyle={{
                backgroundColor: '#0B0B14',
                color: '#FFFFFF',
              }}
            >
              {/* Top Segmented Toggle */}
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'center',
                  background: 'rgba(21, 21, 31, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <SegmentedToggle
                  options={['Households', 'Businesses']}
                  value={businessToggle}
                  onChange={setBusinessToggle}
                />
              </div>

              {/* Toggle-dependent Preview Cards */}
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  overflowY: 'auto',
                }}
              >
                {businessToggle === 'Households' ? (
                  <>
                    {/* Household Card 1 */}
                    <div
                      style={{
                        background: '#15151F',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: '#FFEBDB',
                            color: '#FFA05A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plus size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                            Free Doorstep Collection
                          </div>
                          <div style={{ fontSize: '11px', color: '#A0A0B0' }}>For phones, laptops, and wires</div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#A0A0B0',
                          lineHeight: 1.4,
                        }}
                      >
                        Schedule on-demand courier pickup at zero cost. Safe battery handling included.
                      </div>
                    </div>

                    {/* Household Card 2: Green Rewards */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(31,75,255,0.15) 0%, rgba(255,160,90,0.15) 100%)',
                        border: '1px solid rgba(31, 75, 255, 0.3)',
                        borderRadius: '16px',
                        padding: '16px',
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#FFA05A', marginBottom: '4px' }}>
                        REWARDS WALLET
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>480 Green Points</div>
                      <div style={{ fontSize: '11px', color: '#A0A0B0', marginTop: '4px' }}>
                        Redeemable for eco-store discounts & carbon offset credits.
                      </div>
                    </div>

                    {/* Household Card 3: Drop-off locator */}
                    <div
                      style={{
                        background: '#15151F',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={18} color="#1F4BFF" />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>
                            14 Smart Drop Kiosks
                          </div>
                          <div style={{ fontSize: '10px', color: '#A0A0B0' }}>Within 5 miles of your location</div>
                        </div>
                      </div>
                      <ChevronRight size={16} color="#A0A0B0" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Business Card 1: ITAD Solutions */}
                    <div
                      style={{
                        background: '#15151F',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: '#E8EDFF',
                            color: '#1F4BFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                            Enterprise IT Asset Disposition
                          </div>
                          <div style={{ fontSize: '11px', color: '#A0A0B0' }}>Palletized corporate bulk collection</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#A0A0B0', lineHeight: 1.4 }}>
                        Full serial-number asset ledger, tamper-evident security cages, and certified chain of custody.
                      </div>
                    </div>

                    {/* Business Card 2: Data Sanitization */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(31,75,255,0.2) 0%, rgba(5,150,105,0.15) 100%)',
                        border: '1px solid rgba(31, 75, 255, 0.3)',
                        borderRadius: '16px',
                        padding: '16px',
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#1F4BFF', marginBottom: '4px' }}>
                        NIST 800-88 SANITIZATION
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                        Auditable Data Destruction
                      </div>
                      <div style={{ fontSize: '11px', color: '#A0A0B0', marginTop: '4px' }}>
                        Degaussing, mechanical shredding, and instant downloadable compliance certificates.
                      </div>
                    </div>

                    {/* Business Card 3: ESG Scope 3 Dashboard */}
                    <div
                      style={{
                        background: '#15151F',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={18} color="#FFA05A" />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>
                            Automated Scope 3 GHG Reports
                          </div>
                          <div style={{ fontSize: '10px', color: '#A0A0B0' }}>Exportable for SEC & CSRD filings</div>
                        </div>
                      </div>
                      <ChevronRight size={16} color="#A0A0B0" />
                    </div>
                  </>
                )}
              </div>
            </PhoneMockup>
          </div>
        </div>
      </section>

      {/* ─── 4. FOOTER (Silent area choice: minimal dark) ─── */}
      <footer
        style={{
          backgroundColor: '#0B0B14',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '48px 32px 120px', // Extra bottom padding for floating PillNav
          color: '#A0A0B0',
          fontSize: '13px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
            }}
          >
            {/* Wordmark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#1F4BFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Recycle size={18} />
              </div>
              <div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>EcoTrack</span>
                <span style={{ fontSize: '11px', color: '#6B6B7B', marginLeft: '8px' }}>
                  Next-Gen E-Waste Platform
                </span>
              </div>
            </div>

            {/* Status Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                color: '#34D399',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
              Systems normal (v2.4)
            </div>
          </div>

          {/* Links & Copyright */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '24px',
              fontSize: '12px',
            }}
          >
            <div>© 2026 EcoTrack Systems Inc. All rights reserved. Zero landfill commitment.</div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <Link to="/login" style={{ color: '#A0A0B0', textDecoration: 'none' }}>
                Sign in
              </Link>
              <Link to="/register" style={{ color: '#A0A0B0', textDecoration: 'none' }}>
                Register
              </Link>
              <span style={{ cursor: 'pointer', color: '#6B6B7B' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer', color: '#6B6B7B' }}>Terms of Service</span>
              <span style={{ cursor: 'pointer', color: '#6B6B7B' }}>ESG Documentation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
