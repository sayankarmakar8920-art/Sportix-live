'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  LayoutDashboard, Activity, Users, Radio, Video, BarChart3,
  Settings, AlertTriangle, Clock, RefreshCw, ChevronRight,
  TrendingUp, DollarSign, Eye, Server, HardDrive, Search,
  Filter, Upload, Trash2, MoreHorizontal, Menu, X, ArrowLeft,
  Zap, Wifi, Globe, Film, Bell, Shield, LogOut, ClipboardList,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */

const C = {
  bg: '#121212',
  sidebar: '#1a1a1a',
  card: '#1e1e1e',
  cardHover: '#252525',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.12)',
  accent: '#e63946',
  accentDim: 'rgba(230,57,70,0.12)',
  accentGlow: 'rgba(230,57,70,0.25)',
  success: '#2ecc71',
  successDim: 'rgba(46,204,113,0.12)',
  info: '#3498db',
  infoDim: 'rgba(52,152,219,0.12)',
  warning: '#f39c12',
  warningDim: 'rgba(243,156,18,0.12)',
  purple: '#9b59b6',
  purpleDim: 'rgba(155,89,182,0.12)',
  text: '#ffffff',
  textSec: '#a0a0a0',
  textTer: '#707070',
  textDim: '#505050',
}

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type Page = 'dashboard' | 'live-control' | 'live-monitor' | 'users' | 'videos' | 'highlights' | 'analytics' | 'revenue' | 'settings' | 'activity-logs'

interface NavItem {
  id: Page
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  badge?: string
  badgeColor?: string
}

interface NavSection {
  label: string | null
  items: NavItem[]
}

interface StreamItem {
  id: string; title: string; category: string; status: string
  viewerCount: number; peakViewers: number; homeTeam: string; awayTeam: string
  homeScore: number; awayScore: number; matchTime: string
  fps: number; bitrate: number; isFeatured: boolean; createdAt: string
}

interface VideoItem {
  id: string; title: string; category: string; views: number
  duration: number; isFeatured: boolean; createdAt: string
}

interface SystemHealth {
  uptime: string; cpu: number; memory: number; disk: number; status: string
}

interface ActivityItem {
  id: string; type: string; message: string; timestamp: string
}

interface UserItem {
  id: string; username: string; status: string; lastSeen: string
}

interface DashboardData {
  success: boolean; timestamp: string
  data: {
    overview: { totalStreams: number; liveStreams: number; totalVideos: number; totalViewers: number; peakViewers: number }
    streams: StreamItem[]
    videos: VideoItem[]
    systemHealth: SystemHealth
    recentActivity: ActivityItem[]
    topPerforming: { id: string; title: string; views: number }[]
    liveUsers: UserItem[]
  }
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */

const navSections: NavSection[] = [
  { label: 'MAIN', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-control', label: 'Live Control', icon: Radio, badge: 'LIVE', badgeColor: C.accent },
  ]},
  { label: 'MONITORING', items: [
    { id: 'live-monitor', label: 'Live Monitor', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'highlights', label: 'Highlights', icon: Zap },
  ]},
  { label: 'ANALYTICS', items: [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ]},
  { label: 'SYSTEM', items: [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'activity-logs', label: 'Activity Logs', icon: ClipboardList },
  ]},
]

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function fmtShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${s}s`
}

function getHealthColor(cpu: number): string {
  if (cpu < 50) return C.success
  if (cpu < 75) return C.warning
  return C.accent
}

function activityIcon(type: string) {
  switch (type) {
    case 'stream': return <Radio className="h-3.5 w-3.5" />
    case 'peak': return <TrendingUp className="h-3.5 w-3.5" />
    case 'system': return <Server className="h-3.5 w-3.5" />
    case 'user': return <Users className="h-3.5 w-3.5" />
    case 'alert': return <AlertTriangle className="h-3.5 w-3.5" />
    case 'content': return <Film className="h-3.5 w-3.5" />
    default: return <Bell className="h-3.5 w-3.5" />
  }
}

function activityColor(type: string): string {
  switch (type) {
    case 'stream': return C.accent
    case 'peak': return C.success
    case 'system': return C.info
    case 'user': return C.purple
    case 'alert': return C.warning
    case 'content': return '#e6a817'
    default: return C.textTer
  }
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON LOADING
   ═══════════════════════════════════════════════════════════════ */

function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)', ...style }}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border p-5" style={{ background: C.card, borderColor: C.border }}>
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-7 w-28 mb-3" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border p-0 overflow-hidden" style={{ background: C.card, borderColor: C.border }}>
      <div className="flex gap-4 p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          {[1, 2, 3, 4, 5].map((j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border transition-all duration-200 ${className}`} style={{ background: C.card, borderColor: C.border, ...style }}>
      {children}
    </div>
  )
}

