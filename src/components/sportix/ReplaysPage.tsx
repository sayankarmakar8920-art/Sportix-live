'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Film, Calendar, Download, Bell, Camera, Play, Clock,
  RefreshCw, Eye, Search, ChevronLeft, ChevronRight,
  Monitor, Globe, Settings, Pencil, Trash2, ArrowUpRight,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#141414',
  card: '#1a1a1a',
  border: 'rgba(255,255,255,0.08)',
  accent: '#E50914',
  success: '#46d369',
  warning: '#f5c518',
  text: '#ffffff',
  textSec: '#b3b3b3',
  textTer: '#808080',
  textDim: '#555555',
}

/* ═══════════════════════════════════════════════════════════════
   FORMATTER
   ═══════════════════════════════════════════════════════════════ */
function fmtBig(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

/* ═══════════════════════════════════════════════════════════════
   SVG HELPERS
   ═══════════════════════════════════════════════════════════════ */
function SparklineSVG({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 80},${20 - ((v - min) / range) * 18}`)
    .join(' ')
  return (
    <svg viewBox="0 0 80 20" className="w-full h-5">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DonutSVG({
  segments,
  centerText,
  subText,
  size = 160,
}: {
  segments: { pct: number; color: string; label: string }[]
  centerText: string
  subText: string
  size?: number
}) {
  const r = (size / 2) - 14
  const circ = 2 * Math.PI * r
  const computed = useMemo(() => {
    const result: { len: number; offset: number; color: string; pct: number; label: string }[] = []
    let runningOffset = 0
    for (const s of segments) {
      const len = (s.pct / 100) * circ
      result.push({ len, offset: runningOffset, color: s.color, pct: s.pct, label: s.label })
      runningOffset += len
    }
    return result
  }, [segments, circ])

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {computed.map((s, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="12"
            strokeDasharray={`${s.len} ${circ - s.len}`}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
          {centerText}
        </text>
        <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fill="#808080" fontSize="10">
          {subText}
        </text>
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
        {computed.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-[10px]" style={{ color: C.textSec }}>
              {s.label}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: C.text }}>
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
type SourceTab = 'All' | 'Live TV' | 'VOD' | 'Catchup TV'
type StatusFilter = 'All Status' | 'Active' | 'Inactive' | 'Processing'

interface ReplayEntry {
  id: number
  title: string
  source: 'Live TV' | 'VOD' | 'Catchup TV'
  duration: string
  replayedOn: string
  views: string
  watchTime: string
  avgWatchTime: string
  status: 'Active' | 'Inactive' | 'Processing'
  color: string
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */
const kpiMeta = [
  { key: 'totalReplays', icon: Film, title: 'Total Replays', change: '+12.5%', color: '#3B82F6', spark: [30, 45, 35, 55, 48, 62, 58] },
  { key: 'totalViewers', icon: Camera, title: 'Total Viewers', change: '+9.8%', color: '#8B5CF6', spark: [20, 30, 25, 40, 35, 50, 42] },
  { key: 'replayTime', icon: Play, title: 'Replay Time', change: '+14.3%', color: '#10B981', spark: [40, 35, 50, 42, 60, 55, 65] },
  { key: 'avgWatchTime', icon: Clock, title: 'Avg. Watch Time', change: '+8.6%', color: '#F59E0B', spark: [25, 32, 28, 38, 35, 42, 40] },
  { key: 'completionRate', icon: RefreshCw, title: 'Completion Rate', change: '+5.2%', color: '#EC4899', spark: [35, 42, 38, 50, 46, 55, 52] },
  { key: 'uniqueReplays', icon: Eye, title: 'Unique Replays', change: '+10.7%', color: '#06B6D4', spark: [15, 25, 20, 35, 28, 40, 36] },
] as const

const topVideos = [
  { rank: 1, title: 'Match Highlights: Team A vs Team B', views: '1.25M', pct: 100, color: '#3B82F6' },
  { rank: 2, title: 'Championship Finals – Full Replay', views: '985K', pct: 79, color: '#8B5CF6' },
  { rank: 3, title: 'Best Goals of the Season 2025', views: '872K', pct: 70, color: '#10B981' },
  { rank: 4, title: 'Player Interview: Post-Match Analysis', views: '654K', pct: 52, color: '#F59E0B' },
  { rank: 5, title: 'Tactical Breakdown: Semi-Final', views: '543K', pct: 43, color: '#EC4899' },
]

const replaysData: ReplayEntry[] = [
  { id: 1, title: 'Match Highlights: Team A vs Team B', source: 'Live TV', duration: '02:15:30', replayedOn: 'Jun 8, 2025', views: '1.25M', watchTime: '45.2K hrs', avgWatchTime: '00:14:22', status: 'Active', color: '#3B82F6' },
  { id: 2, title: 'Championship Finals – Full Replay', source: 'VOD', duration: '03:45:00', replayedOn: 'Jun 7, 2025', views: '985K', watchTime: '38.5K hrs', avgWatchTime: '00:16:45', status: 'Active', color: '#8B5CF6' },
  { id: 3, title: 'Best Goals of the Season 2025', source: 'Catchup TV', duration: '01:30:00', replayedOn: 'Jun 6, 2025', views: '872K', watchTime: '28.1K hrs', avgWatchTime: '00:11:30', status: 'Active', color: '#10B981' },
  { id: 4, title: 'Player Interview: Post-Match Analysis', source: 'Live TV', duration: '00:45:20', replayedOn: 'Jun 5, 2025', views: '654K', watchTime: '15.3K hrs', avgWatchTime: '00:09:15', status: 'Active', color: '#F59E0B' },
  { id: 5, title: 'Tactical Breakdown: Semi-Final', source: 'VOD', duration: '02:00:45', replayedOn: 'Jun 4, 2025', views: '543K', watchTime: '22.7K hrs', avgWatchTime: '00:15:10', status: 'Inactive', color: '#EC4899' },
  { id: 6, title: 'Opening Ceremony – Season Kickoff', source: 'Live TV', duration: '01:15:00', replayedOn: 'Jun 3, 2025', views: '421K', watchTime: '12.8K hrs', avgWatchTime: '00:08:50', status: 'Processing', color: '#06B6D4' },
  { id: 7, title: 'Weekly Highlights Show – Ep.24', source: 'Catchup TV', duration: '00:55:30', replayedOn: 'Jun 2, 2025', views: '387K', watchTime: '10.5K hrs', avgWatchTime: '00:10:05', status: 'Active', color: '#9b59b6' },
]

const topCountries = [
  { flag: '🇺🇸', name: 'United States', views: '3.25M', pct: '17.6%', bar: 100 },
  { flag: '🇮🇳', name: 'India', views: '2.85M', pct: '15.4%', bar: 87 },
  { flag: '🇬🇧', name: 'United Kingdom', views: '1.85M', pct: '10.0%', bar: 57 },
  { flag: '🇨🇦', name: 'Canada', views: '1.45M', pct: '7.9%', bar: 45 },
  { flag: '🇦🇺', name: 'Australia', views: '1.25M', pct: '6.8%', bar: 39 },
]

/* ═══════════════════════════════════════════════════════════════
   TOGGLE SWITCH (CSS only, no framer-motion)
   ═══════════════════════════════════════════════════════════════ */
function ToggleSwitch({ enabled, onToggle, label, description }: {
  enabled: boolean
  onToggle: () => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="min-w-0">
        <p className="text-xs font-medium text-white">{label}</p>
        <p className="text-[10px] mt-0.5" style={{ color: C.textTer }}>{description}</p>
      </div>
      <button
        onClick={onToggle}
        className="relative h-5 w-9 rounded-full flex-shrink-0 transition-all duration-200"
        style={{ background: enabled ? C.success : 'rgba(255,255,255,0.12)' }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ left: enabled ? '17px' : '2px' }}
        />
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function ReplaysPage() {
  /* ── Real-time KPI state ── */
  const [kpis, setKpis] = useState({
    totalReplays: 4250000,
    totalViewers: 2780000,
    replayTime: 15620000,
    avgWatchTime: '00:12:45',
    completionRate: 62.45,
    uniqueReplays: 1650000,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prev => ({
        ...prev,
        totalReplays: prev.totalReplays + Math.floor(Math.random() * 50),
        totalViewers: prev.totalViewers + Math.floor(Math.random() * 30),
        replayTime: prev.replayTime + Math.floor(Math.random() * 200),
        completionRate: Math.min(99, prev.completionRate + (Math.random() * 0.1 - 0.03)),
        uniqueReplays: prev.uniqueReplays + Math.floor(Math.random() * 20),
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  /* ── UI state ── */
  const [activeTab, setActiveTab] = useState<SourceTab>('All')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All Status')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [toggleReplays, setToggleReplays] = useState(true)
  const [toggleLiveTV, setToggleLiveTV] = useState(true)
  const [toggleVOD, setToggleVOD] = useState(true)
  const [replayDays, setReplayDays] = useState('30 Days')
  const [notifOpen, setNotifOpen] = useState(false)

  const sourceTabs: SourceTab[] = ['All', 'Live TV', 'VOD', 'Catchup TV']

  /* KPI display values */
  function getKpiValue(key: string): string {
    switch (key) {
      case 'totalReplays': return fmtBig(kpis.totalReplays)
      case 'totalViewers': return fmtBig(kpis.totalViewers)
      case 'replayTime': return fmtBig(kpis.replayTime) + ' hrs'
      case 'avgWatchTime': return kpis.avgWatchTime
      case 'completionRate': return kpis.completionRate.toFixed(2) + '%'
      case 'uniqueReplays': return fmtBig(kpis.uniqueReplays)
      default: return ''
    }
  }

  /* Filter replays */
  const filteredReplays = useMemo(() => {
    let data = [...replaysData]
    if (activeTab !== 'All') data = data.filter(r => r.source === activeTab)
    if (statusFilter !== 'All Status') data = data.filter(r => r.status === statusFilter)
    if (search) data = data.filter(r => r.title.toLowerCase().includes(search.toLowerCase()))
    return data
  }, [activeTab, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filteredReplays.length / perPage))
  const pagedReplays = filteredReplays.slice((currentPage - 1) * perPage, currentPage * perPage)

  /* Line chart config */
  const chartW = 700
  const chartH = 180
  const padL = 50
  const padR = 20
  const padT = 10
  const padB = 30
  const plotW = chartW - padL - padR
  const plotH = chartH - padT - padB

  const xLabels = ['May 10', 'May 17', 'May 24', 'May 31', 'Jun 7', 'Jun 10']
  const yLabels = ['0', '50K', '100K', '150K', '200K', '250K']

  const replaysLine = [80, 120, 95, 180, 160, 220]
  const uniqueLine = [50, 80, 65, 120, 110, 150]
  const watchLine = [30, 55, 42, 90, 75, 130]

  function toX(i: number) { return padL + (i / (xLabels.length - 1)) * plotW }
  function toY(v: number) { return padT + plotH - (v / 250) * plotH }

  function buildPath(data: number[]) {
    return data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ')
  }

  function buildArea(data: number[]) {
    const line = buildPath(data)
    return `${line} L ${toX(data.length - 1).toFixed(1)} ${toY(0).toFixed(1)} L ${toX(0).toFixed(1)} ${toY(0).toFixed(1)} Z`
  }

  /* Pagination */
  function getPaginationRange(current: number, total: number) {
    const pages: (number | string)[] = []
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(total)
      } else if (current >= total - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = total - 3; i <= total; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(total)
      }
    }
    return pages
  }

  /* Card style helper */
  const cardStyle: React.CSSProperties = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
  }

  return (
    <div className="space-y-3 min-w-0">
      {/* ═══════════════════════════════════════════════════════
          1. PAGE HEADER
          ═══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: C.accent }}
          >
            <Film className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Video Replays</h2>
            <p className="text-[11px]" style={{ color: C.textTer }}>
              Monitor, analyze and track all video replays and playback performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Date Range */}
          <button
            className="hidden sm:flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all duration-200 hover:bg-white/[0.04]"
            style={{ borderColor: C.border, color: C.textSec, background: 'rgba(255,255,255,0.02)' }}
          >
            <Calendar className="h-3.5 w-3.5" style={{ color: C.textDim }} />
            <span className="text-[11px]">May 10 – Jun 10, 2025</span>
          </button>
          {/* Export */}
          <button
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-medium transition-all duration-200 hover:bg-white/[0.04]"
            style={{ borderColor: C.border, color: C.textSec, background: 'rgba(255,255,255,0.02)' }}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/[0.06]"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}
            >
              <Bell className="h-4 w-4" style={{ color: C.textSec }} />
            </button>
            <span
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: C.accent }}
            >
              12
            </span>
            {notifOpen && (
              <div
                className="absolute right-0 top-10 w-56 rounded-lg p-3 z-50 space-y-1.5"
                style={{ background: '#222', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <p className="text-xs font-semibold text-white">Notifications</p>
                <p className="text-[10px]" style={{ color: C.textTer }}>No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          2. KPI CARDS (real-time updates)
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {kpiMeta.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="rounded-xl p-3 transition-all duration-200" style={cardStyle}>
              {/* Icon */}
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center mb-2"
                style={{ background: `${card.color}18` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: card.color }} />
              </div>
              {/* Title */}
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>
                {card.title}
              </p>
              {/* Value (real-time) */}
              <p className="text-lg font-bold text-white mt-0.5 leading-tight">
                {getKpiValue(card.key)}
              </p>
              {/* Change */}
              <div className="flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="h-3 w-3" style={{ color: C.success }} />
                <span className="text-[10px] font-semibold" style={{ color: C.success }}>
                  {card.change}
                </span>
              </div>
              {/* Sparkline */}
              <div className="mt-1.5">
                <SparklineSVG data={card.spark} color={card.color} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════
          3. CHARTS ROW
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {/* Left: Replays Over Time (pure SVG area chart) */}
        <div className="rounded-xl p-3" style={cardStyle}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Replays Over Time</h3>
            <div className="relative">
              <select
                className="rounded-lg border px-2.5 py-1 text-[10px] text-white focus:outline-none appearance-none pr-6 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}
              >
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Last 90 Days</option>
              </select>
              <ChevronRight className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rotate-90 pointer-events-none" style={{ color: C.textDim }} />
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: '#3B82F6' }} />
              <span className="text-[10px]" style={{ color: C.textSec }}>Replays</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: '#10B981' }} />
              <span className="text-[10px]" style={{ color: C.textSec }}>Unique Replays</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: '#F97316' }} />
              <span className="text-[10px]" style={{ color: C.textSec }}>Watch Time</span>
            </div>
          </div>
          {/* SVG Area Chart */}
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-44" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="areaOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {yLabels.map((_, i) => {
              const y = padT + (i / (yLabels.length - 1)) * plotH
              return (
                <line key={`g-${i}`} x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              )
            })}
            {/* Y-axis labels */}
            {yLabels.map((label, i) => {
              const y = padT + (i / (yLabels.length - 1)) * plotH
              return (
                <text key={`yl-${i}`} x={padL - 8} y={y + 3} textAnchor="end" fill="#555555" fontSize="10">{label}</text>
              )
            })}
            {/* X-axis labels */}
            {xLabels.map((label, i) => (
              <text key={`xl-${i}`} x={toX(i)} y={chartH - 5} textAnchor="middle" fill="#555555" fontSize="10">{label}</text>
            ))}
            {/* Areas */}
            <path d={buildArea(replaysLine)} fill="url(#areaBlue)" />
            <path d={buildArea(uniqueLine)} fill="url(#areaGreen)" />
            <path d={buildArea(watchLine)} fill="url(#areaOrange)" />
            {/* Lines */}
            <path d={buildPath(replaysLine)} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={buildPath(uniqueLine)} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={buildPath(watchLine)} fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots */}
            {replaysLine.map((v, i) => (
              <circle key={`db-${i}`} cx={toX(i)} cy={toY(v)} r="3" fill={C.card} stroke="#3B82F6" strokeWidth="1.5" />
            ))}
            {uniqueLine.map((v, i) => (
              <circle key={`dg-${i}`} cx={toX(i)} cy={toY(v)} r="2.5" fill={C.card} stroke="#10B981" strokeWidth="1.5" />
            ))}
            {watchLine.map((v, i) => (
              <circle key={`do-${i}`} cx={toX(i)} cy={toY(v)} r="2.5" fill={C.card} stroke="#F97316" strokeWidth="1.5" />
            ))}
          </svg>
        </div>

        {/* Right: Replay Sources Donut */}
        <div className="rounded-xl p-3" style={cardStyle}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Replay Sources</h3>
          </div>
          <div className="flex justify-center py-2">
            <DonutSVG
              segments={[
                { pct: 43.5, color: '#3B82F6', label: 'Live TV' },
                { pct: 34.1, color: '#10B981', label: 'VOD' },
                { pct: 15.3, color: '#F97316', label: 'Catchup' },
                { pct: 7.1, color: '#EC4899', label: 'Others' },
              ]}
              centerText={fmtBig(kpis.totalReplays)}
              subText="Total Replays"
              size={160}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          4. TOP VIDEOS BY REPLAYS
          ═══════════════════════════════════════════════════════ */}
      <div className="rounded-xl p-3" style={cardStyle}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Top Videos by Replays</h3>
          <button
            className="text-[10px] font-medium transition-all duration-200 hover:underline"
            style={{ color: C.accent }}
          >
            View All
          </button>
        </div>
        <div className="space-y-2">
          {topVideos.map((video) => (
            <div
              key={video.rank}
              className="flex items-center gap-2.5 rounded-lg p-2 transition-all duration-200 hover:bg-white/[0.02]"
            >
              {/* Rank */}
              <span className="text-[11px] font-bold w-4 text-center flex-shrink-0" style={{ color: C.textDim }}>
                #{video.rank}
              </span>
              {/* Thumbnail */}
              <div
                className="h-9 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${video.color}20` }}
              >
                <Play className="h-3 w-3" style={{ color: video.color }} fill={video.color} />
              </div>
              {/* Title + progress */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{video.title}</p>
                <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${video.pct}%`, background: video.color, opacity: 0.8 }}
                  />
                </div>
              </div>
              {/* Views */}
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: C.success }}>
                {video.views}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          5. REPLAYS LIST
          ═══════════════════════════════════════════════════════ */}
      <div className="rounded-xl p-3" style={cardStyle}>
        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2.5 mb-3">
          {/* Source tabs */}
          <div className="flex items-center gap-1 rounded-lg p-0.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {sourceTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1) }}
                className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-200"
                style={{
                  background: activeTab === tab ? C.accent : 'transparent',
                  color: activeTab === tab ? '#fff' : C.textTer,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="flex-1 min-w-[160px]">
            <div
              className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
              style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: C.textDim }} />
              <input
                type="text"
                placeholder="Search replays..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
          </div>
          {/* Status dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1) }}
              className="rounded-lg border px-2.5 py-1.5 text-[11px] text-white focus:outline-none appearance-none pr-6 cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Processing</option>
            </select>
            <ChevronRight className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rotate-90 pointer-events-none" style={{ color: C.textDim }} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Preview', 'Title', 'Source', 'Duration', 'Replayed On', 'Views', 'Watch Time', 'Avg Watch', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-2.5 py-2 text-[9px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedReplays.map((row) => (
                <tr
                  key={row.id}
                  className="transition-all duration-200 hover:bg-white/[0.02]"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="px-2.5 py-2">
                    <div className="h-7 w-10 rounded-md flex items-center justify-center" style={{ background: `${row.color}20` }}>
                      <Play className="h-3 w-3" style={{ color: row.color }} fill={row.color} />
                    </div>
                  </td>
                  <td className="px-2.5 py-2">
                    <span className="text-[11px] font-medium text-white">{row.title}</span>
                  </td>
                  <td className="px-2.5 py-2">
                    <span
                      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-medium"
                      style={{ background: 'rgba(255,255,255,0.06)', color: C.textSec }}
                    >
                      {row.source}
                    </span>
                  </td>
                  <td className="px-2.5 py-2">
                    <span className="text-[11px]" style={{ color: C.textSec }}>{row.duration}</span>
                  </td>
                  <td className="px-2.5 py-2">
                    <span className="text-[11px]" style={{ color: C.textSec }}>{row.replayedOn}</span>
                  </td>
                  <td className="px-2.5 py-2">
                    <span className="text-[11px] font-semibold" style={{ color: C.success }}>{row.views}</span>
                  </td>
                  <td className="px-2.5 py-2">
                    <span className="text-[11px]" style={{ color: C.textSec }}>{row.watchTime}</span>
                  </td>
                  <td className="px-2.5 py-2">
                    <span className="text-[11px]" style={{ color: C.textSec }}>{row.avgWatchTime}</span>
                  </td>
                  <td className="px-2.5 py-2">
                    <span
                      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{
                        background: row.status === 'Active' ? 'rgba(70,211,105,0.12)' : row.status === 'Processing' ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.06)',
                        color: row.status === 'Active' ? C.success : row.status === 'Processing' ? C.warning : C.textTer,
                      }}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full mr-1 ${row.status === 'Processing' ? 'animate-pulse' : ''}`} style={{ background: 'currentColor' }} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-2.5 py-2">
                    <div className="flex items-center gap-0.5">
                      <button className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-white/[0.06] transition-all duration-200" style={{ color: C.textTer }}>
                        <Eye className="h-3 w-3" />
                      </button>
                      <button className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-white/[0.06] transition-all duration-200" style={{ color: C.textTer }}>
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-red-500/15 transition-all duration-200" style={{ color: C.accent }}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3">
          <p className="text-[9px]" style={{ color: C.textDim }}>
            Showing {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filteredReplays.length)} of {filteredReplays.length} replays
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 rounded-md flex items-center justify-center transition-all duration-200 hover:bg-white/[0.04] disabled:opacity-30"
              style={{ color: C.textSec, border: `1px solid ${C.border}` }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {getPaginationRange(currentPage, totalPages).map((p, i) =>
              typeof p === 'string' ? (
                <span key={`d-${i}`} className="text-[10px] px-0.5" style={{ color: C.textDim }}>…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-all duration-200"
                  style={{
                    background: currentPage === p ? C.accent : 'transparent',
                    color: currentPage === p ? '#fff' : C.textTer,
                    border: `1px solid ${currentPage === p ? C.accent : C.border}`,
                  }}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 rounded-md flex items-center justify-center transition-all duration-200 hover:bg-white/[0.04] disabled:opacity-30"
              style={{ color: C.textSec, border: `1px solid ${C.border}` }}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            {/* Per page */}
            <div className="relative ml-1.5">
              <select
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1) }}
                className="rounded-md border px-1.5 py-1 text-[9px] text-white focus:outline-none appearance-none pr-5 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <ChevronRight className="absolute right-1 top-1/2 -translate-y-1/2 h-2 w-2 rotate-90 pointer-events-none" style={{ color: C.textDim }} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          6. BOTTOM ROW
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Left: Devices Donut */}
        <div className="rounded-xl p-3" style={cardStyle}>
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="h-4 w-4" style={{ color: '#3B82F6' }} />
            <h3 className="text-sm font-semibold text-white">Devices</h3>
          </div>
          <div className="flex justify-center py-2">
            <DonutSVG
              segments={[
                { pct: 50.6, color: '#3B82F6', label: 'Mobile' },
                { pct: 29.4, color: '#10B981', label: 'Desktop' },
                { pct: 15.3, color: '#F97316', label: 'Tablet' },
                { pct: 5.9, color: '#EC4899', label: 'TV' },
              ]}
              centerText={fmtBig(kpis.totalReplays)}
              subText="Total Replays"
              size={150}
            />
          </div>
        </div>

        {/* Middle: Top Countries */}
        <div className="rounded-xl p-3" style={cardStyle}>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4" style={{ color: C.success }} />
            <h3 className="text-sm font-semibold text-white">Top Countries</h3>
          </div>
          <div className="space-y-2">
            {topCountries.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg p-2 transition-all duration-200 hover:bg-white/[0.02]">
                <span className="text-base flex-shrink-0">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-medium text-white truncate">{c.name}</p>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-[11px] font-semibold text-white">{c.views}</span>
                      <span className="text-[9px] ml-1" style={{ color: C.textTer }}>{c.pct}</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${c.bar}%`, background: C.accent, opacity: 0.6 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="w-full text-center text-[10px] font-medium mt-2 py-1.5 rounded-lg transition-all duration-200 hover:bg-white/[0.03]"
            style={{ color: C.accent }}
          >
            View All Countries
          </button>
        </div>

        {/* Right: Replay Settings */}
        <div className="rounded-xl p-3" style={cardStyle}>
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4" style={{ color: C.warning }} />
            <h3 className="text-sm font-semibold text-white">Replay Settings</h3>
          </div>
          <ToggleSwitch
            enabled={toggleReplays}
            onToggle={() => setToggleReplays(!toggleReplays)}
            label="Enable Replays"
            description="Allow users to replay video content"
          />
          <ToggleSwitch
            enabled={toggleLiveTV}
            onToggle={() => setToggleLiveTV(!toggleLiveTV)}
            label="Allow Replays for Live TV"
            description="Enable replays for live TV broadcasts"
          />
          <ToggleSwitch
            enabled={toggleVOD}
            onToggle={() => setToggleVOD(!toggleVOD)}
            label="Allow Replays for VOD"
            description="Enable replays for video on demand content"
          />
          {/* Replay Availability Dropdown */}
          <div className="mt-2 pt-2.5" style={{ borderBottom: 'none' }}>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: C.textDim }}>
              Replay Availability
            </label>
            <div className="relative">
              <select
                value={replayDays}
                onChange={e => setReplayDays(e.target.value)}
                className="w-full rounded-lg border px-2.5 py-1.5 text-[11px] text-white focus:outline-none appearance-none pr-6 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}
              >
                <option>7 Days</option>
                <option>14 Days</option>
                <option>30 Days</option>
                <option>60 Days</option>
                <option>90 Days</option>
                <option>Unlimited</option>
              </select>
              <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 rotate-90 pointer-events-none" style={{ color: C.textDim }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
