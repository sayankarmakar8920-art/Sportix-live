'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Play,
  Clock,
  Eye,
  Filter,
  Search,
  Film,
  Loader2,
  AlertCircle,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════
   ║                         TYPES                                  ║
   ═══════════════════════════════════════════════════════════════════ */

interface ReplaySectionProps {
  streams?: any[]
}

interface Recording {
  id: string
  title: string
  description?: string
  thumbnail?: string
  duration: number
  category: string
  views: number
  status: 'ready' | 'processing' | 'failed'
  recordedAt: string
  streamUrl?: string
}

/* ═══════════════════════════════════════════════════════════════════
   ║                       CONSTANTS                                ║
   ═══════════════════════════════════════════════════════════════════ */

const SPORT_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '' },
  { id: 'football', label: 'Football', emoji: '⚽' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'racing', label: 'Racing', emoji: '🏎️' },
  { id: 'cricket', label: 'Cricket', emoji: '🏏' },
  { id: 'mma', label: 'MMA', emoji: '🥊' },
]

const STATUS_CONFIG = {
  ready: { color: '#00ff88', label: 'Ready', bgClass: 'bg-[#00ff88]/10' },
  processing: { color: '#facc15', label: 'Processing', bgClass: 'bg-[#facc15]/10' },
  failed: { color: '#ff3b3b', label: 'Failed', bgClass: 'bg-[#ff3b3b]/10' },
} as const

/* ═══════════════════════════════════════════════════════════════════
   ║                       HELPERS                                  ║
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Format duration in seconds to HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0)
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Format a date string to a relative time description
 * e.g., "2 hours ago", "Yesterday", "3 days ago"
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return ''
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then

  if (diffMs < 0) return 'Just now'

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`

  // Fallback to readable date for older items
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format view count to a compact string
 */
function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}

/* ═══════════════════════════════════════════════════════════════════
   ║                   MOCK DATA FALLBACK                          ║
   ═══════════════════════════════════════════════════════════════════ */

const MOCK_RECORDINGS: Recording[] = [
  {
    id: 'rec-1',
    title: 'Real Madrid vs Barcelona — El Clásico Full Match Replay',
    description: 'La Liga 2024/25 Matchday 28',
    duration: 5400,
    category: 'football',
    views: 128400,
    status: 'ready',
    recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    streamUrl: '',
  },
  {
    id: 'rec-2',
    title: 'Lakers vs Celtics — NBA Playoffs Game 4',
    description: 'Western Conference Semifinals',
    duration: 7200,
    category: 'basketball',
    views: 95200,
    status: 'ready',
    recordedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    streamUrl: '',
  },
  {
    id: 'rec-3',
    title: 'Monaco Grand Prix — Full Race Replay',
    description: 'Formula 1 2025 Round 7',
    duration: 5400,
    category: 'racing',
    views: 215000,
    status: 'ready',
    recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    streamUrl: '',
  },
  {
    id: 'rec-4',
    title: 'Wimbledon Final — Djokovic vs Alcaraz',
    description: "Men's Singles Championship",
    duration: 10800,
    category: 'tennis',
    views: 432100,
    status: 'ready',
    recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    streamUrl: '',
  },
  {
    id: 'rec-5',
    title: 'Man City vs Arsenal — Premier League Highlights',
    description: 'Matchweek 32 Highlights',
    duration: 900,
    category: 'football',
    views: 67800,
    status: 'ready',
    recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    streamUrl: '',
  },
  {
    id: 'rec-6',
    title: 'UFC 310 Main Card — Full Event Replay',
    description: 'MMA Fight Night',
    duration: 10800,
    category: 'mma',
    views: 342000,
    status: 'processing',
    recordedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    streamUrl: '',
  },
  {
    id: 'rec-7',
    title: 'India vs Australia — Cricket Test Day 3',
    description: 'Border-Gavaskar Trophy 2025',
    duration: 28800,
    category: 'cricket',
    views: 189000,
    status: 'ready',
    recordedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    streamUrl: '',
  },
  {
    id: 'rec-8',
    title: 'Champions League Quarter-Final Highlights',
    description: 'Bayern vs PSG Best Moments',
    duration: 1200,
    category: 'football',
    views: 521000,
    status: 'failed',
    recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    streamUrl: '',
  },
]

/* ═══════════════════════════════════════════════════════════════════
   ║                   REPLAY CARD COMPONENT                       ║
   ═══════════════════════════════════════════════════════════════════ */