function StatusBadge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide"
      style={{ background: `${color}18`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {text}
    </span>
  )
}

function ProgressBar({ value, color, label, showValue = true }: { value: number; color: string; label: string; showValue?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium" style={{ color: C.textTer }}>{label}</span>
        {showValue && <span className="text-[11px] font-semibold text-white">{value}%</span>}
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(100, value)}%`, background: color }}
        />
      </div>
    </div>
  )
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ background: enabled ? C.success : 'rgba(255,255,255,0.1)', focusVisibleRingColor: C.success }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex h-8 items-end gap-[2px]">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all duration-500" style={{ height: `${(v / max) * 100}%`, background: `${color}35` }} />
      ))}
    </div>
  )
}

function PageHeader({ title, subtitle, icon, color }: { title: string; subtitle: string; icon: React.ReactNode; color?: string }) {
  const c = color || C.accent
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${c}15` }}>
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-xs" style={{ color: C.textTer }}>{subtitle}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   1. DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════════ */

function DashboardPage({ data }: { data: DashboardData }) {
  const { overview, streams, videos, systemHealth, recentActivity, topPerforming } = data.data
  const liveStreams = streams.filter(s => s.status === 'live')
  const healthColor = getHealthColor(systemHealth.cpu)

  const overviewCards = [
    { label: 'Total Streams', value: fmt(overview.totalStreams), icon: Radio, color: C.info, sparkline: [3, 5, 4, 6, 7, 6, overview.totalStreams % 20 + 5] },
    { label: 'Live Now', value: String(overview.liveStreams), icon: Zap, color: C.accent, sparkline: [1, 2, 3, 2, 4, 3, overview.liveStreams] },
    { label: 'Total Videos', value: fmt(overview.totalVideos), icon: Film, color: C.purple, sparkline: [10, 15, 13, 18, 16, 20, overview.totalVideos % 30 + 10] },
    { label: 'Total Viewers', value: fmt(overview.totalViewers), icon: Eye, color: C.success, sparkline: [50, 65, 55, 70, 80, 75, overview.totalViewers % 100 + 50] },
    { label: 'Peak Viewers', value: fmt(overview.peakViewers), icon: TrendingUp, color: C.warning, sparkline: [30, 40, 35, 50, 45, 55, overview.peakViewers % 100 + 30] },
  ]

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {overviewCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{s.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                  <Icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <div className="mt-2">
                <MiniBarChart data={s.sparkline} color={s.color} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Live Streams Table + Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Live Streams */}
        <Card className="xl:col-span-2 !p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Live Streams</h3>
              <span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: C.accent }}>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {liveStreams.length}
              </span>
            </div>
            <button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Match', 'Category', 'Score', 'Viewers', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liveStreams.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate max-w-[200px]">{s.title}</p>
                          <p className="text-[10px]" style={{ color: C.textTer }}>{s.homeTeam} vs {s.awayTeam}</p>
                        </div>
                        {s.isFeatured && (
                          <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: C.warningDim, color: C.warning }}>★</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] capitalize font-medium px-2 py-0.5 rounded-full" style={{ background: `${C.info}12`, color: C.info }}>{s.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-white">{s.homeScore} - {s.awayScore}</span>
                      <span className="text-[10px] ml-1.5" style={{ color: C.textTer }}>{s.matchTime}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" style={{ color: C.success }} />
                        <span className="text-xs font-semibold" style={{ color: C.success }}>{fmt(s.viewerCount)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge text="LIVE" color={C.accent} />
                    </td>
                  </tr>
                ))}
                {liveStreams.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <p className="text-xs" style={{ color: C.textTer }}>No live streams</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            <StatusBadge text="Live" color={C.success} />
          </div>
          <div className="space-y-1 max-h-[340px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
            {recentActivity.map((act) => {
              const color = activityColor(act.type)
              return (
                <div key={act.id} className="flex gap-3 p-2.5 rounded-xl transition-colors hover:bg-white/[0.03]">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg mt-0.5" style={{ background: `${color}15`, color }}>
                    {activityIcon(act.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white leading-relaxed line-clamp-2">{act.message}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-2.5 w-2.5" style={{ color: C.textDim }} />
                      <span className="text-[9px]" style={{ color: C.textDim }}>{timeAgo(act.timestamp)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* System Health + Top Performing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Health */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">System Health</h3>
            <StatusBadge text={systemHealth.status === 'healthy' ? 'Healthy' : 'Warning'} color={systemHealth.status === 'healthy' ? C.success : C.warning} />
          </div>
          <div className="space-y-4">
            <ProgressBar value={systemHealth.cpu} color={getHealthColor(systemHealth.cpu)} label="CPU Usage" />
            <ProgressBar value={systemHealth.memory} color={systemHealth.memory > 80 ? C.warning : C.info} label="Memory Usage" />
            <ProgressBar value={systemHealth.disk} color={systemHealth.disk > 80 ? C.accent : C.purple} label="Disk Usage" />
            <ProgressBar value={35 + Math.round(Math.random() * 20)} color={C.success} label="Network I/O" />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Server className="h-4 w-4" style={{ color: C.textTer }} />
            <span className="text-[11px]" style={{ color: C.textTer }}>Uptime: <span className="text-white font-medium">{systemHealth.uptime}</span></span>
          </div>
        </Card>

        {/* Top Performing */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Top Performing</h3>
            <button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button>
          </div>
          <div className="space-y-3">
            {topPerforming.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.03]">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold" style={{ background: i === 0 ? C.warningDim : i === 1 ? 'rgba(255,255,255,0.06)' : i === 2 ? 'rgba(205,127,50,0.12)' : 'rgba(255,255,255,0.04)', color: i === 0 ? C.warning : i === 1 ? C.textSec : i === 2 ? '#cd7f32' : C.textTer }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{v.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Eye className="h-3 w-3" style={{ color: C.textDim }} />
                    <span className="text-[10px]" style={{ color: C.textTer }}>{fmt(v.views)} views</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: C.textDim }} />
              </div>
            ))}
            {topPerforming.length === 0 && (
              <div className="py-8 text-center">
                <Film className="h-8 w-8 mx-auto mb-2" style={{ color: C.textDim }} />
                <p className="text-xs" style={{ color: C.textTer }}>No videos yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   2. LIVE CONTROL PAGE
   ═══════════════════════════════════════════════════════════════ */

function LiveControlPage({ data }: { data: DashboardData }) {
  const liveStreams = data.data.streams.filter(s => s.status === 'live')
  const [title, setTitle] = useState('New Live Stream')
  const [category, setCategory] = useState('football')
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')

  return (
    <div className="space-y-5 animate-fadeIn">
      <PageHeader title="Live Control" subtitle="Manage and start live streams" icon={<Radio className="h-5 w-5" style={{ color: C.accent }} />} />

      {/* Go Live Form */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Start New Stream</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.textTer }}>Stream Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
              style={{ borderColor: C.border }}
              placeholder="Enter stream title..."
            />
          </div>
          <div>
            <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.textTer }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
              style={{ borderColor: C.border, background: C.card }}
            >
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="racing">Racing</option>
              <option value="tennis">Tennis</option>
              <option value="cricket">Cricket</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.textTer }}>Home Team</label>
            <input
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
              style={{ borderColor: C.border }}
              placeholder="Home team name..."
            />
          </div>
          <div>
            <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.textTer }}>Away Team</label>
            <input
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
              style={{ borderColor: C.border }}
              placeholder="Away team name..."
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: C.accent }}
          >
            <Radio className="h-4 w-4" />
            Go Live
          </button>
          <button
            className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all hover:bg-white/[0.03]"
            style={{ borderColor: C.border, color: C.textSec }}
          >
            <Settings className="h-4 w-4" />
            Stream Settings
          </button>
        </div>
      </Card>

      {/* Active Streams */}
      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold text-white">Active Streams ({liveStreams.length})</h3>
        </div>
        {liveStreams.length === 0 ? (
          <div className="p-12 text-center">
            <Radio className="h-10 w-10 mx-auto mb-3" style={{ color: C.textDim }} />
            <p className="text-sm" style={{ color: C.textTer }}>No active streams</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: C.border }}>
            {liveStreams.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.title}</p>
                    <p className="text-[11px]" style={{ color: C.textTer }}>{s.homeTeam} vs {s.awayTeam} · {fmt(s.viewerCount)} viewers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold" style={{ color: C.success }}>{s.homeScore} - {s.awayScore}</span>
                  <button
                    className="rounded-lg px-3 py-1.5 text-[10px] font-semibold border transition-colors hover:bg-red-500/10"
                    style={{ borderColor: `${C.accent}30`, color: C.accent }}
                  >
                    End Stream
                  </button>
                  <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   3. LIVE MONITOR PAGE
   ═══════════════════════════════════════════════════════════════ */

function LiveMonitorPage({ data }: { data: DashboardData }) {
  const liveStreams = data.data.streams.filter(s => s.status === 'live')
  const totalViewers = liveStreams.reduce((a, s) => a + s.viewerCount, 0)

  const statsCards = [
    { label: 'Active Streams', value: String(liveStreams.length), icon: Radio, color: C.accent },
    { label: 'Total Viewers', value: fmt(totalViewers), icon: Eye, color: C.success },
    { label: 'Peak Today', value: fmt(data.data.overview.peakViewers), icon: TrendingUp, color: C.warning },
    { label: 'Avg Bitrate', value: `${Math.round(liveStreams.reduce((a, s) => a + s.bitrate, 0) / Math.max(liveStreams.length, 1))} kbps`, icon: Wifi, color: C.info },
  ]

  return (
    <div className="space-y-5 animate-fadeIn">
      <PageHeader title="Live Monitor" subtitle={`${liveStreams.length} streams being monitored`} icon={<Activity className="h-5 w-5" style={{ color: C.accent }} />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{s.label}</span>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </Card>
          )
        })}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold text-white">Stream Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Stream', 'Category', 'Viewers', 'Peak', 'FPS', 'Bitrate', 'Health', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveStreams.map((s) => {
                const healthStatus = s.fps >= 50 ? 'Excellent' : s.fps >= 30 ? 'Good' : 'Poor'
                const healthColor = healthStatus === 'Excellent' ? C.success : healthStatus === 'Good' ? C.warning : C.accent
                return (
                  <tr key={s.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate max-w-[180px]">{s.title}</p>
                          <p className="text-[10px]" style={{ color: C.textTer }}>{s.homeTeam} vs {s.awayTeam}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] capitalize font-medium px-2 py-0.5 rounded-full" style={{ background: `${C.info}12`, color: C.info }}>{s.category}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: C.success }}>{fmt(s.viewerCount)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.textSec }}>{fmt(s.peakViewers)}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: C.textSec }}>{s.fps}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: C.textSec }}>{s.bitrate}</td>
                    <td className="px-4 py-3"><StatusBadge text={healthStatus} color={healthColor} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="rounded-lg px-2.5 py-1 text-[10px] font-semibold border transition-colors hover:bg-red-500/10" style={{ borderColor: `${C.accent}30`, color: C.accent }}>End</button>
                        <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><MoreHorizontal className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {liveStreams.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2" style={{ color: C.textDim }} />
                    <p className="text-xs" style={{ color: C.textTer }}>No live streams to monitor</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   4. USERS PAGE
   ═══════════════════════════════════════════════════════════════ */

function UsersPage({ data }: { data: DashboardData }) {
  const [search, setSearch] = useState('')
  const users = data.data.liveUsers
  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()))

  const onlineCount = users.filter(u => u.status === 'online').length

  return (
    <div className="space-y-5 animate-fadeIn">
      <PageHeader title="Users" subtitle={`${users.length} users · ${onlineCount} online`} icon={<Users className="h-5 w-5" style={{ color: C.info }} />} />

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
            <Search className="h-4 w-4" style={{ color: C.textDim }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}>
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['User', 'Status', 'Role', 'Last Seen', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: `${C.purple}25` }}>
                        {u.username.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs font-medium text-white">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      text={u.status === 'online' ? 'Online' : u.status === 'idle' ? 'Idle' : 'Offline'}
                      color={u.status === 'online' ? C.success : u.status === 'idle' ? C.warning : C.textTer}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: u.id === 'user-1' ? C.accentDim : `${C.info}10`, color: u.id === 'user-1' ? C.accent : C.info }}>
                      {u.id === 'user-1' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[11px]" style={{ color: C.textTer }}>{u.lastSeen}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Eye className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Shield className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10" style={{ color: C.accent }}><LogOut className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2" style={{ color: C.textDim }} />
                    <p className="text-xs" style={{ color: C.textTer }}>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <span className="text-[11px]" style={{ color: C.textTer }}>Showing {filtered.length} of {users.length} users</span>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   5. VIDEOS PAGE
   ═══════════════════════════════════════════════════════════════ */

function VideosPage({ data }: { data: DashboardData }) {
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [search, setSearch] = useState('')
  const videos = data.data.videos
  const filtered = videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5 animate-fadeIn">
      <PageHeader title="Videos" subtitle={`${videos.length} videos in library`} icon={<Video className="h-5 w-5" style={{ color: C.purple }} />} />

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
            <Search className="h-4 w-4" style={{ color: C.textDim }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}>
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Video', 'Category', 'Views', 'Duration', 'Featured', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `${C.purple}15` }}>
                          <Film className="h-4 w-4" style={{ color: C.purple }} />
                        </div>
                        <span className="text-xs font-medium text-white max-w-[200px] truncate">{v.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] capitalize font-medium px-2 py-0.5 rounded-full" style={{ background: `${C.info}12`, color: C.info }}>{v.category}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" style={{ color: C.textTer }} />
                        <span className="text-xs text-white">{fmt(v.views)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: C.textSec }}>{formatDuration(v.duration)}</td>
                    <td className="px-5 py-3">
                      {v.isFeatured && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.warningDim, color: C.warning }}>★ FEATURED</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[10px]" style={{ color: C.textTer }}>{timeAgo(v.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Eye className="h-3.5 w-3.5" /></button>
                        <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Upload className="h-3.5 w-3.5" /></button>
                        <button className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10" style={{ color: C.accent }}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <Video className="h-8 w-8 mx-auto mb-2" style={{ color: C.textDim }} />
                      <p className="text-xs" style={{ color: C.textTer }}>No videos found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
            <span className="text-[11px]" style={{ color: C.textTer }}>Showing {filtered.length} of {videos.length} videos</span>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v) => (
            <Card key={v.id} className="p-3 hover:border-white/10 cursor-pointer transition-all">
              <div className="flex h-28 items-center justify-center rounded-xl mb-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Film className="h-8 w-8" style={{ color: C.textDim }} />
              </div>
              <p className="text-xs font-medium text-white line-clamp-2 mb-2">{v.title}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" style={{ color: C.textDim }} />
                  <span className="text-[10px]" style={{ color: C.textTer }}>{fmt(v.views)}</span>
                </div>
                {v.isFeatured && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: C.warningDim, color: C.warning }}>★</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   6. HIGHLIGHTS PAGE
   ═══════════════════════════════════════════════════════════════ */

