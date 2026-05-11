'use client'

import { useEffect, useState, useCallback, Suspense, lazy, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import ErrorBoundary from '@/components/ErrorBoundary'
import Header from '@/components/sportix/Header'
import Sidebar from '@/components/sportix/Sidebar'
import LiveSlider from '@/components/sportix/LiveSlider'
import HeroBannerAds from '@/components/sportix/HeroBannerAds'
const FooterTopBanner = lazy(() => import('@/components/sportix/FooterTopBanner'))
import CategoryTabs from '@/components/sportix/CategoryTabs'
import VideoPlayer from '@/components/sportix/VideoPlayer'
import BottomNav from '@/components/sportix/BottomNav'
import { ContentSection, VideoCard } from '@/components/sportix/VideoCard'
import { supabase } from '@/lib/supabase'
import {
  Star, Clock, Flame, TrendingUp, Play, ArrowLeft,
  Radio, Trophy, Calendar, Award, Heart, ListVideo, Settings,
  Eye, Users, Zap, Globe, Bell, Monitor, Moon, Sun,
  ChevronRight, Wifi, Volume2, Shield, Sparkles, MonitorX,
  Lock, EyeOff, AlertCircle,
  Film, RotateCcw
} from 'lucide-react'

// Lazy load heavy components for faster initial page load
const LiveControlRoom = lazy(() => import('@/components/sportix/LiveControlRoom'))
const AdminPanel = lazy(() => import('@/components/sportix/AdminPanel'))
const HLSPlayer = lazy(() => import('@/components/sportix/HLSPlayer'))
const ReplaySection = lazy(() => import('@/components/sportix/ReplaySection'))
const LiveReactions = lazy(() => import('@/components/sportix/LiveReactions'))
const AdBanner = lazy(() => import('@/components/sportix/AdBanner'))
const UserDashboard = lazy(() => import('@/components/sportix/UserDashboard'))

/* ──────────────────────── Types ──────────────────────── */

interface StreamData {
  id: string; title: string; description?: string; thumbnail?: string
  category: string; status: string; viewerCount: number; peakViewers: number
  homeTeam: string; awayTeam: string; homeScore: number; awayScore: number
  matchTime?: string
  isFeatured: boolean
  fps?: number
  bitrate?: number
}

interface VideoData {
  id: string; title: string; description?: string; thumbnail?: string
  duration: number; category: string; views: number; isFeatured: boolean
}

interface ContinueData {
  id: string; videoId: string; title: string; thumbnail?: string
  duration: number; progress: number; watchedAt: string
}

/* ──────────────────────── Helpers ──────────────────────── */

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function openVideo(video: VideoData, store: typeof useAppStore) {
  store.getState().setSelectedVideo(video as any)
  store.getState().setSelectedStream({
    ...video, status: 'offline', viewerCount: 0, peakViewers: 0,
    homeTeam: '', awayTeam: '', homeScore: 0, awayScore: 0, isFeatured: video.isFeatured,
  } as any)
  store.getState().setCurrentView('player')
}

function openLiveStream(stream: StreamData, store: typeof useAppStore) {
  store.getState().setSelectedStream(stream)
  store.getState().setSelectedVideo({
    id: stream.id, title: stream.title, duration: 0, category: stream.category,
    views: stream.viewerCount, isFeatured: stream.isFeatured,
  })
  store.getState().setCurrentView('player')
}

const LEAGUES_DATA = [
  { name: 'UEFA Champions League', country: 'Europe', icon: '🏆', color: '#1a237e', teams: 36 },
  { name: 'Premier League', country: 'England', icon: '🦁', color: '#3d195b', teams: 20 },
  { name: 'La Liga', country: 'Spain', icon: '⭐', color: '#ee8707', teams: 20 },
  { name: 'NBA', country: 'USA', icon: '🏀', color: '#c9082a', teams: 30 },
  { name: 'Formula 1', country: 'World', icon: '🏎️', color: '#e10600', teams: 20 },
  { name: 'Wimbledon', country: 'England', icon: '🎾', color: '#2e7d32', teams: 128 },
  { name: 'Serie A', country: 'Italy', icon: '🇮🇹', color: '#0066cc', teams: 20 },
  { name: 'Bundesliga', country: 'Germany', icon: '🇩🇪', color: '#d20515', teams: 18 },
]

const SCHEDULE_DATA = [
  { id: 's1', home: 'Barcelona', away: 'Bayern Munich', date: 'Today', time: '8:00 PM', league: 'UCL', category: 'football', status: 'live' },
  { id: 's2', home: 'Arsenal', away: 'Man City', date: 'Today', time: '8:00 PM', league: 'EPL', category: 'football', status: 'live' },
  { id: 's3', home: 'Lakers', away: 'Celtics', date: 'Today', time: '9:30 PM', league: 'NBA', category: 'basketball', status: 'live' },
  { id: 's4', home: 'Real Madrid', away: 'Atlético Madrid', date: 'Today', time: '8:00 PM', league: 'La Liga', category: 'football', status: 'live' },
  { id: 's5', home: 'Ferrari', away: 'Red Bull', date: 'Tomorrow', time: '2:00 PM', league: 'F1', category: 'racing', status: 'upcoming' },
  { id: 's6', home: 'Djokovic', away: 'Alcaraz', date: 'Tomorrow', time: '10:00 AM', league: 'Wimbledon', category: 'tennis', status: 'upcoming' },
  { id: 's7', home: 'Man United', away: 'Liverpool', date: 'Sat, Jun 7', time: '5:30 PM', league: 'EPL', category: 'football', status: 'upcoming' },
  { id: 's8', home: 'PSG', away: 'AC Milan', date: 'Sun, Jun 8', time: '7:00 PM', league: 'UCL', category: 'football', status: 'upcoming' },
  { id: 's9', home: 'Warriors', away: 'Bucks', date: 'Mon, Jun 9', time: '8:00 PM', league: 'NBA', category: 'basketball', status: 'upcoming' },
  { id: 's10', home: 'McLaren', away: 'Mercedes', date: 'Sun, Jun 15', time: '2:00 PM', league: 'F1', category: 'racing', status: 'upcoming' },
]

const SPORTS_CATEGORIES = [
  { id: 'football', name: 'Football', icon: '⚽', color: '#10b981', count: 24 },
  { id: 'basketball', name: 'Basketball', icon: '🏀', color: '#f97316', count: 12 },
  { id: 'racing', name: 'Racing', icon: '🏎️', color: '#ef4444', count: 8 },
  { id: 'tennis', name: 'Tennis', icon: '🎾', color: '#eab308', count: 6 },
  { id: 'cricket', name: 'Cricket', icon: '🏏', color: '#06b6d4', count: 10 },
  { id: 'mma', name: 'MMA', icon: '🥊', color: '#8b5cf6', count: 4 },
]

/* ──────────────────────── Page Header ──────────────────────── */

function PageHeader({ title, subtitle, icon, onBack }: {
  title: string; subtitle?: string; icon: React.ReactNode; onBack?: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white touch-active">
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E50914]/10 text-[#E50914]">
        {icon}
      </div>
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
      </div>
    </div>
  )
}

/* ──────────────────────── Live Match Page ──────────────────────── */

function LiveMatchPage({ streams, videos }: { streams: StreamData[]; videos: VideoData[] }) {
  const store = useAppStore()
  const liveStreams = streams.filter(s => s.status === 'live')

  return (
    <div className="space-y-6 fade-in-up p-4 lg:p-5">
      <PageHeader title="Live Match" subtitle={`${liveStreams.length} live streams right now`} icon={<Radio className="h-5 w-5" />} />

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b3b] opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff3b3b]" /></span>
            <span className="text-[10px] text-white/40">LIVE</span>
          </div>
          <p className="text-2xl font-bold text-[#ff3b3b]">{liveStreams.length}</p>
          <p className="text-[10px] text-white/30">Live Now</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Eye className="h-4 w-4 text-[#E50914] mx-auto mb-1" />
          <p className="text-2xl font-bold text-[#E50914]">{formatNumber(liveStreams.reduce((s, v) => s + v.viewerCount, 0))}</p>
          <p className="text-[10px] text-white/30">Viewers</p>
        </div>
        <div className="glass-card p-3 text-center">
          <TrendingUp className="h-4 w-4 text-[#06b6d4] mx-auto mb-1" />
          <p className="text-2xl font-bold text-[#06b6d4]">{formatNumber(streams.reduce((m, s) => Math.max(m, s.peakViewers), 0))}</p>
          <p className="text-[10px] text-white/30">Peak</p>
        </div>
      </div>

      {/* Live Streams Grid */}
      <div>
        <h2 className="text-[15px] font-bold text-white mb-3">🔴 Currently Live</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {liveStreams.map((stream) => (
            <button
              key={stream.id}
              onClick={() => openLiveStream(stream, useAppStore)}
              className="glass-card glass-card-hover p-4 text-left transition-all active:scale-[0.98] touch-active"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="flex items-center gap-1.5 rounded-md bg-[#ff3b3b]/15 px-2 py-1 text-[10px] font-bold text-[#ff3b3b]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b3b] animate-pulse" />
                  LIVE
                </span>
                <span className="flex items-center gap-1 text-[11px] text-white/40">
                  <Eye className="h-3 w-3" /> {formatNumber(stream.viewerCount)}
                </span>
              </div>
              <p className="text-sm font-semibold text-white line-clamp-1">{stream.title}</p>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
                <div className="text-center">
                  <p className="text-xs font-bold text-white">{stream.homeTeam}</p>
                </div>
                <div className="text-center px-3">
                  <p className="text-lg font-black text-[#E50914]">{stream.homeScore} <span className="text-white/20">-</span> {stream.awayScore}</p>
                  <p className="text-[10px] text-white/30">{stream.matchTime || 'LIVE'}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white">{stream.awayTeam}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40 capitalize">{stream.category}</span>
                <span className="flex items-center gap-1 text-[10px] text-white/30">
                  <Zap className="h-3 w-3" /> {stream.fps || 60}fps
                </span>
              </div>
            </button>
          ))}
        </div>
        {liveStreams.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Radio className="h-10 w-10 text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/30">No live streams right now</p>
          </div>
        )}
      </div>

      {/* Upcoming */}
      {streams.filter(s => s.status === 'offline').length > 0 && (
        <div>
          <h2 className="text-[15px] font-bold text-white mb-3">📋 Upcoming</h2>
          <div className="space-y-2">
            {streams.filter(s => s.status === 'offline').slice(0, 5).map((stream) => (
              <div key={stream.id} className="glass-card flex items-center justify-between p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{stream.title}</p>
                  <p className="text-xs text-white/40">{stream.homeTeam} vs {stream.awayTeam}</p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium text-white/40">
                  {stream.matchTime || 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────── Popular Page ──────────────────────── */

function PopularPage({ videos }: { videos: VideoData[] }) {
  const store = useAppStore()
  const popular = [...videos].sort((a, b) => b.views - a.views)

  return (
    <div className="space-y-6 fade-in-up p-4 lg:p-5">
      <PageHeader title="Sportix Live - Popular" subtitle="Trending content right now" icon={<Sparkles className="h-5 w-5" />} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {popular.map((video, i) => (
          <div key={video.id} className="relative">
            {i < 3 && (
              <div className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-[10px] font-black text-white shadow-lg">
                {i + 1}
              </div>
            )}
            <VideoCard video={video} onSelect={(v) => openVideo(v, useAppStore)} />
          </div>
        ))}
      </div>
      {popular.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Sparkles className="h-10 w-10 text-white/10 mx-auto mb-2" />
          <p className="text-sm text-white/30">No popular content yet</p>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────── Sports Page ──────────────────────── */

function SportsPage({ streams, videos }: { streams: StreamData[]; videos: VideoData[] }) {
  const store = useAppStore()
  const [activeSport, setActiveSport] = useState<string | null>(null)

  const filteredStreams = activeSport ? streams.filter(s => s.category === activeSport) : streams
  const filteredVideos = activeSport ? videos.filter(v => v.category === activeSport || v.category === 'highlights') : videos

  return (
    <div className="space-y-6 fade-in-up p-4 lg:p-5">
      <PageHeader title="Sports" subtitle="Browse by category" icon={<Trophy className="h-5 w-5" />} />

      {/* Sport Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveSport(null)}
          className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all touch-active ${
            !activeSport ? 'bg-[#E50914]/10 text-[#E50914] ring-1 ring-[#E50914]/20' : 'bg-white/5 text-white/50 hover:bg-white/[0.08]'
          }`}
        >
          All Sports
        </button>
        {SPORTS_CATEGORIES.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setActiveSport(sport.id)}
            className={`flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all touch-active ${
              activeSport === sport.id ? 'bg-[#E50914]/10 text-[#E50914] ring-1 ring-[#E50914]/20' : 'bg-white/5 text-white/50 hover:bg-white/[0.08]'
            }`}
          >
            <span>{sport.icon}</span>
            <span>{sport.name}</span>
            <span className="text-[10px] text-white/20">{sport.count}</span>
          </button>
        ))}
      </div>

      {/* Live Streams for sport */}
      {filteredStreams.filter(s => s.status === 'live').length > 0 && (
        <div>
          <h2 className="text-[15px] font-bold text-white mb-3">🔴 Live Match Popular</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStreams.filter(s => s.status === 'live').map((stream) => (
              <button key={stream.id} onClick={() => openLiveStream(stream, useAppStore)} className="glass-card glass-card-hover p-4 text-left transition-all active:scale-[0.98] touch-active">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 rounded-md bg-[#ff3b3b]/15 px-2 py-0.5 text-[10px] font-bold text-[#ff3b3b]"><span className="h-1.5 w-1.5 rounded-full bg-[#ff3b3b] animate-pulse" /> LIVE</span>
                  <span className="text-[11px] text-white/40">{formatNumber(stream.viewerCount)} viewers</span>
                </div>
                <p className="text-sm font-semibold text-white line-clamp-1">{stream.homeTeam} vs {stream.awayTeam}</p>
                <p className="text-xs text-white/40">{stream.matchTime} · {stream.homeScore}-{stream.awayScore}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Videos for sport */}
      {filteredVideos.length > 0 && (
        <ContentSection title={activeSport ? `${activeSport.charAt(0).toUpperCase() + activeSport.slice(1)} Videos` : 'All Videos'} icon={<Trophy className="h-4 w-4 text-[#E50914]" />} viewAll>
          {filteredVideos.slice(0, 10).map((video) => (
            <VideoCard key={video.id} video={video} onSelect={(v) => openVideo(v, useAppStore)} />
          ))}
        </ContentSection>
      )}
    </div>
  )
}

/* ──────────────────────── Schedule Page ──────────────────────── */

function SchedulePage({ streams }: { streams: StreamData[] }) {
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all')
  const store = useAppStore()

  const items = SCHEDULE_DATA.filter(s => {
    if (filter === 'live') return s.status === 'live'
    if (filter === 'upcoming') return s.status === 'upcoming'
    return true
  })

  return (
    <div className="space-y-6 fade-in-up p-4 lg:p-5">
      <PageHeader title="Schedule" subtitle="Upcoming matches and events" icon={<Calendar className="h-5 w-5" />} />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'live', 'upcoming'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all touch-active ${
              filter === f ? 'bg-[#E50914]/10 text-[#E50914] ring-1 ring-[#E50914]/20' : 'bg-white/5 text-white/50 hover:bg-white/[0.08]'
            }`}
          >
            {f === 'all' ? 'All' : f === 'live' ? '🔴 Live' : '📋 Upcoming'}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              const liveStream = streams.find(s => s.status === 'live' && s.homeTeam === item.home)
              if (liveStream) {
                openLiveStream(liveStream, useAppStore)
              }
            }}
            className="glass-card glass-card-hover w-full flex items-center justify-between p-4 text-left transition-all active:scale-[0.98] touch-active"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex-shrink-0 text-center w-14">
                <p className="text-[10px] font-medium text-white/30">{item.date}</p>
                <p className="text-xs font-bold text-white">{item.time}</p>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">{item.home}</p>
                  <span className="text-xs text-[#E50914] font-bold">vs</span>
                  <p className="text-sm font-semibold text-white truncate">{item.away}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40">{item.league}</span>
                  <span className="text-[10px] text-white/20 capitalize">{item.category}</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-3">
              {item.status === 'live' ? (
                <span className="flex items-center gap-1.5 rounded-lg bg-[#ff3b3b]/15 px-3 py-1.5 text-[11px] font-bold text-[#ff3b3b]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b3b] animate-pulse" />
                  LIVE
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-[11px] text-white/40">
                  <Calendar className="h-3 w-3" />
                  {item.date}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────── Leagues Page ──────────────────────── */

function LeaguesPage() {
  const [activeLeague, setActiveLeague] = useState<string | null>(null)

  return (
    <div className="space-y-6 fade-in-up p-4 lg:p-5">
      <PageHeader title="Leagues" subtitle="Browse competitions worldwide" icon={<Award className="h-5 w-5" />} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {LEAGUES_DATA.map((league) => (
          <button
            key={league.name}
            onClick={() => setActiveLeague(league.name)}
            className={`glass-card p-4 text-left transition-all active:scale-[0.97] touch-active ${
              activeLeague === league.name ? 'ring-1 ring-[#E50914]/30 bg-[#E50914]/5' : ''
            }`}
          >
            <div className="text-3xl mb-2">{league.icon}</div>
            <p className="text-sm font-semibold text-white line-clamp-1">{league.name}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-white/30 flex items-center gap-1"><Globe className="h-3 w-3" /> {league.country}</span>
              <span className="text-[10px] text-white/20">{league.teams} teams</span>
            </div>
          </button>
        ))}
      </div>

      {activeLeague && (
        <div className="glass-card p-4 fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{LEAGUES_DATA.find(l => l.name === activeLeague)?.icon}</span>
              <h3 className="text-lg font-bold text-white">{activeLeague}</h3>
            </div>
            <button onClick={() => setActiveLeague(null)} className="text-xs text-[#E50914]">Close</button>
          </div>
          <div className="space-y-2">
            {[
              { home: 'Team A', away: 'Team B', time: 'Today 8:00 PM', status: 'live' },
              { home: 'Team C', away: 'Team D', time: 'Tomorrow 5:00 PM', status: 'upcoming' },
              { home: 'Team E', away: 'Team F', time: 'Sat 3:00 PM', status: 'upcoming' },
              { home: 'Team G', away: 'Team H', time: 'Sun 7:00 PM', status: 'upcoming' },
            ].map((match, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <p className="text-sm text-white">{match.home}</p>
                  <span className="text-xs text-[#E50914]">vs</span>
                  <p className="text-sm text-white">{match.away}</p>
                </div>
                <span className={`text-[10px] font-medium ${match.status === 'live' ? 'text-[#ff3b3b]' : 'text-white/30'}`}>
                  {match.status === 'live' ? '🔴 LIVE' : match.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────── Highlights Page ──────────────────────── */

function HighlightsPage({ videos }: { videos: VideoData[] }) {
  const store = useAppStore()
  const highlightVideos = videos.filter(v => v.category === 'highlights')

  return (
    <div className="space-y-6 fade-in-up p-4 lg:p-5">
      <PageHeader title="Highlights" subtitle={`${highlightVideos.length} clips available`} icon={<Flame className="h-5 w-5" />} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {highlightVideos.map((video) => (
          <VideoCard key={video.id} video={video} onSelect={(v) => openVideo(v, useAppStore)} />
        ))}
      </div>

      {highlightVideos.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Flame className="h-10 w-10 text-white/10 mx-auto mb-2" />
          <p className="text-sm text-white/30">No highlights available</p>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────── Favorites Page ──────────────────────── */

function FavoritesPage({ videos }: { videos: VideoData[] }) {
  const { favorites, toggleFavorite } = useAppStore()
  const store = useAppStore()
  const favVideos = videos.filter(v => favorites.includes(v.id))

  return (
    <div className="space-y-6 fade-in-up p-4 lg:p-5">
      <PageHeader title="Favorites" subtitle={`${favVideos.length} saved items`} icon={<Heart className="h-5 w-5" />} />

      {favVideos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {favVideos.map((video) => (
            <div key={video.id} className="relative">
              <button
                onClick={() => toggleFavorite(video.id)}
                className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-[#ff3b3b] transition-all hover:bg-[#ff3b3b]/20"
              >
                <Heart className="h-3.5 w-3.5 fill-[#ff3b3b]" />
              </button>
              <VideoCard video={video} onSelect={(v) => openVideo(v, useAppStore)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Heart className="h-10 w-10 text-white/10 mx-auto mb-2" />
          <p className="text-sm font-medium text-white/30">No favorites yet</p>
          <p className="mt-1 text-xs text-white/20">Tap the heart icon on any video to save it here</p>
          <button
            onClick={() => useAppStore.setState({ currentView: 'highlights' })}
            className="mt-4 rounded-xl bg-[#E50914]/10 px-4 py-2 text-xs font-medium text-[#E50914] ring-1 ring-[#E50914]/20"
          >
            Browse Highlights
          </button>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────── My List Page ──────────────────────── */

function MyListPage({ videos }: { videos: VideoData[] }) {
  const { myList, toggleMyList } = useAppStore()
  const store = useAppStore()
  const listVideos = videos.filter(v => myList.includes(v.id))

  return (
    <div className="space-y-6 fade-in-up p-4 lg:p-5">
      <PageHeader title="My List" subtitle={`${listVideos.length} items in your watchlist`} icon={<ListVideo className="h-5 w-5" />} />

      {listVideos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {listVideos.map((video) => (
            <div key={video.id} className="relative">
              <button
                onClick={() => toggleMyList(video.id)}
                className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-[#E50914] transition-all hover:bg-[#E50914]/20"
              >
                <ListVideo className="h-3.5 w-3.5" />
              </button>
              <VideoCard video={video} onSelect={(v) => openVideo(v, useAppStore)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <ListVideo className="h-10 w-10 text-white/10 mx-auto mb-2" />
          <p className="text-sm font-medium text-white/30">Your list is empty</p>
          <p className="mt-1 text-xs text-white/20">Add videos to your watchlist to watch them later</p>
          <button
            onClick={() => useAppStore.setState({ currentView: 'highlights' })}
            className="mt-4 rounded-xl bg-[#E50914]/10 px-4 py-2 text-xs font-medium text-[#E50914] ring-1 ring-[#E50914]/20"
          >
            Browse Highlights
          </button>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────── Settings Page ──────────────────────── */

function SettingsPage() {
  const { settings, updateSettings } = useAppStore()
  const session: any = null // No session required after auth removal

  const settingGroups = [
    {
      title: 'Playback', icon: <Monitor className="h-4 w-4" />,
      items: [
        { key: 'quality', label: 'Default Quality', type: 'select', options: ['auto', '1080p', '720p', '480p', '360p'], labels: ['Auto', '1080p', '720p', '480p', '360p'] },
        { key: 'autoplay', label: 'Autoplay Videos', type: 'toggle' },
        { key: 'dataSaver', label: 'Data Saver Mode', type: 'toggle' },
      ]
    },
    {
      title: 'Notifications', icon: <Bell className="h-4 w-4" />,
      items: [
        { key: 'notifications', label: 'Push Notifications', type: 'toggle' },
      ]
    },
    {
      title: 'Appearance', icon: <Moon className="h-4 w-4" />,
      items: [
        { key: 'darkMode', label: 'Dark Mode', type: 'toggle' },
        { key: 'language', label: 'Language', type: 'select', options: ['en', 'hi', 'es', 'pt'], labels: ['English', 'Hindi', 'Spanish', 'Portuguese'] },
      ]
    },
  ]

  return (
    <div className="space-y-6 fade-in-up p-4 lg:p-5">
      <PageHeader title="Settings" subtitle="Configure your preferences" icon={<Settings className="h-5 w-5" />} />

      {/* Profile Card */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#E50914] to-[#b20710] text-lg font-bold text-white">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">{session?.user?.name || 'Sportix User'}</p>
            <p className="text-xs text-white/40">{session?.user?.email || 'user@sportix.io'}</p>
          </div>
          <button className="rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/50 hover:bg-white/[0.08] transition-colors">
            Edit
          </button>
        </div>
      </div>

      {/* Premium Banner */}
      <div className="glass-card p-4 border-[#E50914]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E50914]/10">
              <Shield className="h-5 w-5 text-[#E50914]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Go Premium</p>
              <p className="text-xs text-white/40">Ad-free • 4K • Exclusive content</p>
            </div>
          </div>
          <button className="flex items-center gap-1 rounded-xl bg-[#E50914] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#c40812] active:scale-[0.97]">
            Upgrade <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Setting Groups */}
      {settingGroups.map((group) => (
        <div key={group.title} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4 text-white/60">
            {group.icon}
            <h3 className="text-sm font-semibold text-white">{group.title}</h3>
          </div>
          <div className="space-y-4">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{item.label}</span>
                {item.type === 'toggle' ? (
                  <button
                    onClick={() => updateSettings(item.key, !settings[item.key as keyof typeof settings])}
                    className={`relative h-6 w-11 rounded-full transition-all duration-200 ${
                      settings[item.key as keyof typeof settings] ? 'bg-[#E50914]' : 'bg-white/10'
                    }`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                      settings[item.key as keyof typeof settings] ? 'left-[22px]' : 'left-0.5'
                    }`} />
                  </button>
                ) : item.type === 'select' ? (
                  <select
                    value={settings[item.key as keyof typeof settings] as string}
                    onChange={(e) => updateSettings(item.key, e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-[#E50914]/30 focus:outline-none"
                  >
                    {(item as any).options.map((opt: string, i: number) => (
                      <option key={opt} value={opt}>{(item as any).labels[i]}</option>
                    ))}
                  </select>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* About */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between text-xs text-white/30">
          <span>Sportix Live v2.0</span>
          <span className="flex items-center gap-1"><Wifi className="h-3 w-3 text-[#E50914]" /> Connected</span>
        </div>
      </div>

    </div>
  )
}

/* ──────────────────────── Suspense Loading Fallback ──────────────────────── */
function AdminLoadingFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#141414' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E50914]/20 border-t-[#E50914]" />
        <p className="text-xs text-white/25">Loading Admin Panel...</p>
      </div>
    </div>
  )
}

/* ──────────────────────── Admin Login Dialog ──────────────────────── */

function AdminLoginDialog() {
  const { showAdminLogin, setShowAdminLogin, setCurrentView, setAdminAuthenticated } = useAppStore()
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showAdminLogin) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showAdminLogin])

  const handleLogin = async () => {
    setError('')
    if (!adminId.trim()) { setError('Admin ID is required'); return }
    if (!password.trim()) { setError('Password is required'); return }
    setLoading(true)
    // Simulate auth check
    await new Promise(r => setTimeout(r, 600))
    // Default credentials: admin / admin123
    if (adminId.trim() === 'admin' && password.trim() === 'admin123') {
      setAdminAuthenticated(true)
      setShowAdminLogin(false)
      setCurrentView('admin')
      setAdminId('')
      setPassword('')
    } else {
      setError('Invalid Admin ID or Password')
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  if (!showAdminLogin) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAdminLogin(false)}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl fade-in-up" style={{ background: '#181818' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E50914]/10 mb-3">
            <Lock className="h-7 w-7 text-[#E50914]" />
          </div>
          <h2 className="text-lg font-bold text-white">Admin Access</h2>
          <p className="text-xs text-white/40 mt-1">Enter your admin credentials to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 mb-4">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1.5">Admin ID</label>
            <input
              ref={inputRef}
              type="text"
              value={adminId}
              onChange={e => { setAdminId(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="Enter Admin ID"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[#E50914]/40 focus:outline-none focus:ring-1 focus:ring-[#E50914]/20 transition-all"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={handleKeyDown}
                placeholder="Enter Password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/20 focus:border-[#E50914]/40 focus:outline-none focus:ring-1 focus:ring-[#E50914]/20 transition-all"
                autoComplete="off"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#c40812] active:scale-[0.98] disabled:opacity-50 mt-2"
            style={{ boxShadow: '0 4px 20px rgba(229,9,20,0.3)' }}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Access Admin Panel
              </>
            )}
          </button>

          <button
            onClick={() => { setShowAdminLogin(false); setAdminId(''); setPassword(''); setError('') }}
            className="w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                        MAIN PAGE                               ║
   ═══════════════════════════════════════════════════════════════════ */

export default function Home() {
  const { currentView, favorites, myList, toggleFavorite, toggleMyList, settings, updateSettings, showAdminLogin } = useAppStore()
  const session = useRef<any>(null).current

  const [streams, setStreams] = useState<StreamData[]>([])
  const [videos, setVideos] = useState<VideoData[]>([])
  const [continueWatching, setContinueWatching] = useState<ContinueData[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const loadData = useCallback(async () => {
    try {
      const [streamsRes, videosRes] = await Promise.all([
        fetch('/api/streams', { signal: AbortSignal.timeout(5000) }).catch(() => null),
        fetch('/api/videos', { signal: AbortSignal.timeout(5000) }).catch(() => null),
      ])
      // Safely parse streams — skip if response is not valid JSON
      if (streamsRes && streamsRes.ok) {
        try {
          const ct = streamsRes.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            const streamsData = await streamsRes.json()
            if (Array.isArray(streamsData)) setStreams(streamsData)
          }
        } catch { /* skip bad response */ }
      }
      // Safely parse videos
      if (videosRes && videosRes.ok) {
        try {
          const ct = videosRes.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            const videosData = await videosRes.json()
            if (Array.isArray(videosData)) setVideos(videosData)
          }
        } catch { /* skip bad response */ }
      }

      // Load continue watching from localStorage (client-only)
      try {
        const saved = localStorage.getItem('sportix-continue')
        if (saved) {
          setContinueWatching(JSON.parse(saved))
        } else {
          setContinueWatching([
            { id: 'cw1', videoId: 'cw1', title: 'Man City Road to UCL Final', thumbnail: '/thumbnails/ucl-semi.png', duration: 1200, progress: 0.65, watchedAt: new Date().toISOString() },
            { id: 'cw2', videoId: 'cw2', title: 'NBA Playoffs Game 3 Highlights', thumbnail: '/thumbnails/nba-playoffs.png', duration: 900, progress: 0.32, watchedAt: new Date().toISOString() },
            { id: 'cw3', videoId: 'cw3', title: 'Premier League Review Show', thumbnail: '/thumbnails/epl-goals.png', duration: 2700, progress: 0.88, watchedAt: new Date().toISOString() },
          ])
        }
      } catch { /* localStorage not available */ }
    } catch {
      // Silent fail — data will remain empty, UI shows empty states
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    fetch('/api/admin/seed').catch(() => {})
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  // Real-time socket connection for live stream updates
  useEffect(() => {
    let socket: any = null
    try {
      // Dynamic import to avoid bundling socket.io when not needed
      import('socket.io-client').then(({ io: socketIo }) => {
        try {
          socket = socketIo('/?XTransformPort=3005', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            timeout: 5000,
          })

          socket.on('stream-went-live', (data: any) => {
            setStreams(prev => {
              const exists = prev.find(s => s.id === data.streamId)
              if (exists) {
                return prev.map(s => s.id === data.streamId ? { ...s, status: 'live', ...data } : s)
              }
              return [{
                id: data.streamId,
                title: data.title,
                category: data.category,
                status: 'live',
                viewerCount: 0,
                peakViewers: 0,
                homeTeam: data.homeTeam || '',
                awayTeam: data.awayTeam || '',
                homeScore: 0,
                awayScore: 0,
                matchTime: '0:00',
                isFeatured: true,
                createdAt: new Date().toISOString(),
              }, ...prev]
            })
          })

          socket.on('stream-went-offline', (data: any) => {
            setStreams(prev => prev.map(s =>
              s.id === data.streamId
                ? { ...s, status: 'offline' as const, isFeatured: false }
                : s
            ))
          })

          socket.on('score-update', (data: any) => {
            setStreams(prev => prev.map(s =>
              s.id === data.streamId
                ? { ...s, homeScore: data.homeScore, awayScore: data.awayScore, matchTime: data.matchTime }
                : s
            ))
          })

          socket.on('viewer-update', (data: any) => {
            setStreams(prev => prev.map(s =>
              s.id === data.streamId
                ? { ...s, viewerCount: data.count, peakViewers: Math.max(s.peakViewers, data.count) }
                : s
            ))
          })

          socket.on('connect_error', (err: any) => {
            console.warn('Socket connection failed:', err.message)
          })
        } catch (innerErr) {
          console.warn('Socket init error:', innerErr)
        }
      }).catch(() => {
        // socket.io-client not available, skip real-time features
      })
    } catch (err) {
      console.warn('Socket import error:', err)
    }

    return () => {
      if (socket) {
        try { socket.disconnect() } catch (e) { /* ignore */ }
      }
    }
  }, [])

  // ── Player (full-screen, no layout) ──
  if (currentView === 'player') return <VideoPlayer />

  // ── Admin Panel: lazy loaded ──
  if (currentView === 'admin' || currentView === 'live-control-room') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<AdminLoadingFallback />}>
          {currentView === 'admin' ? <AdminPanel /> : <LiveControlRoom />}
        </Suspense>
      </ErrorBoundary>
    )
  }

  // ── Derived data ──
  const liveStreams = streams.filter(s => s.status === 'live')
  const featuredVideos = videos.filter(v => v.isFeatured)
  const highlightVideos = videos.filter(v => v.category === 'highlights')
  const filteredVideos = activeFilter === 'all' ? videos : videos.filter(v => v.category === activeFilter)

  // ── Route to the correct page content ──
  const renderMainContent = () => {
    if (currentView === 'live') return <LiveMatchPage streams={streams} videos={videos} />
    if (currentView === 'popular') return <PopularPage videos={videos} />
    if (currentView === 'dashboard') return (
      <Suspense fallback={<div className="flex items-center justify-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E50914]/20 border-t-[#E50914]" /></div>}>
        <UserDashboard />
      </Suspense>
    )
    if (currentView === 'sports') return <SportsPage streams={streams} videos={videos} />
    if (currentView === 'schedule') return <SchedulePage streams={streams} />
    if (currentView === 'leagues') return <LeaguesPage />
    if (currentView === 'highlights') return <HighlightsPage videos={videos} />
    if (currentView === 'favorites') return <FavoritesPage videos={videos} />
    if (currentView === 'mylist') return <MyListPage videos={videos} />
    if (currentView === 'settings') return <SettingsPage />
    if (currentView === 'replay') return (
      <Suspense fallback={<div className="flex items-center justify-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E50914]/20 border-t-[#E50914]" /></div>}>
        <ReplaySection />
      </Suspense>
    )

    // Default: Home page content
    if (loading) {
      return (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E50914]/20 border-t-[#E50914]" />
            <p className="text-xs text-white/25">Loading...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-8 p-4 lg:p-5">
        {/* Category Tabs — mobile */}
        <div className="lg:hidden">
          <CategoryTabs onFilter={setActiveFilter} />
        </div>

        {/* Hero Banner Ads — responsive, video/image support */}
        <HeroBannerAds />

        {/* Live Match Popular Slider */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Radio className="h-4 w-4 text-[#ff3b3b]" />
              <h2 className="text-[15px] font-bold text-white">Live Match Popular</h2>
              <span className="flex items-center gap-1 rounded-md bg-[#ff3b3b]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#ff3b3b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b3b] animate-pulse" />
                {liveStreams.length}
              </span>
            </div>
            <button onClick={() => useAppStore.getState().setCurrentView('live')} className="flex items-center gap-1 text-[12px] font-medium text-[#E50914]">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <LiveSlider streams={streams} />
        </section>

        {/* Continue Watching — all screens */}
        {continueWatching.length > 0 && (
          <section className="fade-in-up">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#f59e0b]" />
                <h2 className="text-[15px] font-bold text-white">Continue Watching</h2>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {continueWatching.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    const saved = localStorage.getItem('sportix-continue')
                    if (saved) {
                      const arr = JSON.parse(saved)
                      const updated = arr.filter((c: ContinueData) => c.id !== item.id)
                      localStorage.setItem('sportix-continue', JSON.stringify(updated))
                    }
                    setContinueWatching(prev => prev.filter(c => c.id !== item.id))
                  }}
                  className="flex-shrink-0 w-[200px] sm:w-[220px] overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] text-left transition-all active:scale-[0.98] touch-active"
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
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div className="h-full bg-[#E50914]" style={{ width: `${item.progress * 100}%` }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                        <Play className="h-3 w-3 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-[11px] font-medium text-white/80 line-clamp-1">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Popular / Top Picks */}
        {featuredVideos.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Star className="h-4 w-4 text-[#E50914]" />
                <h2 className="text-[15px] font-bold text-white">Top Picks For You</h2>
              </div>
              <button onClick={() => useAppStore.getState().setCurrentView('popular')} className="flex items-center gap-1 text-[12px] font-medium text-[#E50914]">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {featuredVideos.map((video) => (
                <div key={video.id} className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(video.id) }}
                    className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60"
                    title="Add to favorites"
                  >
                    <Heart className={`h-3.5 w-3.5 transition-colors ${favorites.includes(video.id) ? 'text-[#ff3b3b] fill-[#ff3b3b]' : 'text-white/60'}`} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMyList(video.id) }}
                    className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60"
                    title="Add to my list"
                  >
                    <ListVideo className={`h-3.5 w-3.5 transition-colors ${myList.includes(video.id) ? 'text-[#E50914]' : 'text-white/60'}`} />
                  </button>
                  <VideoCard video={video} onSelect={(v) => openVideo(v, useAppStore)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Highlights */}
        {highlightVideos.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Flame className="h-4 w-4 text-[#ff3b3b]" />
                <h2 className="text-[15px] font-bold text-white">Highlights</h2>
              </div>
              <button onClick={() => useAppStore.getState().setCurrentView('highlights')} className="flex items-center gap-1 text-[12px] font-medium text-[#E50914]">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {highlightVideos.map((video) => (
                <VideoCard key={video.id} video={video} onSelect={(v) => openVideo(v, useAppStore)} />
              ))}
            </div>
          </section>
        )}

        {/* Filtered / All Videos */}
        {filteredVideos.length > 0 && activeFilter !== 'all' && (
          <ContentSection
            title={`${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`}
            icon={<TrendingUp className="h-4 w-4 text-[#06b6d4]" />}
            viewAll
          >
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} onSelect={(v) => openVideo(v, useAppStore)} />
            ))}
          </ContentSection>
        )}

        {/* Empty state */}
        {streams.length === 0 && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">
              <TrendingUp className="h-7 w-7 text-white/10" />
            </div>
            <h3 className="text-sm font-semibold text-white/50">No content yet</h3>
            <p className="mt-1 text-xs text-white/25">Check back soon for live matches and highlights</p>
          </div>
        )}
      </div>
    )
  }

  // ── Shared layout for ALL non-player/admin views ──
  return (
      <ErrorBoundary>
      <div className="sportix-bg min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-20 lg:pb-4">
            {renderMainContent()}
          </main>
        </div>

        {/* Footer Top Sponsored Banner */}
        <Suspense fallback={null}>
          <FooterTopBanner />
        </Suspense>

        {/* Footer — desktop */}
        <footer className="hidden border-t border-white/[0.06] bg-[#080c16]/50 py-4 lg:block">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#E50914] to-[#b20710]">
                <span className="text-white text-[10px] font-black">S</span>
              </div>
              <span className="text-xs font-semibold text-white/30">
                Sportix <span className="text-[#E50914]/30">Live</span>
              </span>
            </div>
            <p className="text-[10px] text-white/15">© 2025 Sportix Live. All rights reserved.</p>
          </div>
        </footer>

        <BottomNav />
        {/* ── Admin Login Dialog ── */}
        <ErrorBoundary>
          {showAdminLogin && <AdminLoginDialog />}
        </ErrorBoundary>
      </div>
      </ErrorBoundary>
  )
}
