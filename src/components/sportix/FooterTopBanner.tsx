'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, X, ExternalLink } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Ad {
  id: string
  title: string
  description?: string
  mediaUrl: string
  targetUrl?: string
  category?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(url)
}

async function trackAdEvent(
  adId: string,
  eventType: 'impression' | 'click' | 'close',
) {
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

// ─── Animation Variants ─────────────────────────────────────────────────────

const bannerVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function FooterTopBanner() {
  const [ads, setAds] = useState<Ad[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const impressionTrackedRef = useRef<Set<string>>(new Set())

  // ── Fetch ads ──
  const fetchAds = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/ads?position=footer&active=true')
      if (res.ok) {
        const data = await res.json()
        const adList: Ad[] = Array.isArray(data) ? data : data.ads || []
        setAds(adList)

        // Auto-dismiss if no ads
        if (adList.length === 0) {
          setDismissed(true)
        }
      } else {
        setDismissed(true)
      }
    } catch {
      setDismissed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  // ── Auto-rotate every 12 seconds ──
  useEffect(() => {
    if (ads.length <= 1 || hovered) {
      if (rotationRef.current) {
        clearInterval(rotationRef.current)
        rotationRef.current = null
      }
      return
    }

    rotationRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length)
        setVisible(true)
      }, 350)
    }, 12000)

    return () => {
      if (rotationRef.current) clearInterval(rotationRef.current)
    }
  }, [ads.length, hovered])

  // ── Track impressions ──
  useEffect(() => {
    const ad = ads[currentIndex]
    if (ad && !impressionTrackedRef.current.has(ad.id)) {
      impressionTrackedRef.current.add(ad.id)
      trackAdEvent(ad.id, 'impression')
    }
  }, [currentIndex, ads])

  // ── Handlers ──
  const handleClose = useCallback(async () => {
    const ad = ads[currentIndex]
    if (ad) {
      trackAdEvent(ad.id, 'close')
    }
    if (rotationRef.current) clearInterval(rotationRef.current)
    setDismissed(true)
  }, [ads, currentIndex])

  const handleClick = useCallback(() => {
    const ad = ads[currentIndex]
    if (!ad?.targetUrl) return
    trackAdEvent(ad.id, 'click')
    window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
  }, [ads, currentIndex])

  const handleImgError = useCallback((adId: string) => {
    setImgErrors((prev) => new Set(prev).add(adId))
  }, [])

  // ── Render: dismissed or loading with no ads → return null ──
  if (dismissed && !loading) return null
  if (dismissed) return null

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 mb-4 sm:mb-6">
        <div className="w-full max-h-[100px] sm:max-h-[80px] md:max-h-[120px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse overflow-hidden">
          <div className="flex items-center h-20 sm:h-24 md:h-[120px] px-4 sm:px-6">
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-5 w-5 rounded-md bg-white/[0.06]" />
              <div className="h-3 w-16 rounded bg-white/[0.06]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-4 w-48 rounded bg-white/[0.06]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentAd = ads[currentIndex]
  if (!currentAd) return null

  const hasImgError = imgErrors.has(currentAd.id)
  const isVideo = isVideoUrl(currentAd.mediaUrl)

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 mb-4 sm:mb-6">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`${currentAd.id}-${currentIndex}`}
            variants={bannerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full group overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* ── Media Layout ──
                Desktop: horizontal cinematic banner (max-height 120px)
                Tablet: compact (80px)
                Mobile: stacked (max-height 100px) */}

            {isVideo ? (
              /* ── Video Ad ── */
              <div className="relative w-full h-[100px] sm:h-[80px] md:h-[120px] overflow-hidden">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                >
                  <source
                    src={currentAd.mediaUrl}
                    type={
                      currentAd.mediaUrl.endsWith('.webm')
                        ? 'video/webm'
                        : 'video/mp4'
                    }
                  />
                </video>

                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/50" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center px-4 sm:px-6">
                  {/* Sponsored badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Megaphone className="h-3 w-3 text-[#E50914]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                      Sponsored
                    </span>
                  </div>

                  {/* Ad title */}
                  {currentAd.title && (
                    <div className="flex-1 flex justify-center px-4">
                      <p className="text-xs sm:text-sm font-medium text-white/80 truncate max-w-[300px] sm:max-w-[400px] md:max-w-[600px]">
                        {currentAd.title}
                      </p>
                    </div>
                  )}

                  {/* External link icon */}
                  {currentAd.targetUrl && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <ExternalLink className="h-3.5 w-3.5 text-white/50" />
                    </div>
                  )}
                </div>
              </div>
            ) : currentAd.mediaUrl && !hasImgError ? (
              /* ── Image Ad ──
                  Mobile: full image with overlay
                  Desktop/Tablet: horizontal layout with image + text side-by-side */
              <button
                type="button"
                onClick={handleClick}
                className="relative block w-full h-[100px] sm:h-[80px] md:h-[120px] overflow-hidden cursor-pointer"
              >
                {/* Desktop/Tablet: horizontal layout */}
                <div className="hidden sm:flex absolute inset-0 h-full w-full">
                  {/* Image takes left portion */}
                  <div className="relative w-[40%] md:w-[45%] h-full shrink-0 overflow-hidden">
                    <img
                      src={currentAd.mediaUrl}
                      alt={currentAd.title || 'Advertisement'}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={() => handleImgError(currentAd.id)}
                    />
                  </div>

                  {/* Right side: dark area with text */}
                  <div className="flex-1 bg-[#141414] flex items-center px-4 sm:px-5 md:px-6 gap-3 sm:gap-4">
                    {/* Sponsored badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E50914]/10">
                        <Megaphone className="h-4 w-4 text-[#E50914]" />
                      </div>
                    </div>

                    {/* Ad text */}
                    <div className="flex-1 min-w-0">
                      {currentAd.title && (
                        <p className="text-sm md:text-base font-semibold text-white/90 truncate">
                          {currentAd.title}
                        </p>
                      )}
                      {currentAd.description && (
                        <p className="text-xs text-white/40 truncate mt-0.5 hidden md:block">
                          {currentAd.description}
                        </p>
                      )}
                    </div>

                    {/* CTA indicator */}
                    {currentAd.targetUrl && (
                      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="hidden md:inline-flex text-xs font-semibold text-[#E50914]">
                          Visit
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-[#E50914]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile: stacked full image with overlay */}
                <div className="sm:hidden absolute inset-0 h-full w-full">
                  <img
                    src={currentAd.mediaUrl}
                    alt={currentAd.title || 'Advertisement'}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={() => handleImgError(currentAd.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                  {/* Mobile overlay content */}
                  <div className="absolute inset-0 flex items-center px-4 gap-3">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Megaphone className="h-3.5 w-3.5 text-[#E50914]" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                        Ad
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/90 truncate">
                        {currentAd.title || 'Advertisement'}
                      </p>
                    </div>

                    {currentAd.targetUrl && (
                      <ExternalLink className="h-3.5 w-3.5 text-white/40 shrink-0" />
                    )}
                  </div>
                </div>
              </button>
            ) : (
              /* ── Text-only fallback ── */
              <button
                type="button"
                onClick={handleClick}
                className="flex w-full h-[100px] sm:h-[80px] md:h-[120px] items-center px-4 sm:px-6 gap-4 cursor-pointer"
              >
                {/* Left: Sponsored badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[#E50914]/10">
                    <Megaphone className="h-4 w-4 text-[#E50914]" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 hidden sm:block">
                    Sponsored
                  </span>
                </div>

                {/* Center: Ad text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-white/70 truncate">
                    {currentAd.title || 'Learn more'}
                  </p>
                  {currentAd.description && (
                    <p className="text-xs text-white/30 truncate mt-0.5 hidden md:block">
                      {currentAd.description}
                    </p>
                  )}
                </div>

                {/* Right: CTA */}
                {currentAd.targetUrl && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-[#E50914]/10 px-3 py-1.5 text-xs font-semibold text-[#E50914]">
                      Visit
                      <ExternalLink className="h-3 w-3" />
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-white/30 md:hidden" />
                  </div>
                )}
              </button>
            )}

            {/* ── Close Button ── */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-black/40 text-white/50 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white/80 opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
              aria-label="Close advertisement"
            >
              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>

            {/* ── Dot indicators (multiple ads only) ── */}
            {ads.length > 1 && (
              <div className="absolute bottom-2 right-10 sm:bottom-3 sm:right-12 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                {ads.map((ad, i) => (
                  <div
                    key={ad.id}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'w-4 bg-[#E50914]/70'
                        : 'w-1 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
