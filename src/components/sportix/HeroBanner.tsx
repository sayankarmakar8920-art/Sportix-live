'use client'

import { useAppStore } from '@/lib/store'
import { Play, Radio } from 'lucide-react'

const THUMBNAILS: Record<string, string> = {
  'UEFA Champions League — Semi Final': '/thumbnails/ucl-semi.png',
  'Premier League — Title Race': '/thumbnails/epl-title.png',
  'NBA Playoffs — Game 5': '/thumbnails/nba-playoffs.png',
  'La Liga — El Clásico': '/thumbnails/el-clasico.png',
  'Formula 1 — Monaco Grand Prix': '/thumbnails/f1-monaco.png',
  'Tennis — Wimbledon Final': '/thumbnails/wimbledon.png',
}

export default function HeroBanner({ stream }: {
  stream: {
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
}) {
  const { setSelectedStream, setCurrentView } = useAppStore()

  const thumb = stream.thumbnail || THUMBNAILS[stream.title] || ''
  const openStream = () => { setSelectedStream(stream as any); setCurrentView('player') }

  return (
    <>
      {/* Mobile Hero Banner */}
      <button
        onClick={openStream}
        className="relative w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] text-left transition-all active:scale-[0.98] touch-active lg:hidden"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#1a2235]" />
          {thumb && (
            <img
              src={thumb}
              alt={`${stream.homeTeam} vs ${stream.awayTeam}`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              draggable={false}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

          {/* Live badge */}
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md bg-[#ff3b3b] px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-white live-pulse" />
            LIVE
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-[10px] font-medium text-[#00ff88] mb-1 uppercase tracking-wider">
              {stream.category === 'football' ? 'UEFA Champions League' : stream.category}
            </p>
            <h2 className="text-lg font-bold text-white leading-tight mb-2">
              {stream.homeTeam} vs {stream.awayTeam}
            </h2>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
                  {stream.homeTeam[0]}
                </div>
                <span className="text-base font-bold text-white tabular-nums">{stream.homeScore}</span>
              </div>
              <span className="text-[10px] font-medium text-[#00ff88]">{stream.matchTime || 'LIVE'}</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tabular-nums">{stream.awayScore}</span>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
                  {stream.awayTeam[0]}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1.5 rounded-lg bg-[#00ff88] px-4 py-2 text-xs font-bold text-[#02040a]"
              >
                <Play className="h-3.5 w-3.5 fill-[#02040a]" />
                Watch Now
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/40">
                <Radio className="h-3 w-3 text-[#ff3b3b]" />
                {stream.viewerCount >= 1000 ? `${(stream.viewerCount / 1000).toFixed(1)}K` : stream.viewerCount} watching
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Desktop Hero Banner */}
      <button
        onClick={openStream}
        className="relative hidden w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] text-left transition-all active:scale-[0.98] touch-active lg:block group"
      >
        <div className="relative h-[240px] xl:h-[280px] overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#1a2235]" />
          {thumb && (
            <img
              src={thumb}
              alt={`${stream.homeTeam} vs ${stream.awayTeam}`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="eager"
              draggable={false}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

          {/* Live badge */}
          <div className="absolute left-6 top-6 flex items-center gap-1.5 rounded-md bg-[#ff3b3b] px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-white live-pulse" />
            LIVE
          </div>

          {/* Viewer count */}
          <div className="absolute right-6 top-6 flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-[11px] text-white/70 backdrop-blur-sm">
            <Radio className="h-3.5 w-3.5 text-[#ff3b3b]" />
            {stream.viewerCount >= 1000 ? `${(stream.viewerCount / 1000).toFixed(1)}K` : stream.viewerCount} watching
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 xl:p-8">
            <p className="text-[11px] font-semibold text-[#00ff88] mb-2 uppercase tracking-wider">
              {stream.category === 'football' ? 'UEFA Champions League' : stream.category}
            </p>
            <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-3">
              {stream.homeTeam} vs {stream.awayTeam}
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-sm font-bold text-white/80">
                  {stream.homeTeam[0]}
                </div>
                <span className="text-xl font-bold text-white tabular-nums">{stream.homeScore}</span>
              </div>
              <span className="text-xs font-semibold text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-md">{stream.matchTime || 'LIVE'}</span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-white tabular-nums">{stream.awayScore}</span>
                <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-sm font-bold text-white/80">
                  {stream.awayTeam[0]}
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-lg bg-[#00ff88] px-5 py-2.5 text-xs font-bold text-[#02040a] transition-all hover:bg-[#00dd75]">
              <Play className="h-4 w-4 fill-[#02040a]" />
              Watch Now
            </span>
          </div>
        </div>
      </button>
    </>
  )
}
