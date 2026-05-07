'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Megaphone, X, Volume2, VolumeX } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StreamData {
  id: string
  title: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  matchTime?: string
  thumbnail?: string
  category: string
  viewerCount: number
}

interface HeroBannerAdsProps {
  featuredStream?: StreamData | null
}

interface Ad {
  id: string
  title: string
  description?: string
  mediaUrl: string
  targetUrl?: string
  category?: string
  position?: string
}

interface BannerItem {
  type: 'ad' | 'stream'
  ad?: Ad
  stream?: StreamData
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(url)
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

// ─── Animation Variants ─────────────────────────────────────────────────────

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: 'easeInOut' } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
}

// ─── Skeleton Component ─────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[520px] rounded-2xl overflow-hidden bg-[#1a1a1a]">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.03] to-white/[0.01]" />
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
        <div className="h-3 w-24 rounded bg-white/[0.06] mb-3" />
        <div className="h-5 sm:h-6 md:h-7 w-3/4 rounded bg-white/[0.08] mb-3" />
        <div className="h-9 sm:h-10 md:h-11 w-36 rounded-lg bg-white/[0.06]" />
      </div>
    </div>
  )
}

// ─── Fallback Banner ────────────────────────────────────────────────────────

function FallbackBanner() {
  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[520px] rounded-2xl overflow-hidden"
    >
      {/* Branded gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E50914]/30 via-[#141414] to-[#141414]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(229,9,20,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(229,9,20,0.08),transparent_50%)]" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-[15%] h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-[#E50914]/5 blur-3xl" />
      <div className="absolute bottom-1/4 left-[10%] h-32 w-32 rounded-full bg-[#E50914]/5 blur-2xl" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-4 sm:p-6 md:p-8">
        {/* Sportix Live Logo */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-[#E50914] flex items-center justify-center">
            <span className="text-sm sm:text-base font-black text-white">S</span>
          </div>
          <span className="text-sm sm:text-base font-bold text-white">
            Sportix <span className="text-[#E50914]">Live</span>
          </span>
        </div>

        {/* Sponsored badge */}
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-[#E50914]/20 px-3 py-1 backdrop-blur-sm">
          <Megaphone className="h-3 w-3 text-[#E50914]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E50914]">
            Sponsored
          </span>
        </div>

        {/* Title area */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-2 sm:mb-3">
            Watch Live Sports
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-md">
            Stream football, basketball, tennis, and more — all in stunning HD quality
          </p>
        </div>

        {/* CTA Button */}
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#E50914] px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[#c40812] w-fit active:scale-[0.97]">
          <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white" />
          Start Watching
        </button>
      </div>
    </motion.div>
  )
}

// ─── Single Ad Slide ────────────────────────────────────────────────────────

function AdSlide({
  ad,
  onTrackClick,
}: {
  ad: Ad
  onTrackClick: () => void
}) {
  const [imgError, setImgError] = useState(false)
  const [muted, setMuted] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)
  const isVideo = isVideoUrl(ad.mediaUrl)

  const handleClick = () => {
    onTrackClick()
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[520px] rounded-2xl overflow-hidden group cursor-pointer"
      onClick={handleClick}
    >
      {/* Media */}
      {isVideo ? (
        <>
          <video
            autoPlay
            muted={muted}
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            poster=""
          >
            <source src={ad.mediaUrl} type={ad.mediaUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          </video>

          {/* Mute toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMuted(!muted)
            }}
            className="absolute top-4 sm:top-6 right-14 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white/70 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </>
      ) : (
        <>
          {/* Image placeholder gradient while loading */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-white/[0.02] animate-pulse" />
          )}
          {!imgError && (
            <img
              src={ad.mediaUrl}
              alt={ad.title || 'Advertisement'}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onError={() => setImgError(true)}
              onLoad={() => setImgLoaded(true)}
            />
          )}
          {/* Fallback gradient if image fails */}
          {imgError && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#E50914]/20 via-[#1a1a1a] to-[#141414]" />
          )}
        </>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Sponsored badge */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-1.5 rounded-full bg-[#E50914]/20 px-3 py-1 backdrop-blur-sm z-10">
        <Megaphone className="h-3 w-3 text-[#E50914]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E50914]">
          Sponsored
        </span>
      </div>

      {/* External link indicator */}
      {ad.targetUrl && (
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}

      {/* Bottom content area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 z-10">
        {/* Title */}
        {ad.title && (
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-1 sm:mb-2 line-clamp-2">
            {ad.title}
          </h2>
        )}

        {/* Description (desktop only) */}
        {ad.description && (
          <p className="hidden md:block text-sm text-white/50 mb-3 line-clamp-1">
            {ad.description}
          </p>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#E50914] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[#c40812] active:scale-[0.97]"
        >
          {ad.targetUrl ? 'Learn More' : 'Watch Now'}
          <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-white" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Live Match Slide (Desktop only) ────────────────────────────────────────

function LiveStreamSlide({ stream }: { stream: StreamData }) {
  const thumb = stream.thumbnail || ''
  const hasThumb = !!thumb

  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[520px] rounded-2xl overflow-hidden group"
    >
      {/* Background */}
      {hasThumb ? (
        <img
          src={thumb}
          alt={`${stream.homeTeam} vs ${stream.awayTeam}`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="eager"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#1a2235]" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

      {/* Live badge (hidden on mobile) */}
      <div className="hidden md:flex absolute left-6 top-6 items-center gap-1.5 rounded-md bg-[#ff3b3b] px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
        <span className="h-1.5 w-1.5 rounded-full bg-white live-pulse" />
        LIVE
      </div>

      {/* Viewer count (hidden on mobile) */}
      <div className="hidden md:flex absolute right-6 top-6 items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-[11px] text-white/70 backdrop-blur-sm">
        {stream.viewerCount >= 1000
          ? `${(stream.viewerCount / 1000).toFixed(1)}K`
          : stream.viewerCount}{' '}
        watching
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
        <p className="text-[10px] sm:text-[11px] font-semibold text-[#E50914] mb-1 sm:mb-2 uppercase tracking-wider">
          {stream.category === 'football' ? 'UEFA Champions League' : stream.category}
        </p>
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2 sm:mb-3">
          {stream.homeTeam} vs {stream.awayTeam}
        </h2>

        {/* Score display */}
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-xs sm:text-sm font-bold text-white/80">
              {stream.homeTeam[0]}
            </div>
            <span className="text-base sm:text-xl font-bold text-white tabular-nums">
              {stream.homeScore}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-[#E50914] bg-[#E50914]/10 px-2 sm:px-3 py-1 rounded-md">
            {stream.matchTime || 'LIVE'}
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-base sm:text-xl font-bold text-white tabular-nums">
              {stream.awayScore}
            </span>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-xs sm:text-sm font-bold text-white/80">
              {stream.awayTeam[0]}
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 rounded-lg bg-[#E50914] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[#c40812]">
          <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white" />
          Watch Now
        </span>
      </div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function HeroBannerAds({ featuredStream }: HeroBannerAdsProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const impressionTrackedRef = useRef<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Responsive breakpoint detection ──
  useEffect(() => {
    const checkBreakpoint = () => setIsDesktop(window.innerWidth >= 768)
    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [])

  // ── Fetch ads ──
  const fetchAds = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/ads?position=hero&active=true')
      if (res.ok) {
        const data = await res.json()
        const adList = Array.isArray(data) ? data : data.ads || []
        setAds(adList)
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  // ── Build rotation queue ──
  // Desktop: 70% featured stream, 30% ads → interleave
  // Mobile/Tablet: only ads
  const hasAds = ads.length > 0
  const hasStream = !!(featuredStream && isDesktop)

  const queue = (() => {
    if (!hasStream) {
      // Only ads or fallback
      return hasAds
        ? ads.map((ad) => ({ type: 'ad' as const, ad }))
        : []
    }

    if (!hasAds) {
      // Only stream
      return [{ type: 'stream' as const, stream: featuredStream }]
    }

    // Desktop: interleave stream + ads (roughly 70/30 ratio)
    // For 3 ads: stream, ad, stream, stream, ad, stream, ad, stream, stream, ad...
    // Simpler approach: pattern of [stream, stream, stream, ad, stream, stream, stream, ad, ...]
    const items: BannerItem[] = []
    const streamRatio = 7
    const adRatio = 3
    const cycleLength = streamRatio + adRatio
    let adIdx = 0

    for (let i = 0; i < cycleLength; i++) {
      if (i < streamRatio) {
        items.push({ type: 'stream', stream: featuredStream })
      } else {
        items.push({ type: 'ad', ad: ads[adIdx % ads.length] })
        adIdx++
      }
    }

    return items
  })()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const currentItem = queue[currentIndex]

  // ── Auto-rotate ──
  useEffect(() => {
    if (queue.length <= 1 || hovered) {
      if (rotationRef.current) {
        clearInterval(rotationRef.current)
        rotationRef.current = null
      }
      return
    }

    rotationRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % queue.length)
        setVisible(true)
      }, 400)
    }, 8000)

    return () => {
      if (rotationRef.current) clearInterval(rotationRef.current)
    }
  }, [queue.length, hovered])

  // ── Track impressions ──
  useEffect(() => {
    if (!currentItem || currentItem.type !== 'ad' || !currentItem.ad) return
    const adId = currentItem.ad.id
    if (!impressionTrackedRef.current.has(adId)) {
      impressionTrackedRef.current.add(adId)
      trackAdEvent(adId, 'impression')
    }
  }, [currentIndex, currentItem])

  // ── Handle ad click tracking ──
  const handleAdClick = useCallback(() => {
    if (currentItem?.type === 'ad' && currentItem.ad) {
      trackAdEvent(currentItem.ad.id, 'click')
    }
  }, [currentItem])

  // ── Render ──

  // Loading skeleton
  if (loading) {
    return (
      <div className="relative w-full" ref={containerRef}>
        <HeroSkeleton />
      </div>
    )
  }

  // No ads, no stream → fallback
  if (!hasAds && !hasStream) {
    return (
      <div className="relative w-full" ref={containerRef}>
        <AnimatePresence mode="wait">
          <FallbackBanner />
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div
      className="relative w-full"
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence mode="wait">
        {visible && currentItem && (
          <>
            {currentItem.type === 'ad' && currentItem.ad && (
              <AdSlide
                key={`ad-${currentItem.ad.id}-${currentIndex}`}
                ad={currentItem.ad}
                onTrackClick={handleAdClick}
              />
            )}
            {currentItem.type === 'stream' && currentItem.stream && (
              <LiveStreamSlide
                key={`stream-${currentItem.stream.id}-${currentIndex}`}
                stream={currentItem.stream}
              />
            )}
          </>
        )}

        {/* Show fallback if queue is empty but we should never get here */}
        {!visible && !currentItem && <FallbackBanner />}
      </AnimatePresence>

      {/* Ad counter dots (only when there are multiple ads in the queue) */}
      {!isDesktop && hasAds && ads.length > 1 && (
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-1 z-20">
          {ads.map((ad, i) => (
            <div
              key={ad.id}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === (currentItem?.type === 'ad' ? currentIndex % ads.length : -1)
                  ? 'w-4 bg-[#E50914]/80'
                  : 'w-1 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
