'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Megaphone, Clock, Eye } from 'lucide-react'

interface PreRollAdProps {
  ads: any[]
  onComplete: () => void
  streamId?: string
  onSkip?: () => void
}

const SKIP_AFTER_SECONDS = 5

async function trackAdEvent(adId: string, eventType: 'impression' | 'click' | 'complete' | 'skip', streamId?: string) {
  try {
    await fetch('/api/ads/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, eventType, streamId }),
    })
  } catch {
    // Silent fail for ad tracking
  }
}

const adTransitionVariants = {
  initial: {
    opacity: 0,
    scale: 1.02,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.4,
      ease: 'easeIn',
    },
  },
}

export default function PreRollAd({ ads, onComplete, streamId, onSkip }: PreRollAdProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [tick, setTick] = useState(0)
  const [canSkip, setCanSkip] = useState(false)
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set())
  const [isDone, setIsDone] = useState(false)

  const adStartTimeRef = useRef<number>(0)
  const globalStartTimeRef = useRef<number>(0)
  const impressionTrackedRef = useRef<Set<string>>(new Set())
  const completedRef = useRef(false)
  const transitioningRef = useRef(false)

  const validAds = Array.isArray(ads) && ads.length > 0 ? ads : []
  const currentAd = validAds[currentAdIndex] || null
  const adDuration = currentAd?.duration || 8
  const isFirstAd = currentAdIndex === 0
  const isLastAd = currentAdIndex >= validAds.length - 1

  // Compute total duration from ads (static computation)
  const totalDuration = validAds.reduce((sum, ad) => sum + (ad.duration || 8), 0)

  // Initialize timers on mount
  useEffect(() => {
    if (validAds.length === 0) {
      onComplete()
      return
    }

    globalStartTimeRef.current = Date.now()
    adStartTimeRef.current = Date.now()

    // Track first impression
    const firstAd = validAds[0]
    if (firstAd && !impressionTrackedRef.current.has(firstAd.id)) {
      impressionTrackedRef.current.add(firstAd.id)
      trackAdEvent(firstAd.id, 'impression', streamId)
    }

    // Tick interval for countdown display
    const tickTimer = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)

    // Skip availability timer
    const skipTimer = setTimeout(() => {
      setCanSkip(true)
    }, SKIP_AFTER_SECONDS * 1000)

    return () => {
      clearInterval(tickTimer)
      clearTimeout(skipTimer)
    }
  }, [])

  // Compute countdown from elapsed time
  const elapsedForCurrentAd = Math.floor((Date.now() - adStartTimeRef.current) / 1000)
  const countdown = Math.max(0, adDuration - elapsedForCurrentAd)

  // Overall progress
  const elapsedAdsDuration = validAds
    .slice(0, currentAdIndex)
    .reduce((sum, ad) => sum + (ad.duration || 8), 0)
  const totalElapsed = elapsedAdsDuration + elapsedForCurrentAd
  const overallProgress = totalDuration > 0
    ? Math.min((totalElapsed / totalDuration) * 100, 100)
    : 0

  // Handle ad completion — advance to next ad or finish
  useEffect(() => {
    if (countdown > 0 || !currentAd || completedRef.current || transitioningRef.current) return

    if (isLastAd) {
      completedRef.current = true
      trackAdEvent(currentAd.id, 'complete', streamId)
      const timer = setTimeout(() => {
        setIsDone(true)
        onComplete()
      }, 600)
      return () => clearTimeout(timer)
    }

    // Move to next ad
    transitioningRef.current = true
    trackAdEvent(currentAd.id, 'complete', streamId)

    const timer = setTimeout(() => {
      setCurrentAdIndex((prev) => prev + 1)
      adStartTimeRef.current = Date.now()

      // Track impression for next ad
      const nextAd = validAds[currentAdIndex + 1]
      if (nextAd && !impressionTrackedRef.current.has(nextAd.id)) {
        impressionTrackedRef.current.add(nextAd.id)
        trackAdEvent(nextAd.id, 'impression', streamId)
      }

      transitioningRef.current = false
    }, 600)

    return () => clearTimeout(timer)
  }, [tick, countdown, currentAd, currentAdIndex, isLastAd, onComplete, streamId, validAds])

  function handleSkip() {
    if (!canSkip || transitioningRef.current || completedRef.current) return

    if (currentAd) {
      trackAdEvent(currentAd.id, 'skip', streamId)
    }
    completedRef.current = true
    onSkip?.()
    setIsDone(true)
    onComplete()
  }

  function handleClick() {
    if (!currentAd?.targetUrl) return
    trackAdEvent(currentAd.id, 'click', streamId)
    window.open(currentAd.targetUrl, '_blank', 'noopener,noreferrer')
  }

  function handleImgError(index: number) {
    setImgErrors((prev) => new Set(prev).add(index))
  }

  // No valid ads or already done — don't render
  if (validAds.length === 0 || isDone) {
    return null
  }

  const hasImgError = imgErrors.has(currentAdIndex)
  const timeSinceStart = Math.floor((Date.now() - globalStartTimeRef.current) / 1000)
  const skipCountdown = Math.max(0, SKIP_AFTER_SECONDS - timeSinceStart)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: '#02040a' }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 255, 136, 0.03) 0%, transparent 70%)',
        }}
      />

      {/* Overall progress bar at very top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
        <motion.div
          className="h-full bg-[#00ff88]"
          initial={{ width: '0%' }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center px-4">
        <AnimatePresence mode="wait">
          {currentAd && (
            <motion.div
              key={currentAd.id + '-' + currentAdIndex}
              variants={adTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full overflow-hidden rounded-2xl border border-white/[0.08]"
              style={{
                background: 'rgba(10, 14, 26, 0.95)',
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Ad header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-[#00ff88]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Advertisement
                  </span>
                  {validAds.length > 1 && (
                    <span className="ml-2 text-[11px] text-white/25">
                      {currentAdIndex + 1} / {validAds.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-white/20" />
                  <span className="text-[11px] text-white/25">Pre-roll</span>
                </div>
              </div>

              {/* Ad media */}
              <button
                type="button"
                onClick={handleClick}
                className="relative block w-full cursor-pointer"
                style={{ background: 'transparent' }}
              >
                {currentAd.mediaUrl && !hasImgError ? (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={currentAd.mediaUrl}
                      alt={currentAd.title || 'Advertisement'}
                      className="h-full w-full object-cover"
                      onError={() => handleImgError(currentAdIndex)}
                    />

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Title overlay */}
                    {currentAd.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="text-lg font-bold text-white drop-shadow-lg">
                          {currentAd.title}
                        </p>
                        {currentAd.targetUrl && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white/60">
                            <ExternalLink className="h-3 w-3" />
                            <span>Click to visit</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* External link indicator on hover */}
                    {currentAd.targetUrl && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 text-white/50 opacity-0 transition-opacity hover:opacity-100">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-medium">Open</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Text-only fallback */
                  <div className="flex min-h-[280px] flex-col items-center justify-center gap-6 p-8 md:min-h-[350px]">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#00ff88]/10 ring-1 ring-[#00ff88]/20">
                      <Megaphone className="h-10 w-10 text-[#00ff88]" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">
                        {currentAd.title || 'Advertisement'}
                      </p>
                      <p className="mt-2 text-sm text-white/40">
                        Your content will begin shortly
                      </p>
                      {currentAd.targetUrl && (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#00ff88]/10 px-3 py-1.5 text-xs font-medium text-[#00ff88]">
                          <ExternalLink className="h-3 w-3" />
                          <span>Click to learn more</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </button>

              {/* Bottom controls bar */}
              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
                {/* Countdown */}
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-white/30" />
                  <span className="text-sm font-medium text-white/50">
                    Ad ends in{' '}
                    <span className="font-bold text-white/80">{countdown}</span>
                  </span>
                </div>

                {/* Current ad progress dots */}
                {validAds.length > 1 && (
                  <div className="hidden items-center gap-1.5 sm:flex">
                    {validAds.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i < currentAdIndex
                            ? 'w-4 bg-[#00ff88]'
                            : i === currentAdIndex
                              ? 'w-6 bg-[#00ff88]/60'
                              : 'w-1.5 bg-white/15'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Skip button */}
                {canSkip && (
                  <motion.button
                    type="button"
                    onClick={handleSkip}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/15 active:scale-[0.97]"
                  >
                    <span>Skip Ad</span>
                    <span className="text-white/40">»</span>
                  </motion.button>
                )}

                {!canSkip && (
                  <div className="flex items-center gap-1.5 text-xs text-white/25">
                    <span>Skip in</span>
                    <span className="font-mono font-medium text-white/40">
                      {skipCountdown}
                    </span>
                    <span>s</span>
                  </div>
                )}
              </div>

              {/* Per-ad progress bar */}
              <div className="h-0.5 bg-white/5">
                <motion.div
                  className="h-full bg-[#00ff88]/50"
                  initial={{ width: '0%' }}
                  animate={{
                    width: `${(elapsedForCurrentAd / adDuration) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content preview text below */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-center text-sm text-white/25"
        >
          {isFirstAd ? 'Your stream will begin after this message' : `${validAds.length - currentAdIndex - 1} ad${validAds.length - currentAdIndex - 1 !== 1 ? 's' : ''} remaining`}
        </motion.p>
      </div>
    </motion.div>
  )
}
