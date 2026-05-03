'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Megaphone } from 'lucide-react'

interface AdBannerProps {
  position: 'top' | 'bottom' | 'sidebar'
  category?: string
  streamId?: string
  onAdClick?: (adId: string, targetUrl: string) => void
}

interface Ad {
  id: string
  title: string
  mediaUrl: string
  targetUrl?: string
  category?: string
  streamId?: string
}

async function trackAdEvent(adId: string, eventType: 'impression' | 'click' | 'close', streamId?: string) {
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

const positionStyles: Record<string, string> = {
  top: 'fixed top-14 left-0 right-0 z-40',
  bottom: 'fixed bottom-0 left-0 right-0 z-40 md:bottom-0',
  sidebar: 'relative w-full',
}

const bannerVariants = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.3, ease: 'easeIn' } },
}

export default function AdBanner({ position, category, streamId, onAdClick }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)
  const rotationRef = useRef<NodeJS.Timeout | null>(null)
  const impressionTrackedRef = useRef<Set<string>>(new Set())

  // Fetch active ads
  const fetchAds = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ active: 'true' })
      if (category) params.set('category', category)
      const res = await fetch(`/api/ads?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const adList = Array.isArray(data) ? data : data.ads || []
        setAds(adList)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  // Auto-rotate ads every 15 seconds
  useEffect(() => {
    if (ads.length <= 1) return

    rotationRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length)
        setImgError(false)
        setVisible(true)
      }, 400)
    }, 15000)

    return () => {
      if (rotationRef.current) clearInterval(rotationRef.current)
    }
  }, [ads.length])

  // Track impression when ad changes
  useEffect(() => {
    const ad = ads[currentIndex]
    if (ad && !impressionTrackedRef.current.has(ad.id)) {
      impressionTrackedRef.current.add(ad.id)
      trackAdEvent(ad.id, 'impression', streamId)
    }
  }, [currentIndex, ads, streamId])

  const handleClose = useCallback(async () => {
    const ad = ads[currentIndex]
    if (ad) {
      trackAdEvent(ad.id, 'close', streamId)
    }
    if (rotationRef.current) clearInterval(rotationRef.current)
    setDismissed(true)
  }, [ads, currentIndex, streamId])

  const handleClick = useCallback(() => {
    const ad = ads[currentIndex]
    if (!ad?.targetUrl) return

    trackAdEvent(ad.id, 'click', streamId)
    onAdClick?.(ad.id, ad.targetUrl)
    window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
  }, [ads, currentIndex, streamId, onAdClick])

  // Don't render if dismissed or no ads or loading
  if (dismissed || (ads.length === 0 && !loading)) return null

  const currentAd = ads[currentIndex]

  if (loading) {
    return (
      <div className={positionStyles[position]}>
        <div className="mx-auto flex items-center justify-center py-2 px-4">
          <div className="h-8 w-full max-w-5xl animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      </div>
    )
  }

  if (!currentAd) return null

  const isSidebar = position === 'sidebar'

  return (
    <div className={positionStyles[position]}>
      <div className="mx-auto px-2 sm:px-4">
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={currentAd.id + '-' + currentIndex}
              variants={bannerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative group overflow-hidden rounded-xl border border-white/[0.06]"
              style={{
                background: 'rgba(10, 14, 26, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Banner Content */}
              {currentAd.mediaUrl && !imgError ? (
                <button
                  type="button"
                  onClick={handleClick}
                  className={`relative block w-full cursor-pointer ${isSidebar ? 'h-48 sm:h-56' : 'h-16 sm:h-20 md:h-24'} overflow-hidden`}
                  style={{ background: 'transparent' }}
                >
                  {/* Ad Image */}
                  <img
                    src={currentAd.mediaUrl}
                    alt={currentAd.title || 'Advertisement'}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                  {/* Sponsored Badge */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <Megaphone className="h-3 w-3 text-[#00ff88]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                      Sponsored
                    </span>
                  </div>

                  {/* External link indicator */}
                  {currentAd.targetUrl && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                      <ExternalLink className="h-3.5 w-3.5 text-white/50" />
                    </div>
                  )}

                  {/* Ad title on hover */}
                  {currentAd.title && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden sm:block">
                      <span className="text-xs font-medium text-white/70 truncate max-w-[200px] lg:max-w-[400px] opacity-0 transition-opacity group-hover:opacity-100">
                        {currentAd.title}
                      </span>
                    </div>
                  )}
                </button>
              ) : (
                /* Text-only fallback */
                <button
                  type="button"
                  onClick={handleClick}
                  className={`flex w-full cursor-pointer items-center gap-3 px-4 ${isSidebar ? 'h-48 sm:h-56' : 'h-16 sm:h-20 md:h-24'}`}
                  style={{ background: 'transparent' }}
                >
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Megaphone className="h-3.5 w-3.5 text-[#00ff88]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Ad
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/70 truncate">
                      {currentAd.title || 'Learn more'}
                    </p>
                  </div>
                  {currentAd.targetUrl && (
                    <ExternalLink className="h-3.5 w-3.5 text-white/30 shrink-0" />
                  )}
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-lg bg-black/40 text-white/50 transition-all hover:bg-black/60 hover:text-white/80 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Close advertisement"
              >
                <X className="h-3 w-3" />
              </button>

              {/* Dot indicators for multiple ads (top/bottom only) */}
              {!isSidebar && ads.length > 1 && (
                <div className="absolute bottom-2 right-14 flex items-center gap-1">
                  {ads.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === currentIndex ? 'w-4 bg-[#00ff88]/60' : 'w-1 bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
