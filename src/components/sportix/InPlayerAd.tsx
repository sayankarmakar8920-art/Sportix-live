'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Megaphone, Clock, Volume2, VolumeX } from 'lucide-react'

interface InPlayerAdProps {
  ad: {
    id: string
    title: string
    mediaUrl: string
    targetUrl?: string
    duration: number
    skipAfter: number
  }
  phase: 'pre-roll' | 'mid-roll' | 'post-roll'
  onComplete: () => void
  onSkip?: () => void
}

async function trackAdEvent(adId: string, eventType: string) {
  try {
    await fetch('/api/ads/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, eventType }),
    })
  } catch { /* silent */ }
}

const PHASE_LABELS: Record<string, string> = {
  'pre-roll': 'Video will begin shortly',
  'mid-roll': 'Short break',
  'post-roll': 'Thanks for watching',
}

export default function InPlayerAd({ ad, phase, onComplete, onSkip }: InPlayerAdProps) {
  const [tick, setTick] = useState(0)
  const [canSkip, setCanSkip] = useState(false)
  const [muted, setMuted] = useState(true)
  const [imgError, setImgError] = useState(false)
  const [done, setDone] = useState(false)
  const startTimeRef = useRef(Date.now())
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null)
  const impressionTracked = useRef(false)
  const completedRef = useRef(false)

  const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(ad.mediaUrl)

  useEffect(() => {
    if (impressionTracked.current) return
    impressionTracked.current = true
    trackAdEvent(ad.id, 'impression')
  }, [ad.id])

  useEffect(() => {
    startTimeRef.current = Date.now()
    setCanSkip(false)
    setDone(false)
    completedRef.current = false

    skipTimerRef.current = setTimeout(() => {
      setCanSkip(true)
    }, (ad.skipAfter || 5) * 1000)

    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => {
      clearInterval(timer)
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current)
    }
  }, [ad.id, ad.skipAfter])

  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
  const countdown = Math.max(0, (ad.duration || 8) - elapsed)
  const skipCountdown = Math.max(0, (ad.skipAfter || 5) - elapsed)
  const progress = (ad.duration || 8) > 0 ? Math.min((elapsed / (ad.duration || 8)) * 100, 100) : 0

  // Auto-complete
  useEffect(() => {
    if (countdown <= 0 && !completedRef.current) {
      completedRef.current = true
      trackAdEvent(ad.id, 'complete')
      const timer = setTimeout(() => {
        setDone(true)
        onComplete()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [countdown, ad.id, onComplete])

  function handleSkip() {
    if (!canSkip || completedRef.current) return
    completedRef.current = true
    trackAdEvent(ad.id, 'skip')
    setDone(true)
    onSkip?.()
    onComplete()
  }

  function handleClick() {
    if (!ad.targetUrl) return
    trackAdEvent(ad.id, 'click')
    window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
  }

  if (done) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-30 flex flex-col"
      style={{ background: '#000' }}
    >
      {/* Media */}
      <div className="relative flex-1 overflow-hidden">
        {isVideo ? (
          <video
            autoPlay
            muted={muted}
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={ad.mediaUrl} type={ad.mediaUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          </video>
        ) : !imgError ? (
          <img
            src={ad.mediaUrl}
            alt={ad.title || 'Advertisement'}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : null}

        {/* Fallback / overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
        {imgError && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#141414] to-[#1a2235]" />
        )}

        {/* Mute toggle for video ads */}
        {isVideo && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMuted(!muted) }}
            className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Sponsored badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1 backdrop-blur-sm">
          <Megaphone className="h-3 w-3 text-[#E50914]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
            {phase === 'pre-roll' ? 'Ad' : phase === 'mid-roll' ? 'Ad Break' : 'Sponsored'}
          </span>
        </div>

        {/* Center content */}
        {ad.title && !isVideo && (
          <button
            type="button"
            onClick={handleClick}
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
          >
            <div className="text-center px-6">
              <p className="text-lg sm:text-xl font-bold text-white drop-shadow-lg mb-2">{ad.title}</p>
              {ad.targetUrl && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#E50914]/90 px-4 py-2 text-xs font-semibold text-white">
                  <ExternalLink className="h-3 w-3" />
                  Learn More
                </div>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Bottom controls bar */}
      <div className="relative z-20 border-t border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-sm">
        {/* Progress bar */}
        <div className="h-[2px] bg-white/5">
          <div
            className="h-full bg-[#E50914] transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          {/* Left: phase label + countdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#E50914]" />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Ad</span>
            </div>
            <span className="text-[11px] text-white/30 hidden sm:inline">
              {PHASE_LABELS[phase] || 'Advertisement'}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-white/50">
              <Clock className="h-3 w-3" />
              <span>{countdown}s</span>
            </div>
          </div>

          {/* Right: Skip / Close */}
          {canSkip ? (
            <motion.button
              type="button"
              onClick={handleSkip}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/15 active:scale-[0.97]"
            >
              Skip Ad <span className="text-white/40">»</span>
            </motion.button>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-white/25">
              Skip in <span className="font-mono text-white/40">{skipCountdown}</span>s
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
