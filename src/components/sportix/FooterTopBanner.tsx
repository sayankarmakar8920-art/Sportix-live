'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, X, ExternalLink, Play } from 'lucide-react'

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
  initial: { opacity: 0, y: 4 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -3,
    transition: { duration: 0.25, ease: 'easeIn' },
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
      const res = await fetch('/api/ads/footer?active=true')
      if (res.ok) {
        const data = await res.json()
        const adList: Ad[] = Array.isArray(data) ? data : data.ads || []
        setAds(adList)

        // Auto-dismiss if no ads
        if (adList.length === 0) {
          setDismissed(true)
        }
      } else {
        // Fallback: try main ads endpoint
        try {
          const fallbackRes = await fetch('/api/ads?active=true')
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json()
            const fallbackAds: Ad[] = Array.isArray(fallbackData) ? fallbackData : fallbackData.ads || []
            setAds(fallbackAds)
            if (fallbackAds.length === 0) setDismissed(true)
          } else {
            setDismissed(true)
          }
        } catch {
          setDismissed(true)
        }
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
      }, 300)
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

  // ── Empty state: collapse completely, no space ──
  if (dismissed || (!loading && ads.length === 0)) return null

  // ── Loading: don't render anything — avoid CLS ──
  if (loading) return null

  const currentAd = ads[currentIndex]
  if (!currentAd) return null

  const hasImgError = imgErrors.has(currentAd.id)
  const isVideo = isVideoUrl(currentAd.mediaUrl)

  return (
    <div className="w-full px-3 pt-3 pb-1 sm:px-4 sm:pt-4 sm:pb-2 lg:px-6 lg:pt-4 lg:pb-2">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`${currentAd.id}-${currentIndex}`}
            variants={bannerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full group overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.06] bg-[#0f0f0f] shadow-[0_0_20px_rgba(229,9,20,0.06)] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(229,9,20,0.12)]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* ── Media Layout ──
                Desktop: horizontal cinematic banner (100px)
                Tablet: compact (80px)
                Mobile: stacked (90px) */}

            {isVideo ? (
              /* ── Video Ad ── */
              <div className="relative w-full h-[90px] sm:h-[80px] lg:h-[100px] overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/60" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center px-4 lg:px-5">
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
                      <p className="text-xs sm:text-sm font-medium text-white/80 truncate max-w-[260px] sm:max-w-[400px] lg:max-w-[600px]">
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
                className="relative block w-full h-[90px] sm:h-[80px] lg:h-[100px] overflow-hidden cursor-pointer text-left"
              >
                {/* Desktop/Tablet: horizontal layout */}
                <div className="hidden sm:flex absolute inset-0 h-full w-full">
                  {/* Image takes left portion */}
                  <div className="relative w-[38%] lg:w-[42%] h-full shrink-0 overflow-hidden">
                    <img
                      src={currentAd.mediaUrl}
                      alt={currentAd.title || 'Advertisement'}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={() => handleImgError(currentAd.id)}
                    />
                  </div>

                  {/* Right side: dark area with text */}
                  <div className="flex-1 bg-[#0f0f0f] flex items-center px-4 sm:px-5 lg:px-6 gap-3 lg:gap-4">
                    {/* Sponsored badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-lg bg-[#E50914]/10">
                        <Megaphone className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#E50914]" />
                      </div>
                    </div>

                    {/* Ad text */}
                    <div className="flex-1 min-w-0">
                      {currentAd.title && (
                        <p className="text-sm lg:text-base font-semibold text-white/90 truncate">
                          {currentAd.title}
                        </p>
                      )}
                      {currentAd.description && (
                        <p className="text-xs text-white/40 truncate mt-0.5 hidden lg:block">
                          {currentAd.description}
                        </p>
                      )}
                    </div>

                    {/* CTA button */}
                    {currentAd.targetUrl && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden lg:inline-flex items-center gap-1.5 rounded-lg bg-[#E50914] px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#c40812]">
                          Visit
                          <ExternalLink className="h-3 w-3" />
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-[#E50914]/60 sm:hidden" />
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
                  <div className="absolute inset-0 flex items-center px-3 gap-2.5">
                    <div className="flex items-center gap-1 shrink-0">
                      <Megaphone className="h-3 w-3 text-[#E50914]" />
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-white/50">
                        Ad
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-white/90 truncate">
                        {currentAd.title || 'Advertisement'}
                      </p>
                    </div>

                    {currentAd.targetUrl && (
                      <div className="flex items-center gap-1 shrink-0 rounded-md bg-[#E50914] px-2.5 py-1">
                        <Play className="h-2.5 w-2.5 text-white fill-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ) : (
              /* ── Text-only fallback ── */
              <button
                type="button"
                onClick={handleClick}
                className="flex w-full h-[90px] sm:h-[80px] lg:h-[100px] items-center px-4 lg:px-6 gap-3 lg:gap-4 cursor-pointer text-left"
              >
                {/* Left: Sponsored badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg bg-[#E50914]/10">
                    <Megaphone className="h-4 w-4 text-[#E50914]" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 hidden sm:block">
                    Sponsored
                  </span>
                </div>

                {/* Center: Ad text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm lg:text-base font-medium text-white/70 truncate">
                    {currentAd.title || 'Learn more'}
                  </p>
                  {currentAd.description && (
                    <p className="text-xs text-white/30 truncate mt-0.5 hidden lg:block">
                      {currentAd.description}
                    </p>
                  )}
                </div>

                {/* Right: CTA */}
                {currentAd.targetUrl && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden lg:inline-flex items-center gap-1.5 rounded-lg bg-[#E50914] px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#c40812]">
                      Visit
                      <ExternalLink className="h-3 w-3" />
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-white/30 lg:hidden" />
                  </div>
                )}
              </button>
            )}

            {/* ── Close Button ── */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-black/50 text-white/50 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white/80 opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
              aria-label="Close advertisement"
            >
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>

            {/* ── Dot indicators (multiple ads only) ── */}
            {ads.length > 1 && (
              <div className="absolute bottom-1.5 right-8 sm:bottom-2.5 sm:right-10 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                {ads.map((ad, i) => (
                  <div
                    key={ad.id}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'w-3 bg-[#E50914]/70'
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