function ReplayCard({
  recording,
  onPlay,
}: {
  recording: Recording
  onPlay: (rec: Recording) => void
}) {
  const statusConfig = STATUS_CONFIG[recording.status] ?? STATUS_CONFIG.ready
  const isPlayable = recording.status === 'ready'

  return (
    <button
      onClick={() => isPlayable && onPlay(recording)}
      disabled={!isPlayable}
      className={`glass-card group/rec rounded-xl overflow-hidden text-left transition-all duration-200 hover:border-[#00ff88]/20 w-full ${
        isPlayable
          ? 'hover:bg-white/[0.04] active:scale-[0.98] touch-active cursor-pointer'
          : 'opacity-70 cursor-not-allowed'
      }`}
    >
      {/* ── Thumbnail ── */}
      <div className="relative aspect-video overflow-hidden">
        {/* Gradient placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#1a2235]" />

        {recording.thumbnail && (
          <img
            src={recording.thumbnail}
            alt={recording.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/rec:scale-105"
            loading="lazy"
            draggable={false}
          />
        )}

        {/* Film icon placeholder when no thumbnail */}
        {!recording.thumbnail && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="h-8 w-8 text-white/10" />
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* ── Play button overlay on hover ── */}
        {isPlayable && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/rec:opacity-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00ff88]/20 backdrop-blur-sm ring-1 ring-[#00ff88]/30 transition-transform group-hover/rec:scale-110">
              <Play
                className="h-5 w-5 text-[#00ff88] fill-[#00ff88] ml-0.5"
              />
            </div>
          </div>
        )}

        {/* ── Processing overlay ── */}
        {recording.status === 'processing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#facc15]" />
              <span className="text-[10px] font-medium text-[#facc15]/80">
                Processing
              </span>
            </div>
          </div>
        )}

        {/* ── Failed overlay ── */}
        {recording.status === 'failed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-6 w-6 text-[#ff3b3b]" />
              <span className="text-[10px] font-medium text-[#ff3b3b]/80">
                Unavailable
              </span>
            </div>
          </div>
        )}

        {/* ── Duration badge (bottom-right) ── */}
        <div className="absolute bottom-2 right-2 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
          {formatDuration(recording.duration)}
        </div>

        {/* ── Status dot (top-right) ── */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className="flex h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: statusConfig.color,
              boxShadow: `0 0 6px ${statusConfig.color}40`,
            }}
            title={statusConfig.label}
          />
        </div>
      </div>

      {/* ── Card Content ── */}
      <div className="p-3">
        {/* Title — truncated to 2 lines */}
        <h3 className="text-[13px] font-medium text-white/85 line-clamp-2 leading-snug">
          {recording.title}
        </h3>

        {/* Category badge */}
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40 capitalize">
            {recording.category}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusConfig.bgClass}`}
            style={{ color: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* View count + Date */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-white/30">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatViews(recording.views)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(recording.recordedAt)}
          </span>
        </div>
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                   EMPTY STATE COMPONENT                       ║
   ═══════════════════════════════════════════════════════════════════ */

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] mb-4">
        <Film className="h-8 w-8 text-white/10" />
      </div>
      {hasFilters ? (
        <>
          <p className="text-sm font-medium text-white/40">
            No replays match your filters
          </p>
          <p className="mt-1 text-xs text-white/20">
            Try adjusting your search or category filter
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-white/40">
            No replays available yet
          </p>
          <p className="mt-1 text-xs text-white/20">
            Recorded live streams will appear here so you can watch them
            anytime
          </p>
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                   MAIN COMPONENT                              ═
   ═══════════════════════════════════════════════════════════════════ */

export default function ReplaySection(props: ReplaySectionProps) {
  const { streams: preloadedStreams } = props

  /* ── State ── */
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecording, setSelectedRecording] =
    useState<Recording | null>(null)

  /* ── Fetch recordings ── */
  const fetchRecordings = useCallback(async () => {
    try {
      const res = await fetch('/api/recordings?status=ready')
      if (!res.ok) throw new Error('Failed to fetch recordings')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setRecordings(data)
      } else {
        // Use mock data when API returns empty (no real backend)
        setRecordings(MOCK_RECORDINGS)
      }
      setError(null)
    } catch {
      // Graceful fallback to mock data on error
      setRecordings(MOCK_RECORDINGS)
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* ── Initialize: use preloaded streams or fetch ── */
  useEffect(() => {
    if (preloadedStreams && preloadedStreams.length > 0) {
      setRecordings(preloadedStreams)
      setIsLoading(false)
    } else {
      fetchRecordings()
    }
  }, [preloadedStreams, fetchRecordings])

  /* ── Auto-refresh every 30 seconds ── */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecordings()
    }, 30_000)
    return () => clearInterval(interval)
  }, [fetchRecordings])

  /* ── Filter logic ── */
  const filteredRecordings = useMemo(() => {
    let result = recordings

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter((r) => r.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query))
      )
    }

    return result
  }, [recordings, activeCategory, searchQuery])

  const hasActiveFilters = activeCategory !== 'all' || searchQuery.trim().length > 0

  /* ── Handle play ── */
  const handlePlay = useCallback((rec: Recording) => {
    setSelectedRecording(rec)
    // In a real implementation, this would open the HLSPlayer
    // with the recording's stream URL
    console.log('Playing replay:', rec.title, rec.streamUrl)
  }, [])

  /* ── Handle search input ── */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    []
  )

  /* ═══════════════════════════════════════════════════════════════════
     ║                        RENDER                                  ║
     ═══════════════════════════════════════════════════════════════════ */

  return (
    <section className="w-full space-y-4 fade-in-up">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00ff88]/10 text-[#00ff88]">
            <Film className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-white">
              Replays & VOD
            </h2>
            <p className="text-[11px] text-white/35">
              {recordings.length} recording{recordings.length !== 1 ? 's' : ''}{' '}
              available
            </p>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <span className="flex items-center gap-1.5 text-[10px] text-white/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff88] opacity-40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00ff88]/60" />
          </span>
          Auto-refresh
        </span>
      </div>

      {/* ── Search Bar + Filter Row ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            placeholder="Search replays..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/25 transition-all focus:border-[#00ff88]/20 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-[#00ff88]/10"
          />
        </div>

        {/* Filter button (mobile) */}
        <div className="flex items-center gap-2 sm:hidden">
          <div className="flex items-center gap-1 text-[10px] text-white/30">
            <Filter className="h-3 w-3" />
            Filter
          </div>
        </div>
      </div>

      {/* ── Sport Category Tabs ── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {SPORT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-150 touch-active ${
              activeCategory === cat.id
                ? 'bg-[#00ff88] text-[#02040a] shadow-md shadow-[#00ff88]/20'
                : 'bg-white/[0.04] text-white/45 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
            }`}
          >
            {cat.emoji && <span className="mr-1.5">{cat.emoji}</span>}
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="glass-card rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-white/[0.03]" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-3/4 rounded bg-white/[0.05]" />
                <div className="h-3 w-1/2 rounded bg-white/[0.03]" />
                <div className="flex gap-2">
                  <div className="h-4 w-14 rounded-full bg-white/[0.03]" />
                  <div className="h-4 w-16 rounded-full bg-white/[0.03]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error State ── */}
      {error && !isLoading && (
        <div className="glass-card flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff3b3b]/10 mb-3">
            <AlertCircle className="h-7 w-7 text-[#ff3b3b]" />
          </div>
          <p className="text-sm font-medium text-white/50">
            Failed to load recordings
          </p>
          <p className="mt-1 text-xs text-white/25">{error}</p>
          <button
            onClick={fetchRecordings}
            className="mt-4 rounded-xl bg-[#00ff88]/10 px-4 py-2 text-xs font-medium text-[#00ff88] ring-1 ring-[#00ff88]/20 transition-all hover:bg-[#00ff88]/15"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Replay Grid ── */}
      {!isLoading && !error && filteredRecordings.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filteredRecordings.map((recording) => (
            <ReplayCard
              key={recording.id}
              recording={recording}
              onPlay={handlePlay}
            />
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && !error && filteredRecordings.length === 0 && (
        <EmptyState hasFilters={hasActiveFilters} />
      )}

      {/* ── Results count when filtering ── */}
      {!isLoading &&
        !error &&
        hasActiveFilters &&
        filteredRecordings.length > 0 && (
          <div className="flex items-center justify-center gap-1 text-[11px] text-white/20">
            <Filter className="h-3 w-3" />
            Showing {filteredRecordings.length} of {recordings.length}{' '}
            recordings
          </div>
        )}
    </section>
  )
}
