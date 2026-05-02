'use client'

import { Clock, Play, ArrowRight } from 'lucide-react'

interface VideoItem {
  id: string
  title: string
  thumbnail?: string
  duration: number
  category: string
  views: number
  isFeatured: boolean
  description?: string
}

interface ContinueItem {
  id: string
  videoId: string
  title: string
  thumbnail?: string
  duration: number
  progress: number
  watchedAt: string
}

const VIDEO_THUMBNAILS: Record<string, string> = {
  '⚽ Champions League Best Goals — Round of 16': '/thumbnails/ucl-goals.png',
  '🏀 NBA Top 10 Plays of the Week': '/thumbnails/nba-plays.png',
  '🏎️ Monaco GP Qualifying Highlights': '/thumbnails/f1-monaco.png',
  '⚽ Premier League Goals of the Month': '/thumbnails/epl-goals.png',
  '🎾 Wimbledon Day 5 Recap': '/thumbnails/wimbledon.png',
  '⚽ El Clásico — Classic Moments': '/thumbnails/el-clasico.png',
}

const SPORT_LABELS: Record<string, { label: string; color: string }> = {
  football: { label: 'Football', color: 'bg-emerald-500/10 text-emerald-400' },
  basketball: { label: 'Basketball', color: 'bg-orange-500/10 text-orange-400' },
  racing: { label: 'Racing', color: 'bg-red-500/10 text-red-400' },
  tennis: { label: 'Tennis', color: 'bg-yellow-500/10 text-yellow-400' },
  highlights: { label: 'Highlights', color: 'bg-[#00ff88]/10 text-[#00ff88]' },
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K`
  return views.toString()
}

export function VideoCard({ video, onSelect }: { video: VideoItem; onSelect: (v: VideoItem) => void }) {
  const thumbnail = video.thumbnail || VIDEO_THUMBNAILS[video.title] || ''
  const sport = SPORT_LABELS[video.category] || SPORT_LABELS.highlights

  return (
    <button
      onClick={() => onSelect(video)}
      className="group/card overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] text-left transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04] active:scale-[0.98] touch-active w-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#1a2235]" />
        {thumbnail && (
          <img
            src={thumbnail}
            alt={video.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
            draggable={false}
          />
        )}
        {!thumbnail && (
          <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-20">🎬</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00ff88]/20 backdrop-blur-sm ring-1 ring-[#00ff88]/30 transition-transform group-hover/card:scale-110">
            <Play className="h-4 w-4 text-[#00ff88] fill-[#00ff88] ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
          {formatDuration(video.duration)}
        </div>

        {/* Sport label */}
        <div className="absolute top-2 left-2">
          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${sport.color} backdrop-blur-sm`}>
            {sport.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-[13px] font-medium text-white/85 line-clamp-2 leading-snug">{video.title}</h3>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/30">
          <span>{formatViews(video.views)} views</span>
          <span>•</span>
          <span>{video.category === 'highlights' ? 'Highlights' : video.category}</span>
        </div>
      </div>
    </button>
  )
}

export function ContinueCard({ item, onSelect }: { item: ContinueItem; onSelect: (item: ContinueItem) => void }) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="group/card overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] text-left transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04] active:scale-[0.98] touch-active w-full"
    >
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#1a2235]" />
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full bg-[#00ff88] transition-all" style={{ width: `${item.progress * 100}%` }} />
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/10 transition-all group-hover/card:bg-[#00ff88]/20 group-hover/card:ring-[#00ff88]/30">
            <Play className="h-3.5 w-3.5 text-white fill-white ml-0.5" />
          </div>
        </div>
        {/* Duration */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
          {formatDuration(item.duration)}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-[13px] font-medium text-white/85 line-clamp-1">{item.title}</h3>
        <span className="mt-1 flex items-center gap-1 text-[11px] text-white/30">
          <Clock className="h-3 w-3" />
          {item.duration - Math.round(item.progress * item.duration)}m left
        </span>
      </div>
    </button>
  )
}

export function ContentSection({
  title,
  icon,
  children,
  viewAll = false,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  viewAll?: boolean
}) {
  return (
    <section className="fade-in-up">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon}
          <h2 className="text-[15px] font-bold text-white">{title}</h2>
        </div>
        {viewAll && (
          <button className="flex items-center gap-1 text-[12px] font-medium text-[#00ff88] transition-colors hover:text-[#00dd75]">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {children}
      </div>
    </section>
  )
}