function HighlightsPage({ data }: { data: DashboardData }) {
  const highlights = data.data.videos.filter(v => v.category === 'highlights')
  const featured = highlights.filter(v => v.isFeatured)

  return (
    <div className="space-y-5 animate-fadeIn">
      <PageHeader title="Highlights" subtitle={`${highlights.length} highlight clips`} icon={<Zap className="h-5 w-5" style={{ color: C.warning }} />} />

      {featured.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Featured Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.slice(0, 3).map((v) => (
              <div key={v.id} className="rounded-xl border p-3 transition-all hover:bg-white/[0.03] cursor-pointer" style={{ borderColor: `${C.warning}20`, background: C.warningDim }}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.warning, color: '#000' }}>★ FEATURED</span>
                  <span className="text-[10px]" style={{ color: C.textTer }}>{formatDuration(v.duration)}</span>
                </div>
                <p className="text-xs font-medium text-white line-clamp-2 mb-2">{v.title}</p>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" style={{ color: C.warning }} />
                  <span className="text-[10px] font-medium" style={{ color: C.warning }}>{fmt(v.views)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Highlight', 'Views', 'Duration', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {highlights.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 flex-shrink-0" style={{ color: C.warning }} />
                      <span className="text-xs font-medium text-white max-w-[300px] truncate">{v.title}</span>
                      {v.isFeatured && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: C.warningDim, color: C.warning }}>★</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-white">{fmt(v.views)}</td>
                  <td className="px-5 py-3 text-xs font-mono" style={{ color: C.textSec }}>{formatDuration(v.duration)}</td>
                  <td className="px-5 py-3 text-[10px]" style={{ color: C.textTer }}>{timeAgo(v.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Eye className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Upload className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10" style={{ color: C.accent }}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {highlights.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2" style={{ color: C.textDim }} />
                    <p className="text-xs" style={{ color: C.textTer }}>No highlights yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   7. ANALYTICS PAGE
   ═══════════════════════════════════════════════════════════════ */

function AnalyticsPage({ data }: { data: DashboardData }) {
  const { overview, videos } = data.data
  const totalViews = overview.totalViewers + videos.reduce((a, v) => a + v.views, 0)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const viewsData = Array.from({ length: 7 }, (_, i) => {
    const base = totalViews / 7
    return Math.round(base * (0.5 + Math.random() * 1))
  })

  const statsCards = [
    { label: 'Total Views', value: fmt(totalViews), change: '+21.4%', color: C.accent },
    { label: 'Live Viewers', value: fmt(overview.totalViewers), change: '+8.3%', color: C.success },
    { label: 'Videos Watched', value: fmt(videos.reduce((a, v) => a + v.views, 0)), change: '+15.7%', color: C.info },
    { label: 'Peak Viewers', value: fmt(overview.peakViewers), change: '+12.1%', color: C.warning },
  ]

  return (
    <div className="space-y-5 animate-fadeIn">
      <PageHeader title="Analytics" subtitle="Platform performance overview" icon={<BarChart3 className="h-5 w-5" style={{ color: C.info }} />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <Card key={s.label} className="p-4">
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{s.label}</span>
            <p className="text-xl font-bold text-white mt-1">{s.value}</p>
            <span className="text-[11px] font-medium" style={{ color: C.success }}>{s.change}</span>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-white">Views Overview (7 Days)</h3>
          <span className="text-[11px] font-medium" style={{ color: C.textTer }}>Last 7 days</span>
        </div>
        <div className="flex h-56 items-end gap-4">
          {days.map((day, i) => {
            const max = Math.max(...viewsData, 1)
            const h = (viewsData[i] / max) * 100
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group cursor-pointer">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-75"
                    style={{ height: `${h}%`, background: `linear-gradient(180deg, ${C.info}cc, ${C.info}15)`, minHeight: 12 }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block rounded-lg px-2.5 py-1 text-[10px] font-bold text-white whitespace-nowrap z-10 shadow-lg" style={{ background: C.sidebar, border: `1px solid ${C.border}` }}>
                    {fmtShort(viewsData[i])}
                  </div>
                </div>
                <span className="text-[10px] font-medium" style={{ color: C.textDim }}>{day}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <span className="text-[11px]" style={{ color: C.textTer }}>
            Total: <span className="font-semibold text-white">{fmt(viewsData.reduce((a, b) => a + b, 0))}</span> views
          </span>
          <span className="text-[11px] font-semibold" style={{ color: C.success }}>+21.4% vs last week</span>
        </div>
      </Card>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Views by Category</h3>
          <div className="space-y-3">
            {[
              { label: 'Football', value: 45, color: C.success },
              { label: 'Basketball', value: 22, color: C.accent },
              { label: 'Racing', value: 15, color: C.info },
              { label: 'Tennis', value: 10, color: C.warning },
              { label: 'Cricket', value: 8, color: C.purple },
            ].map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white">{cat.label}</span>
                  <span className="text-[11px] font-semibold" style={{ color: cat.color }}>{cat.value}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cat.value}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Stream Health Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Avg FPS', value: '58.4', icon: Zap, color: C.success },
              { label: 'Avg Bitrate', value: '4,200 kbps', icon: Wifi, color: C.info },
              { label: 'Buffer Rate', value: '0.3%', icon: AlertTriangle, color: C.warning },
              { label: 'Uptime', value: '99.7%', icon: Server, color: C.success },
              { label: 'Error Rate', value: '0.1%', icon: Shield, color: C.purple },
            ].map((m) => {
              const Icon = m.icon
              return (
                <div key={m.label} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" style={{ color: m.color }} />
                    <span className="text-xs" style={{ color: C.textSec }}>{m.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{m.value}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   8. REVENUE PAGE
   ═══════════════════════════════════════════════════════════════ */

function RevenuePage() {
  const statsCards = [
    { label: 'Total Revenue', value: '$48,750', change: '+15.7%', icon: DollarSign, color: C.success },
    { label: 'Subscriptions', value: '$32,100', change: '+12.3%', icon: Users, color: C.info },
    { label: 'Ad Revenue', value: '$12,800', change: '+8.9%', icon: BarChart3, color: C.warning },
    { label: 'Donations', value: '$3,850', change: '+22.1%', icon: TrendingUp, color: C.purple },
  ]

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const revenueData = [32400, 36800, 41200, 38900, 45600, 48750]

  return (
    <div className="space-y-5 animate-fadeIn">
      <PageHeader title="Revenue" subtitle="Financial overview" icon={<DollarSign className="h-5 w-5" style={{ color: C.success }} />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{s.label}</span>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <span className="text-[11px] font-medium" style={{ color: C.success }}>{s.change}</span>
            </Card>
          )
        })}
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-white mb-5">Monthly Revenue</h3>
        <div className="flex h-52 items-end gap-4">
          {months.map((month, i) => {
            const max = Math.max(...revenueData, 1)
            const h = (revenueData[i] / max) * 100
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group cursor-pointer">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-75"
                    style={{ height: `${h}%`, background: `linear-gradient(180deg, ${C.success}cc, ${C.success}15)`, minHeight: 12 }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block rounded-lg px-2.5 py-1 text-[10px] font-bold text-white whitespace-nowrap z-10 shadow-lg" style={{ background: C.sidebar, border: `1px solid ${C.border}` }}>
                    ${(revenueData[i] / 1000).toFixed(1)}K
                  </div>
                </div>
                <span className="text-[10px] font-medium" style={{ color: C.textDim }}>{month}</span>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Subscription Breakdown</h3>
        <div className="space-y-3">
          {[
            { plan: 'Basic', count: 1240, revenue: '$6,200', pct: 19, color: C.info },
            { plan: 'Premium', count: 870, revenue: '$13,050', pct: 41, color: C.success },
            { plan: 'Enterprise', count: 85, revenue: '$12,850', pct: 40, color: C.purple },
          ].map((s) => (
            <div key={s.plan} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                <Users className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{s.plan}</p>
                <p className="text-[11px]" style={{ color: C.textTer }}>{s.count} subscribers</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{s.revenue}</p>
                <p className="text-[10px]" style={{ color: s.color }}>{s.pct}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   9. SETTINGS PAGE
   ═══════════════════════════════════════════════════════════════ */

function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Sportix Live',
    maintenanceMode: false,
    autoRecord: true,
    enableChat: true,
    profanityFilter: true,
    slowMode: false,
    dvrEnabled: true,
    lowLatency: true,
    emailNotifications: true,
    pushNotifications: false,
    analyticsTracking: true,
    debugMode: false,
  })

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const settingsGroups = [
    {
      title: 'General', icon: <Globe className="h-4 w-4" style={{ color: C.textTer }} />,
      items: [
        { key: 'maintenanceMode' as const, label: 'Maintenance Mode', desc: 'Show maintenance page to visitors' },
        { key: 'debugMode' as const, label: 'Debug Mode', desc: 'Enable verbose logging and diagnostics' },
      ]
    },
    {
      title: 'Streaming', icon: <Radio className="h-4 w-4" style={{ color: C.textTer }} />,
      items: [
        { key: 'autoRecord' as const, label: 'Auto-Record Streams', desc: 'Automatically record all live streams' },
        { key: 'dvrEnabled' as const, label: 'DVR Support', desc: 'Enable DVR rewinding for viewers' },
        { key: 'lowLatency' as const, label: 'Low Latency Mode', desc: 'Reduce stream delay to 2-3 seconds' },
      ]
    },
    {
      title: 'Chat', icon: <Users className="h-4 w-4" style={{ color: C.textTer }} />,
      items: [
        { key: 'enableChat' as const, label: 'Enable Chat', desc: 'Allow viewers to send chat messages' },
        { key: 'profanityFilter' as const, label: 'Profanity Filter', desc: 'Filter inappropriate words automatically' },
        { key: 'slowMode' as const, label: 'Slow Mode', desc: 'Limit message frequency (10s cooldown)' },
      ]
    },
    {
      title: 'Notifications', icon: <Bell className="h-4 w-4" style={{ color: C.textTer }} />,
      items: [
        { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Send email alerts for important events' },
        { key: 'pushNotifications' as const, label: 'Push Notifications', desc: 'Browser push notifications for live events' },
        { key: 'analyticsTracking' as const, label: 'Analytics Tracking', desc: 'Track user behavior for insights' },
      ]
    },
  ]

  return (
    <div className="space-y-5 animate-fadeIn">
      <PageHeader title="Settings" subtitle="Platform configuration" icon={<Settings className="h-5 w-5" style={{ color: C.textSec }} />} />

      <div className="space-y-4">
        {settingsGroups.map((group) => (
          <Card key={group.title} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              {group.icon}
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{group.title}</h3>
            </div>
            <div className="space-y-0 divide-y" style={{ borderColor: C.border }}>
              {group.items.map((item, i) => (
                <div key={item.key} className="flex items-center justify-between py-3.5" style={i > 0 ? { borderTop: `1px solid ${C.border}` } : {}}>
                  <div>
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: C.textTer }}>{item.desc}</p>
                  </div>
                  <Toggle enabled={settings[item.key]} onToggle={() => toggle(item.key)} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   10. ACTIVITY LOGS PAGE
   ═══════════════════════════════════════════════════════════════ */

function ActivityLogsPage({ data }: { data: DashboardData }) {
  const activities = data.data.recentActivity

  return (
    <div className="space-y-5 animate-fadeIn">
      <PageHeader title="Activity Logs" subtitle={`${activities.length} recent events`} icon={<ClipboardList className="h-5 w-5" style={{ color: C.warning }} />} />

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold text-white">All Activity</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}>
              <Filter className="h-3 w-3" /> Filter
            </button>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: C.border }}>
          {activities.map((act) => {
            const color = activityColor(act.type)
            return (
              <div key={act.id} className="flex items-start gap-3 p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg mt-0.5" style={{ background: `${color}15`, color }}>
                  {activityIcon(act.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white leading-relaxed">{act.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" style={{ color: C.textDim }} />
                      <span className="text-[10px]" style={{ color: C.textTer }}>{timeAgo(act.timestamp)}</span>
                    </div>
                    <span className="text-[10px] capitalize font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}12`, color }}>{act.type}</span>
                  </div>
                </div>
                <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05] flex-shrink-0" style={{ color: C.textDim }}>
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            )
          })}
          {activities.length === 0 && (
            <div className="p-12 text-center">
              <ClipboardList className="h-8 w-8 mx-auto mb-2" style={{ color: C.textDim }} />
              <p className="text-xs" style={{ color: C.textTer }}>No activity logs</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between p-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <span className="text-[11px]" style={{ color: C.textTer }}>Showing {activities.length} events</span>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LOADING STATE
   ═══════════════════════════════════════════════════════════════ */

function LoadingState({ page }: { page: Page }) {
  if (page === 'dashboard') {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <SkeletonTable rows={4} />
          <SkeletonCard />
        </div>
      </div>
    )
  }
  if (page === 'settings') {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-5" style={{ background: C.card, borderColor: C.border }}>
            <Skeleton className="h-3 w-24 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-60" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <SkeletonTable rows={6} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════════════════ */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4" style={{ background: C.accentDim }}>
        <AlertTriangle className="h-8 w-8" style={{ color: C.accent }} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">Failed to load data</h3>
      <p className="text-sm mb-6" style={{ color: C.textTer }}>Unable to connect to the server. Please try again.</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
        style={{ background: C.accent }}
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AdminApp() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [clock, setClock] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])

  // Fetch data
  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true)
      const res = await fetch('/api/admin/dashboard')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      if (json.success) {
        setData(json)
        setError(false)
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
      } else {
        throw new Error(json.error || 'Failed')
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(() => fetchData(), 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchData])

  // Close sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
        setSidebarOpen(false)
      } else {
        setSidebarCollapsed(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleRetry = () => {
    setLoading(true)
    setError(false)
    fetchData(true)
  }

  const navigateTo = (page: Page) => {
    setCurrentPage(page)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const getPageTitle = (): string => {
    const item = navSections.flatMap(s => s.items).find(i => i.id === currentPage)
    return item?.label || 'Dashboard'
  }

  const renderPage = () => {
    if (error) return <ErrorState onRetry={handleRetry} />
    if (loading || !data) return <LoadingState page={currentPage} />

    switch (currentPage) {
      case 'dashboard': return <DashboardPage data={data} />
      case 'live-control': return <LiveControlPage data={data} />
      case 'live-monitor': return <LiveMonitorPage data={data} />
      case 'users': return <UsersPage data={data} />
      case 'videos': return <VideosPage data={data} />
      case 'highlights': return <HighlightsPage data={data} />
      case 'analytics': return <AnalyticsPage data={data} />
      case 'revenue': return <RevenuePage />
      case 'settings': return <SettingsPage />
      case 'activity-logs': return <ActivityLogsPage data={data} />
      default: return <DashboardPage data={data} />
    }
  }

  const isConnected = !error && data?.success

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg }}>
      {/* Mobile overlay */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        ref={sidebarRef}
        className={`fixed md:relative z-50 h-full flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{
          width: sidebarCollapsed ? 68 : 240,
          background: C.sidebar,
          borderRight: `1px solid ${C.border}`,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0" style={{ background: C.accent }}>
            <Radio className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-sm font-bold text-white tracking-tight">Sportix Admin</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto hidden md:flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06] flex-shrink-0"
            style={{ color: C.textTer }}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {section.label && !sidebarCollapsed && (
                <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: C.textDim }}>
                  {section.label}
                </p>
              )}
              {section.label && sidebarCollapsed && (
                <div className="mx-auto mb-2 w-6 border-t" style={{ borderColor: C.border }} />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPage === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`w-full flex items-center gap-3 rounded-xl transition-all duration-150 ${
                        sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
                      } ${
                        isActive ? 'text-white' : 'hover:bg-white/[0.04]'
                      }`}
                      style={isActive ? { background: C.accentDim, color: C.accent } : { color: C.textTer }}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="text-[13px] font-medium truncate">{item.label}</span>
                      )}
                      {!sidebarCollapsed && item.badge && (
                        <span
                          className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: item.badgeColor || C.accent, color: '#fff' }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2.5 rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: `${C.accent}30` }}>
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">Admin</p>
                <p className="text-[10px]" style={{ color: C.textDim }}>Super Admin</p>
              </div>
              <button className="rounded-lg p-1 transition-colors hover:bg-white/[0.06]" style={{ color: C.textDim }} title="Logout">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ─── MAIN AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ─── HEADER ─── */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}`, background: C.sidebar }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06] md:hidden"
              style={{ color: C.textSec }}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
              style={{ color: C.textSec }}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">{getPageTitle()}</h1>
              <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full" style={{ background: isConnected ? C.successDim : C.accentDim, color: isConnected ? C.success : C.accent }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'animate-ping' : ''}`} style={{ background: isConnected ? C.success : C.accent }} />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: isConnected ? C.success : C.accent }} />
                </span>
                {isConnected ? 'Connected' : 'Error'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Refresh indicator */}
            <div className="hidden sm:flex items-center gap-2 text-[11px]" style={{ color: C.textTer }}>
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} style={{ color: refreshing ? C.info : C.textDim }} />
              <span className="hidden lg:inline">{lastUpdated || 'Updating...'}</span>
            </div>

            {/* Clock */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono" style={{ color: C.textTer }}>
              <Clock className="h-3 w-3" />
              {clock}
            </div>

            {/* Back to site */}
            <button
              onClick={() => { window.location.href = '/' }}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium transition-all hover:bg-white/[0.06] active:scale-[0.97]"
              style={{ borderColor: C.border, color: C.textSec }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to Site</span>
            </button>
          </div>
        </header>

        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
