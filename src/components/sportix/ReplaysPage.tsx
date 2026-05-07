'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Film, Calendar, Download, Bell, FileText, Camera, Play, Clock,
  RefreshCw, Eye, Search, ChevronLeft, ChevronRight, TrendingUp,
  Monitor, Smartphone, Tablet, Tv, Globe, Settings, Pencil, Trash2,
  AlertCircle, ArrowUp,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#141414',
  card: '#1a1a1a',
  border: 'rgba(255,255,255,0.08)',
  accent: '#E50914',
  text: '#ffffff',
  textSec: '#b3b3b3',
  textTer: '#808080',
  textDim: '#555555',
  success: '#46d369',
  warning: '#f5c518',
  info: '#0071eb',
  purple: '#9b59b6',
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
const kpiCards = [
  { icon: FileText, title: 'Total Replays', value: '4.25M', change: '+12.5%', color: '#3B82F6', spark: [30, 45, 35, 55, 48, 62, 58] },
  { icon: Camera, title: 'Total Viewers', value: '2.78M', change: '+9.8%', color: '#8B5CF6', spark: [20, 30, 25, 40, 35, 50, 42] },
  { icon: Play, title: 'Replay Time', value: '15.62M hrs', change: '+14.3%', color: '#10B981', spark: [40, 35, 50, 42, 60, 55, 65] },
  { icon: Clock, title: 'Avg. Watch Time', value: '00:12:45', change: '+8.6%', color: '#F59E0B', spark: [25, 32, 28, 38, 35, 42, 40] },
  { icon: RefreshCw, title: 'Completion Rate', value: '62.45%', change: '+5.2%', color: '#EC4899', spark: [35, 42, 38, 50, 46, 55, 52] },
  { icon: Eye, title: 'Unique Replays', value: '1.65M', change: '+10.7%', color: '#06B6D4', spark: [15, 25, 20, 35, 28, 40, 36] },
]

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
  { flag: '🇺🇸', name: 'United States', views: '3.25M', pct: '17.6%' },
  { flag: '🇮🇳', name: 'India', views: '2.85M', pct: '15.4%' },
  { flag: '🇬🇧', name: 'United Kingdom', views: '1.85M', pct: '10.0%' },
  { flag: '🇨🇦', name: 'Canada', views: '1.45M', pct: '7.9%' },
  { flag: '🇦🇺', name: 'Australia', views: '1.25M', pct: '6.8%' },
]

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function generateSparklinePoints(data: number[]): string {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 100
  const h = 28
  const stepX = w / (data.length - 1)
  return data
    .map((v, i) => {
      const x = i * stepX
      const y = h - ((v - min) / range) * (h - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {children}
    </motion.div>
  )
}

function DonutChart({ segments, centerValue, centerLabel, size = 200 }: {
  segments: { label: string; value: number; color: string }[]
  centerValue: string
  centerLabel: string
  size?: number
}) {
  const radius = 70
  const strokeWidth = 25
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((s, seg) => s + seg.value, 0)

  // Pre-compute segment data using useMemo to avoid mutation during render
  const computedSegs = useMemo(() => {
    const result: { dashArray: string; dashOffset: number; color: string }[] = []
    let runningOffset = 0
    for (const seg of segments) {
      const segLen = (seg.value / total) * circumference
      result.push({
        dashArray: `${segLen} ${circumference - segLen}`,
        dashOffset: -runningOffset,
        color: seg.color,
      })
      runningOffset += segLen
    }
    return result
  }, [segments, total, circumference])

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="max-w-[200px]">
        <defs>
          <linearGradient id={`donutBg-${centerLabel.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        {/* Segments */}
        {computedSegs.map((s, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={s.dashArray}
            strokeDashoffset={s.dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="round"
            style={{ opacity: 0.9 }}
          />
        ))}
        {/* Center text */}
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" className="fill-white" fontSize="20" fontWeight="700">{centerValue}</text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" className="fill-[#808080]" fontSize="10">{centerLabel}</text>
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-[11px]" style={{ color: C.textSec }}>{seg.label}</span>
            <span className="text-[11px] font-semibold" style={{ color: C.text }}>{((seg.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ToggleSwitch({ enabled, onToggle, label, description }: {
  enabled: boolean
  onToggle: () => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-[11px] mt-0.5" style={{ color: C.textTer }}>{description}</p>
      </div>
      <button
        onClick={onToggle}
        className="relative h-6 w-11 rounded-full flex-shrink-0 transition-colors duration-200"
        style={{ background: enabled ? C.success : 'rgba(255,255,255,0.12)' }}
      >
        <motion.div
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md"
        />
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function ReplaysPage() {
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

  /* Line chart data */
  const chartW = 700
  const chartH = 200
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

  /* Pagination range */
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

  return (
    <div className="space-y-5 min-w-0">
      {/* ═══════════════════════════════════════════════════════
          1. PAGE HEADER
          ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${C.purple}15` }}>
            <Film className="h-5 w-5" style={{ color: C.purple }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Video Replays</h2>
            <p className="text-xs" style={{ color: C.textTer }}>Monitor, analyze and track all video replays and playback performance</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Date Range */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
            <Calendar className="h-4 w-4" style={{ color: C.textDim }} />
            <span className="text-xs" style={{ color: C.textSec }}>May 10, 2025 - Jun 10, 2025</span>
          </div>
          {/* Export */}
          <button className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]" style={{ borderColor: C.border, color: C.textSec, background: 'rgba(255,255,255,0.02)' }}>
            <Download className="h-3.5 w-3.5" /> Export Report
          </button>
          {/* Notification */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="h-9 w-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/[0.06]" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
              <Bell className="h-4 w-4" style={{ color: C.textSec }} />
            </button>
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: C.accent }}>
              12
            </span>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-64 rounded-xl p-3 z-50 space-y-2" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-semibold text-white">Notifications</p>
                <p className="text-[11px]" style={{ color: C.textTer }}>No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          2. KPI METRIC CARDS
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon
          return (
            <GlassCard key={i} className="!p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                  <Icon className="h-4 w-4" style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{card.title}</p>
              <p className="text-xl font-bold text-white mt-1 leading-tight">{card.value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <ArrowUp className="h-3 w-3" style={{ color: C.success }} />
                <span className="text-[11px] font-semibold" style={{ color: C.success }}>{card.change}</span>
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: C.textTer }}>from last 30 days</p>
              {/* Sparkline */}
              <svg viewBox="0 0 100 30" className="w-full h-8 mt-2">
                <defs>
                  <linearGradient id={`spark-grad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={card.color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={card.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  points={generateSparklinePoints(card.spark)}
                  fill={`url(#spark-grad-${i})`}
                  stroke="none"
                />
                <polyline
                  points={generateSparklinePoints(card.spark)}
                  fill="none"
                  stroke={card.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* End dot */}
                {(() => {
                  const pts = generateSparklinePoints(card.spark).split(' ')
                  const lastPt = pts[pts.length - 1].split(',')
                  return <circle cx={lastPt[0]} cy={lastPt[1]} r="2.5" fill={card.color} />
                })()}
              </svg>
            </GlassCard>
          )
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════
          3. CHARTS ROW
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Replays Over Time */}
        <GlassCard className="!p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Replays Over Time</h3>
            <div className="relative">
              <select className="rounded-lg border px-2.5 py-1.5 text-[11px] text-white focus:outline-none appearance-none pr-7 cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}>
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Last 90 Days</option>
              </select>
              <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 rotate-90 pointer-events-none" style={{ color: C.textDim }} />
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: '#3B82F6' }} /><span className="text-[11px]" style={{ color: C.textSec }}>Replays</span></div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: '#10B981' }} /><span className="text-[11px]" style={{ color: C.textSec }}>Unique Replays</span></div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: '#F97316' }} /><span className="text-[11px]" style={{ color: C.textSec }}>Watch Time</span></div>
          </div>
          {/* SVG Line Chart */}
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
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
                <line key={`grid-${i}`} x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              )
            })}
            {/* Y-axis labels */}
            {yLabels.map((label, i) => {
              const y = padT + (i / (yLabels.length - 1)) * plotH
              return (
                <text key={`ylbl-${i}`} x={padL - 8} y={y + 3} textAnchor="end" className="fill-[#555555]" fontSize="10">{label}</text>
              )
            })}
            {/* X-axis labels */}
            {xLabels.map((label, i) => (
              <text key={`xlbl-${i}`} x={toX(i)} y={chartH - 5} textAnchor="middle" className="fill-[#555555]" fontSize="10">{label}</text>
            ))}
            {/* Area fills */}
            <path d={buildArea(replaysLine)} fill="url(#areaBlue)" />
            <path d={buildArea(uniqueLine)} fill="url(#areaGreen)" />
            <path d={buildArea(watchLine)} fill="url(#areaOrange)" />
            {/* Lines */}
            <path d={buildPath(replaysLine)} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={buildPath(uniqueLine)} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={buildPath(watchLine)} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots */}
            {replaysLine.map((v, i) => (
              <circle key={`d-blue-${i}`} cx={toX(i)} cy={toY(v)} r="3.5" fill="#1a1a1a" stroke="#3B82F6" strokeWidth="2" />
            ))}
            {uniqueLine.map((v, i) => (
              <circle key={`d-green-${i}`} cx={toX(i)} cy={toY(v)} r="3" fill="#1a1a1a" stroke="#10B981" strokeWidth="2" />
            ))}
            {watchLine.map((v, i) => (
              <circle key={`d-orange-${i}`} cx={toX(i)} cy={toY(v)} r="3" fill="#1a1a1a" stroke="#F97316" strokeWidth="2" />
            ))}
          </svg>
        </GlassCard>

        {/* Right: Replay Sources Donut */}
        <GlassCard className="!p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Replay Sources</h3>
          </div>
          <div className="flex justify-center py-2">
            <DonutChart
              segments={[
                { label: 'Live TV', value: 43.5, color: '#3B82F6' },
                { label: 'Video On Demand', value: 34.1, color: '#10B981' },
                { label: 'Catchup TV', value: 15.3, color: '#F97316' },
                { label: 'Others', value: 7.1, color: '#EC4899' },
              ]}
              centerValue="4.25M"
              centerLabel="Total Replays"
            />
          </div>
        </GlassCard>
      </div>

      {/* ═══════════════════════════════════════════════════════
          4. TOP VIDEOS BY REPLAYS
          ═══════════════════════════════════════════════════════ */}
      <GlassCard className="!p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Top Videos by Replays</h3>
          <button className="text-[11px] font-medium transition-all hover:underline" style={{ color: C.info }}>View All</button>
        </div>
        <div className="space-y-3">
          {topVideos.map((video) => (
            <div key={video.rank} className="flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-white/[0.02]">
              {/* Rank */}
              <span className="text-xs font-bold w-5 text-center flex-shrink-0" style={{ color: C.textDim }}>#{video.rank}</span>
              {/* Thumbnail placeholder */}
              <div className="h-10 w-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${video.color}20` }}>
                <Play className="h-3.5 w-3.5" style={{ color: video.color }} fill={video.color} />
              </div>
              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white truncate">{video.title}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  {/* Progress bar */}
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${video.pct}%`, background: video.color, opacity: 0.8 }} />
                  </div>
                </div>
              </div>
              {/* Views */}
              <span className="text-sm font-semibold flex-shrink-0" style={{ color: C.success }}>{video.views}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ═══════════════════════════════════════════════════════
          5. REPLAYS LIST
          ═══════════════════════════════════════════════════════ */}
      <GlassCard className="!p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Replays List</h3>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-4">
          {/* Source tabs */}
          <div className="flex items-center gap-1 rounded-xl p-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {sourceTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1) }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
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
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: C.textDim }} />
              <input
                type="text"
                placeholder="Search replays..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                className="flex-1 bg-transparent text-xs text-white placeholder:text-white/15 focus:outline-none"
              />
            </div>
          </div>
          {/* Status dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1) }}
              className="rounded-xl border px-3 py-2 text-xs text-white focus:outline-none appearance-none pr-7 cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Processing</option>
            </select>
            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 rotate-90 pointer-events-none" style={{ color: C.textDim }} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Preview', 'Title', 'Source', 'Duration', 'Replayed On', 'Views', 'Watch Time', 'Avg. Watch Time', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedReplays.map((row) => (
                <tr key={row.id} className="transition-all hover:bg-white/[0.02]" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {/* Preview */}
                  <td className="px-3 py-2.5">
                    <div className="h-8 w-12 rounded-lg flex items-center justify-center" style={{ background: `${row.color}20` }}>
                      <Play className="h-3 w-3" style={{ color: row.color }} fill={row.color} />
                    </div>
                  </td>
                  {/* Title */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-medium text-white">{row.title}</span>
                  </td>
                  {/* Source */}
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: C.textSec }}>{row.source}</span>
                  </td>
                  {/* Duration */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs" style={{ color: C.textSec }}>{row.duration}</span>
                  </td>
                  {/* Replayed On */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs" style={{ color: C.textSec }}>{row.replayedOn}</span>
                  </td>
                  {/* Views */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-semibold" style={{ color: C.success }}>{row.views}</span>
                  </td>
                  {/* Watch Time */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs" style={{ color: C.textSec }}>{row.watchTime}</span>
                  </td>
                  {/* Avg Watch Time */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs" style={{ color: C.textSec }}>{row.avgWatchTime}</span>
                  </td>
                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{
                      background: row.status === 'Active' ? 'rgba(70,211,105,0.12)' : row.status === 'Processing' ? 'rgba(0,113,235,0.12)' : 'rgba(255,255,255,0.06)',
                      color: row.status === 'Active' ? C.success : row.status === 'Processing' ? C.info : C.textTer,
                    }}>
                      <span className={`h-1.5 w-1.5 rounded-full mr-1 ${row.status === 'Processing' ? 'animate-pulse' : ''}`} style={{ background: 'currentColor' }} />
                      {row.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-all" style={{ color: C.textTer }}>
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-all" style={{ color: C.textTer }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-500/15 transition-all" style={{ color: C.accent }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <p className="text-[10px]" style={{ color: C.textDim }}>
            Showing {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, filteredReplays.length)} of {filteredReplays.length} replays
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/[0.04] disabled:opacity-30"
              style={{ color: C.textSec, border: `1px solid ${C.border}` }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {getPaginationRange(currentPage, totalPages).map((p, i) =>
              typeof p === 'string' ? (
                <span key={`dots-${i}`} className="text-xs px-1" style={{ color: C.textDim }}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-medium transition-all"
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
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/[0.04] disabled:opacity-30"
              style={{ color: C.textSec, border: `1px solid ${C.border}` }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {/* Per page dropdown */}
            <div className="relative ml-2">
              <select
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1) }}
                className="rounded-lg border px-2 py-1 text-[10px] text-white focus:outline-none appearance-none pr-6 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <ChevronRight className="absolute right-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rotate-90 pointer-events-none" style={{ color: C.textDim }} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ═══════════════════════════════════════════════════════
          6. BOTTOM ROW
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Devices Donut */}
        <GlassCard className="!p-5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-4 w-4" style={{ color: C.info }} />
            <h3 className="text-sm font-semibold text-white">Devices</h3>
          </div>
          <div className="flex justify-center py-2">
            <DonutChart
              segments={[
                { label: 'Mobile', value: 50.6, color: '#3B82F6' },
                { label: 'Desktop', value: 29.4, color: '#10B981' },
                { label: 'Tablet', value: 15.3, color: '#F97316' },
                { label: 'TV', value: 5.9, color: '#EC4899' },
              ]}
              centerValue="4.25M"
              centerLabel="Total Replays"
            />
          </div>
        </GlassCard>

        {/* Middle: Top Countries */}
        <GlassCard className="!p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4" style={{ color: C.success }} />
            <h3 className="text-sm font-semibold text-white">Top Countries</h3>
          </div>
          <div className="space-y-3">
            {topCountries.map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-white/[0.02]">
                <span className="text-lg flex-shrink-0">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{c.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-white">{c.views}</p>
                  <p className="text-[10px]" style={{ color: C.textTer }}>{c.pct}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full text-center text-[11px] font-medium mt-3 py-2 rounded-lg transition-all hover:bg-white/[0.03]" style={{ color: C.info }}>
            View All Countries
          </button>
        </GlassCard>

        {/* Right: Replay Settings */}
        <GlassCard className="!p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4" style={{ color: C.warning }} />
            <h3 className="text-sm font-semibold text-white">Replay Settings</h3>
          </div>
          <div>
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
          </div>
          {/* Replay Availability Dropdown */}
          <div className="mt-2 pt-3" style={{ borderTop: 'none' }}>
            <label className="text-xs font-medium text-white block mb-1.5">Replay Availability (Days)</label>
            <div className="relative">
              <select
                value={replayDays}
                onChange={e => setReplayDays(e.target.value)}
                className="w-full rounded-xl border px-3 py-2.5 text-xs text-white focus:outline-none appearance-none pr-7 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}
              >
                <option>7 Days</option>
                <option>14 Days</option>
                <option>30 Days</option>
                <option>60 Days</option>
                <option>90 Days</option>
                <option>Unlimited</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rotate-90 pointer-events-none" style={{ color: C.textDim }} />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
