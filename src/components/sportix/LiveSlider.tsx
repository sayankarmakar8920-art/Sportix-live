'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface StreamItem {
  id: string
  title: string
  status: string
  viewerCount: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  matchTime?: string
  thumbnail?: string
  category: string
}

const CATEGORY_ICONS: Record<string, string> = {
  football: '⚽',
  basketball: '🏀',
  racing: '🏎️',
  tennis: '🎾',
}

const LEAGUE_MAP: Record<string, string> = {
  'UEFA Champions League — Semi Final': 'UEFA Champions League',
  'Premier League — Title Race': 'Premier League',
  'NBA Playoffs — Game 5': 'NBA Playoffs',
  'La Liga — El Clásico': 'La Liga',
  'Formula 1 — Monaco Grand Prix': 'Formula 1',
  'Tennis — Wimbledon Final': 'Wimbledon',
}

const THUMBNAILS: Record<string, string> = {
  'UEFA Champions League — Semi Final': '/thumbnails/ucl-semi.png',
  'Premier League — Title Race': '/thumbnails/epl-title.png',
  'NBA Playoffs — Game 5': '/thumbnails/nba-playoffs.png',
  'La Liga — El Clásico': '/thumbnails/el-clasico.png',
  'Formula 1 — Monaco Grand Prix': '/thumbnails/f1-monaco.png',
  'Tennis — Wimbledon Final': '/thumbnails/wimbledon.png',
}

function getThumbnail(stream: StreamItem): string {
  return stream.thumbnail || THUMBNAILS[stream.title] || ''
}

export default function LiveSlider({ streams }: { streams: StreamItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const { setSelectedStream, setCurrentView } = useAppStore()

  const liveStreams = streams.filter((s) => s.status === 'live')

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    el?.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [liveStreams])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (liveStreams.length === 0) return null

  return (
    <div className="relative">
      <div className="group relative">
        {/* Scroll buttons — desktop */}
        {canScrollLeft && (
          <button onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 hidden items-center justify-center bg-gradient-to-r from-[#0a0e1a] via-[#0a0e1a]/80 to-transparent lg:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 shadow-lg backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </div>
          </button>
        )}
        {canScrollRight && (
          <button onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 hidden items-center justify-center bg-gradient-to-l from-[#0a0e1a] via-[#0a0e1a]/80 to-transparent lg:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 shadow-lg backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        )}

        {/* Cards */}
        <div ref={scrollRef} className="flex gap-3.5 overflow-x-auto no-scrollbar pb-1">
          {liveStreams.map((stream) => {
            const thumb = getThumbnail(stream)
            const league = LEAGUE_MAP[stream.title] || stream.category
            return (
              <button
                key={stream.id}
                onClick={() => { setSelectedStream(stream as any); setCurrentView('player') }}
                className="group/card flex-shrink-0 w-[260px] sm:w-[280px] xl:w-[300px] overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] text-left transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04] active:scale-[0.98] touch-active"
              >
                {/* Thumbnail */}
                <div className="relative h-[150px] sm:h-[155px] overflow-hidden">
                  {/* Gradient fallback background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#1a2235]" />

                  {/* Actual image */}
                  {thumb && (
                    <img
                      src={thumb}
                      alt={`${stream.homeTeam} vs ${stream.awayTeam}`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      loading="eager"
                      draggable={false}
                    />
                  )}

                  {/* Category icon fallback when no image */}
                  {!thumb && (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
                      {CATEGORY_ICONS[stream.category] || '⚽'}
                    </div>
                  )}

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                  {/* Live badge */}
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-[#ff3b3b] px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    <span className="h-1.5 w-1.5 rounded-full bg-white live-pulse" />
                    LIVE
                  </div>

                  {/* Viewer count */}
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                    {stream.viewerCount >= 1000 ? `${(stream.viewerCount / 1000).toFixed(1)}K` : stream.viewerCount}
                  </div>

                  {/* Score overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] font-medium text-white/50 mb-1.5">{league}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                          {stream.homeTeam[0]}
                        </div>
                        <span className="text-[11px] font-medium text-white truncate">{stream.homeTeam}</span>
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <span className="text-lg font-bold text-white tabular-nums">{stream.homeScore}</span>
                        <span className="text-[10px] text-[#00ff88] font-medium">{stream.matchTime || 'LIVE'}</span>
                        <span className="text-lg font-bold text-white tabular-nums">{stream.awayScore}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-[11px] font-medium text-white truncate">{stream.awayTeam}</span>
                        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                          {stream.awayTeam[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
