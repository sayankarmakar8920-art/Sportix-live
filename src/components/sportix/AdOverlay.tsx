'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Megaphone } from 'lucide-react'

interface AdOverlayProps {
  ad: {
    id: string
    mediaUrl: string
    targetUrl?: string
    title: string
    duration?: number
  } | null
  onClose: () => void
  onAdClick?: (adId: string, targetUrl: string) => void
}

async function trackAdEvent(adId: string, eventType: 'impression' | 'click' | 'close') {
  try {
    await fetch('/api/ads/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, eventType }),
    })
  } catch {
    // Silent fail for ad tracking
  }
}

const overlayVariants = {
  initial: {
    opacity: 0,
    y: -40,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

export default function AdOverlay({ ad, onClose, onAdClick }: AdOverlayProps) {
  const [imgError, setImgError] = useState(false)
  const [tick, setTick] = useState(0)
  const startTimeRef = useRef<number>(0)
  const impressionTrackedRef = useRef<Set<string>>(new Set())
  const closedRef = useRef(false)

  const duration = ad?.duration ?? 10

  // Reset start time and track impression when ad changes
  useEffect(() => {
    if (!ad) return
    startTimeRef.current = Date.now()
    closedRef.current = false

    if (!impressionTrackedRef.current.has(ad.id)) {
      impressionTrackedRef.current.add(ad.id)
      trackAdEvent(ad.id, 'impression')
    }

    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [ad])

  // Compute countdown from elapsed time
  const countdown = ad ? Math.max(0, duration - Math.floor((Date.now() - startTimeRef.current) / 1000)) : 0
  const canClose = ad !== null && countdown <= 0

  // Auto-close when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && ad && !closedRef.current) {
      closedRef.current = true
      const timer = setTimeout(() => {
        trackAdEvent(ad.id, 'close')
        onClose()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [countdown, ad, onClose])

  function handleClose() {
    if (ad) {
      trackAdEvent(ad.id, 'close')
    }
    closedRef.current = true
    onClose()
  }

  function handleClick() {
    if (!ad?.targetUrl) return
    trackAdEvent(ad.id, 'click')
    onAdClick?.(ad.id, ad.targetUrl)
    window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {ad && (
        <motion.div
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={canClose ? handleClose : undefined}
          />

          {/* Ad Content Card */}
          <motion.div
            className="relative z-10 mx-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08]"
            style={{
              background: 'rgba(10, 14, 26, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Sponsored Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1">
              <Megaphone className="h-3 w-3 text-[#00ff88]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                Sponsored
              </span>
            </div>

            {/* Close Button with Countdown */}
            <div className="absolute top-3 right-3 z-20">
              {canClose ? (
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white/70 transition-all hover:bg-black/70 hover:text-white"
                  aria-label="Close advertisement"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex h-8 items-center gap-2 rounded-lg bg-black/50 px-3">
                  <span className="text-xs font-medium text-white/50">
                    {countdown}s
                  </span>
                </div>
              )}
            </div>

            {/* Ad Image / Content */}
            <button
              type="button"
              onClick={handleClick}
              className="relative block w-full cursor-pointer"
              style={{ background: 'transparent' }}
            >
              {ad.mediaUrl && !imgError ? (
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={ad.mediaUrl}
                    alt={ad.title || 'Advertisement'}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

                  {/* Title overlay at bottom */}
                  {ad.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-sm font-semibold text-white drop-shadow-lg">
                        {ad.title}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Text-only fallback */
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00ff88]/10 ring-1 ring-[#00ff88]/20">
                    <Megaphone className="h-8 w-8 text-[#00ff88]" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-white">
                      {ad.title || 'Advertisement'}
                    </p>
                    {ad.targetUrl && (
                      <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#00ff88]/70">
                        <ExternalLink className="h-3 w-3" />
                        <span>Click to learn more</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </button>

            {/* Bottom bar */}
            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                <span className="text-[11px] text-white/30">Advertisement</span>
              </div>

              {ad.targetUrl && (
                <button
                  type="button"
                  onClick={handleClick}
                  className="flex items-center gap-1.5 rounded-lg bg-[#00ff88]/10 px-3 py-1.5 text-xs font-medium text-[#00ff88] transition-all hover:bg-[#00ff88]/20"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Visit</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
