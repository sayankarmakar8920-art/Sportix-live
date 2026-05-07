'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  LayoutDashboard, Eye, MousePointerClick, DollarSign, TrendingUp, Target,
  Download, Upload, CloudUpload, Pause, X, Play, Search, Filter,
  ChevronDown, ChevronLeft, ChevronRight, Calendar, Plus, FileVideo,
  Image, Edit3, Trash2, MoreHorizontal, Info, Zap, Clock, Film,
  BarChart3, RefreshCw, ArrowUpRight, ArrowDownRight, Monitor,
  Smartphone, Tablet, Settings, Check, XCircle, GripVertical, SkipForward,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#0a0a0a',
  card: '#141414',
  cardHover: '#1a1a1a',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',
  accent: '#E50914',
  accentDim: 'rgba(229,9,20,0.12)',
  accentGlow: 'rgba(229,9,20,0.35)',
  success: '#22c55e',
  successDim: 'rgba(34,197,94,0.12)',
  warning: '#eab308',
  info: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  sky: '#38bdf8',
  text: '#ffffff',
  textSec: '#a1a1aa',
  textTer: '#71717a',
  textDim: '#52525b',
  glass: 'rgba(255,255,255,0.03)',
  glassBorder: 'rgba(255,255,255,0.06)',
}

const CHART_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ec4899', '#a855f7']

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
type Tab = 'overview' | 'upload' | 'ads-list' | 'timeline' | 'settings'

interface AdItem {
  id: string
  name: string
  type: 'Video' | 'Image' | 'Overlay' | 'Banner'
  placement: 'Pre-roll' | 'Mid-roll' | 'Post-roll' | 'Overlay' | 'Banner'
  duration: string
  status: 'Active' | 'Paused' | 'Draft' | 'Processing'
  impressions: number
  clicks: number
  revenue: number
  ctr: number
  thumbnail?: string
  size?: string
}

interface UploadEntry {
  id: string
  file: File
  status: 'uploading' | 'paused' | 'complete' | 'error' | 'cancelled'
  progress: number
  uploadedBytes: number
  totalBytes: number
  speed: number
  error?: string
  startTime: number
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */
const MOCK_ADS: AdItem[] = [
  { id: '1', name: 'Nike 4K Video Ad', type: 'Video', placement: 'Mid-roll', duration: '00:30', status: 'Active', impressions: 248500, clicks: 14200, revenue: 4250.75, ctr: 5.72, thumbnail: '' },
  { id: '2', name: 'Coca-Cola Banner', type: 'Image', placement: 'Overlay', duration: '00:05', status: 'Active', impressions: 182300, clicks: 8940, revenue: 2890.50, ctr: 4.9, thumbnail: '' },
  { id: '3', name: 'Adidas Pre-Roll', type: 'Video', placement: 'Pre-roll', duration: '00:15', status: 'Active', impressions: 312000, clicks: 18720, revenue: 5616.00, ctr: 6.0, thumbnail: '' },
  { id: '4', name: 'Samsung 4K Showcase', type: 'Video', placement: 'Mid-roll', duration: '00:45', status: 'Paused', impressions: 156200, clicks: 6248, revenue: 1874.40, ctr: 4.0, thumbnail: '' },
  { id: '5', name: 'Red Bull Extreme', type: 'Video', placement: 'Post-roll', duration: '00:20', status: 'Active', impressions: 98700, clicks: 5922, revenue: 1184.40, ctr: 6.0, thumbnail: '' },
  { id: '6', name: 'Puma Banner Ad', type: 'Image', placement: 'Banner', duration: '00:10', status: 'Active', impressions: 421000, clicks: 14735, revenue: 3683.75, ctr: 3.5, thumbnail: '' },
  { id: '7', name: 'BMW M Series', type: 'Video', placement: 'Pre-roll', duration: '00:30', status: 'Draft', impressions: 0, clicks: 0, revenue: 0, ctr: 0, thumbnail: '' },
  { id: '8', name: 'Uber Eats Promo', type: 'Image', placement: 'Overlay', duration: '00:05', status: 'Active', impressions: 267800, clicks: 16068, revenue: 4017.00, ctr: 6.0, thumbnail: '' },
  { id: '9', name: 'Netflix Series Ad', type: 'Video', placement: 'Mid-roll', duration: '00:15', status: 'Processing', impressions: 54200, clicks: 3252, revenue: 813.00, ctr: 6.0, thumbnail: '' },
  { id: '10', name: 'Spotify Music', type: 'Image', placement: 'Banner', duration: '00:08', status: 'Active', impressions: 189400, clicks: 9470, revenue: 2367.50, ctr: 5.0, thumbnail: '' },
]

const PERFORMANCE_DATA = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2025-05-10')
  d.setDate(d.getDate() + i)
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    impressions: Math.floor(Math.random() * 80000 + 60000),
    clicks: Math.floor(Math.random() * 5000 + 2000),
    revenue: Math.floor(Math.random() * 3000 + 1000),
  }
})

const AD_FORMAT_DATA = [
  { name: 'Video Ads', value: 72, color: CHART_COLORS[0] },
  { name: 'Image Ads', value: 44, color: CHART_COLORS[1] },
  { name: 'Overlay Ads', value: 8, color: CHART_COLORS[2] },
  { name: 'Banner Ads', value: 4, color: CHART_COLORS[3] },
]

const AD_TYPE_DATA = [
  { name: 'Pre-Roll', count: 32, pct: '25%', color: CHART_COLORS[0] },
  { name: 'Mid-Roll', count: 68, pct: '53%', color: CHART_COLORS[1] },
  { name: 'Post-Roll', count: 12, pct: '9%', color: CHART_COLORS[2] },
  { name: 'Overlay', count: 8, pct: '6%', color: CHART_COLORS[3] },
  { name: 'Banner', count: 8, pct: '6%', color: CHART_COLORS[4] },
]

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB'
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  return (bytes / 1024).toFixed(0) + ' KB'
}
function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

let _uid = 0
const uid = () => `u${++_uid}_${Date.now()}`

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const dur = 1200
    const t0 = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(value * ease)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  const formatted = value >= 100 && value < 1e6
    ? fmtNum(Math.round(display))
    : value >= 1e6
      ? fmtNum(Math.round(display))
      : display >= 100
        ? Math.round(display).toLocaleString()
        : display.toFixed(value % 1 !== 0 ? 2 : 0)
  return <span>{prefix}{formatted}{suffix}</span>
}

/* ═══════════════════════════════════════════════════════════════
   GLASS CARD
   ═══════════════════════════════════════════════════════════════ */
function GlassCard({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOM TOOLTIP
   ═══════════════════════════════════════════════════════════════ */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' && p.name === 'Revenue' ? `$${p.value.toLocaleString()}` : fmtNum(p.value)}
        </p>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function VideoAdsManager() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [ads, setAds] = useState<AdItem[]>(MOCK_ADS)
  const [uploads, setUploads] = useState<UploadEntry[]>([])
  const [uploadTab, setUploadTab] = useState<'video' | 'image'>('video')
  const [uploadQuality, setUploadQuality] = useState('auto')
  const [autoAds, setAutoAds] = useState(true)
  const [smartPlayback, setSmartPlayback] = useState(true)
  const [adQuality, setAdQuality] = useState('4k')
  const [skipAfter, setSkipAfter] = useState('5s')
  const [deviceTarget, setDeviceTarget] = useState('all')
  const [maxAds, setMaxAds] = useState('unlimited')
  const [minGap, setMinGap] = useState('10min')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const perPage = 8

  /* Simulated upload */
  const simulateUpload = useCallback((file: File) => {
    const entry: UploadEntry = {
      id: uid(), file, status: 'uploading', progress: 0,
      uploadedBytes: 0, totalBytes: file.size, speed: 0, startTime: Date.now(),
    }
    setUploads(prev => [entry, ...prev])
    const interval = setInterval(() => {
      setUploads(prev => prev.map(u => {
        if (u.id !== entry.id) return u
        const newProg = Math.min(u.progress + Math.random() * 3 + 1, 100)
        const elapsed = (Date.now() - u.startTime) / 1000
        const speed = elapsed > 0 ? (newProg / 100) * file.size / elapsed : 0
        return {
          ...u,
          progress: newProg,
          uploadedBytes: (newProg / 100) * file.size,
          speed,
          status: newProg >= 100 ? 'complete' as const : u.status,
        }
      }))
      setUploads(prev => {
        const done = prev.find(u => u.id === entry.id)
        if (done && done.progress >= 100) clearInterval(interval)
        return prev
      })
    }, 200)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    files.forEach(simulateUpload)
  }, [simulateUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(simulateUpload)
    e.target.value = ''
  }, [simulateUpload])

  /* Filtered ads */
  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      if (filterType !== 'all' && ad.type.toLowerCase() !== filterType) return false
      if (filterStatus !== 'all' && ad.status.toLowerCase() !== filterStatus) return false
      if (searchQuery && !ad.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [ads, filterType, filterStatus, searchQuery])

  const totalPages = Math.ceil(filteredAds.length / perPage)
  const pagedAds = filteredAds.slice((currentPage - 1) * perPage, currentPage * perPage)

  /* KPI computation */
  const totalAds = ads.length
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0)
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0)
  const totalRevenue = ads.reduce((s, a) => s + a.revenue, 0)
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgCPM = totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0

  const kpis = [
    { label: 'Total Ads', value: totalAds, prefix: '', suffix: '', change: '+12.5%', positive: true, icon: LayoutDashboard, color: C.info, bg: 'rgba(59,130,246,0.1)' },
    { label: 'Impressions', value: totalImpressions, prefix: '', suffix: '', change: '+18.7%', positive: true, icon: Eye, color: C.purple, bg: 'rgba(168,85,247,0.1)' },
    { label: 'Clicks', value: totalClicks, prefix: '', suffix: '', change: '+9.3%', positive: true, icon: MousePointerClick, color: C.success, bg: 'rgba(34,197,94,0.1)' },
    { label: 'Revenue', value: totalRevenue, prefix: '$', suffix: '', change: '+16.4%', positive: true, icon: DollarSign, color: C.warning, bg: 'rgba(234,179,8,0.1)' },
    { label: 'Avg. CTR', value: avgCTR, prefix: '', suffix: '%', change: '+4.6%', positive: true, icon: Target, color: C.pink, bg: 'rgba(236,72,153,0.1)' },
    { label: 'Avg. CPM', value: avgCPM, prefix: '$', suffix: '', change: '+8.2%', positive: true, icon: BarChart3, color: C.sky, bg: 'rgba(56,189,248,0.1)' },
  ]

  /* Tabs */
  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'upload', label: 'Upload Ad', icon: CloudUpload },
    { id: 'ads-list', label: 'All Ads', icon: Film },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="space-y-5 min-w-0">
      {/* ════════════════════════════════════════
          PAGE HEADER
          ════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Video Ads Manager</h1>
          <p className="text-sm mt-0.5" style={{ color: C.textTer }}>Manage and schedule your video & image ads</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]" style={{ borderColor: C.border, color: C.textSec }}>
            <Calendar className="h-3.5 w-3.5" />
            May 10, 2025 - Jun 10, 2025
          </button>
          <button className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]" style={{ borderColor: C.border, color: C.textSec }}>
            <Download className="h-3.5 w-3.5" /> Export Report
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-110"
            style={{ background: C.accent, boxShadow: `0 4px 20px ${C.accentGlow}` }}
          >
            <Plus className="h-4 w-4" /> Create New Ad
          </button>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════
          KPI CARDS
          ════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-4 relative overflow-hidden group cursor-default"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Subtle glow */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 blur-2xl" style={{ background: kpi.color }} />
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: kpi.positive ? C.success : C.accent }}>
                  <ArrowUpRight className="h-3 w-3" />
                  {kpi.change}
                </div>
              </div>
              <p className="text-lg font-bold text-white leading-tight">
                <AnimatedCounter value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: C.textTer }}>{kpi.label}</p>
              <p className="text-[9px] mt-1" style={{ color: C.textDim }}>from last 30 days</p>
            </motion.div>
          )
        })}
      </div>

      {/* ════════════════════════════════════════
          TABS
          ════════════════════════════════════════ */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background: active ? C.accentDim : 'transparent',
                color: active ? C.accent : C.textTer,
                border: `1px solid ${active ? 'rgba(229,9,20,0.25)' : C.border}`,
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ════════════════════════════════════════════════════
          OVERVIEW TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <AnimatePresence mode="wait">
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Performance Chart + Ad Format Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Performance Line Chart */}
              <GlassCard className="lg:col-span-2" style={{ padding: 0 }}>
                <div className="flex items-center justify-between px-5 pt-5 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">Performance Over Time</h3>
                    <Info className="h-3.5 w-3.5" style={{ color: C.textDim }} />
                  </div>
                  <button className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium" style={{ borderColor: C.border, color: C.textSec }}>
                    Last 30 Days <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <div className="px-3 pb-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PERFORMANCE_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gImp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gClick" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#eab308" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="impressions" stroke="#3b82f6" fill="url(#gImp)" strokeWidth={2} name="Impressions" />
                      <Area type="monotone" dataKey="clicks" stroke="#22c55e" fill="url(#gClick)" strokeWidth={2} name="Clicks" />
                      <Area type="monotone" dataKey="revenue" stroke="#eab308" fill="url(#gRev)" strokeWidth={2} name="Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-5 pb-4">
                  {[{ label: 'Impressions', color: '#3b82f6' }, { label: 'Clicks', color: '#22c55e' }, { label: 'Revenue', color: '#eab308' }].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                      <span className="text-[10px] font-medium" style={{ color: C.textTer }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Ad Format Distribution (Pie) */}
              <GlassCard>
                <h3 className="text-sm font-semibold text-white mb-4">Ad Format Distribution</h3>
                <div className="flex justify-center">
                  <div className="relative">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={AD_FORMAT_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {AD_FORMAT_DATA.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-bold text-white">128</span>
                      <span className="text-[9px]" style={{ color: C.textDim }}>Total Ads</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5 mt-4">
                  {AD_FORMAT_DATA.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-[11px] font-medium text-white">{d.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: C.textSec }}>{d.value} <span style={{ color: C.textDim }}>({((d.value / 128) * 100).toFixed(1)}%)</span></span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Ad Type Distribution (Bar Chart) */}
            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-4">Ad Type Distribution</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={AD_TYPE_DATA} margin={{ top: 0, right: 10, left: -10, bottom: 0 }} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Count">
                      {AD_TYPE_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ════════════════════════════════════════════════════
          UPLOAD TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'upload' && (
        <AnimatePresence mode="wait">
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <GlassCard>
              {/* Upload Tabs */}
              <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <button
                  onClick={() => setUploadTab('video')}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all"
                  style={{
                    background: uploadTab === 'video' ? C.accent : 'transparent',
                    color: uploadTab === 'video' ? '#fff' : C.textTer,
                  }}
                >
                  <FileVideo className="h-3.5 w-3.5" /> Video Ad
                </button>
                <button
                  onClick={() => setUploadTab('image')}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all"
                  style={{
                    background: uploadTab === 'image' ? C.accent : 'transparent',
                    color: uploadTab === 'image' ? '#fff' : C.textTer,
                  }}
                >
                  <Image className="h-3.5 w-3.5" /> Image Ad
                </button>
              </div>

              {/* Drag & Drop */}
              <div
                ref={dragRef}
                onDragOver={(e) => { e.preventDefault(); dragRef.current?.classList.add('ring-2', 'ring-red-500/50') }}
                onDragLeave={() => { dragRef.current?.classList.remove('ring-2', 'ring-red-500/50') }}
                onDrop={(e) => { e.preventDefault(); dragRef.current?.classList.remove('ring-2', 'ring-red-500/50'); handleDrop(e) }}
                className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer hover:border-red-500/40"
                style={{ borderColor: C.borderLight, background: 'rgba(255,255,255,0.01)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: C.accentDim }}>
                  <CloudUpload className="h-7 w-7" style={{ color: C.accent }} />
                </div>
                <p className="text-sm font-medium text-white">
                  Drag & drop {uploadTab} file here
                </p>
                <button
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110"
                  style={{ background: C.accent }}
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                >
                  <Upload className="h-3.5 w-3.5" /> Choose File
                </button>
                <p className="text-[10px]" style={{ color: C.textDim }}>
                  Max file size: 5GB &nbsp;|&nbsp; Supported: {uploadTab === 'video' ? 'MP4, MOV, WebM, HLS' : 'JPG, PNG, WebP, GIF'}
                </p>
                <input ref={fileInputRef} type="file" className="hidden" accept={uploadTab === 'video' ? 'video/*' : 'image/*'} onChange={handleFileSelect} multiple />
              </div>

              {/* Quality Selection */}
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: C.textTer }}>Upload Quality</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'auto', label: 'Auto (Recommended)' },
                    { id: '1080p', label: '1080p' },
                    { id: '2k', label: '2K' },
                    { id: '4k', label: '4K' },
                  ].map(q => (
                    <button
                      key={q.id}
                      onClick={() => setUploadQuality(q.id)}
                      className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all"
                      style={{
                        background: uploadQuality === q.id ? C.accentDim : 'rgba(255,255,255,0.03)',
                        color: uploadQuality === q.id ? C.accent : C.textTer,
                        border: `1px solid ${uploadQuality === q.id ? 'rgba(229,9,20,0.3)' : C.border}`,
                      }}
                    >
                      <div className="h-3 w-3 rounded-full border-2 flex items-center justify-center" style={{ borderColor: uploadQuality === q.id ? C.accent : C.textDim }}>
                        {uploadQuality === q.id && <div className="h-1.5 w-1.5 rounded-full" style={{ background: C.accent }} />}
                      </div>
                      {q.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] mt-2" style={{ color: C.textDim }}>Higher quality may take longer to process</p>
              </div>
            </GlassCard>

            {/* Upload Queue */}
            {uploads.length > 0 && (
              <GlassCard>
                <h3 className="text-sm font-semibold text-white mb-3">Upload Queue</h3>
                <div className="space-y-3">
                  {uploads.map(u => (
                    <div key={u.id} className="rounded-xl p-3.5 space-y-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.accentDim }}>
                            {u.file.type.startsWith('video/') ? <FileVideo className="h-4 w-4" style={{ color: C.accent }} /> : <Image className="h-4 w-4" style={{ color: C.accent }} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{u.file.name}</p>
                            <p className="text-[10px]" style={{ color: C.textDim }}>{fmtBytes(u.totalBytes)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {u.status === 'complete' && <span className="text-[10px] font-semibold" style={{ color: C.success }}>✓ Complete</span>}
                          {u.status === 'error' && <span className="text-[10px] font-semibold" style={{ color: C.accent }}>✕ Error</span>}
                          {u.status === 'uploading' && (
                            <>
                              <button className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]" style={{ color: C.textSec }}>
                                <Pause className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => setUploads(prev => prev.filter(x => x.id !== u.id))} className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]" style={{ color: C.textSec }}>
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {u.status === 'uploading' && (
                        <>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: 'linear-gradient(90deg, #E50914, #ff4d58)' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${u.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px]" style={{ color: C.textDim }}>
                            <span>{Math.round(u.progress)}%</span>
                            <span>{fmtBytes(u.uploadedBytes)} / {fmtBytes(u.totalBytes)}</span>
                            <span>{fmtBytes(u.speed)}/s</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ════════════════════════════════════════════════════
          ADS LIST TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'ads-list' && (
        <AnimatePresence mode="wait">
          <motion.div key="ads-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <GlassCard style={{ padding: 0 }}>
              {/* Filters */}
              <div className="p-4 border-b" style={{ borderColor: C.border }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Type Tabs */}
                  <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['all', 'video', 'image'].map(t => (
                      <button
                        key={t}
                        onClick={() => { setFilterType(t); setCurrentPage(1) }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all capitalize"
                        style={{
                          background: filterType === t ? C.accent : 'transparent',
                          color: filterType === t ? '#fff' : C.textTer,
                        }}
                      >
                        {t === 'video' && <FileVideo className="h-3 w-3" />}
                        {t === 'image' && <Image className="h-3 w-3" />}
                        {t === 'all' ? 'All' : `${t} Ads`}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1) }}
                    className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                    <option value="processing">Processing</option>
                  </select>

                  {/* Search */}
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                      <Search className="h-3.5 w-3.5" style={{ color: C.textDim }} />
                      <input
                        type="text"
                        placeholder="Search ads..."
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                        className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b" style={{ borderColor: C.border }}>
                      {['Preview', 'Ad Name', 'Type', 'Placement', 'Duration', 'Status', 'Impressions', 'Clicks', 'Revenue', 'CTR', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAds.map(ad => (
                      <motion.tr
                        key={ad.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b transition-colors hover:bg-white/[0.02]"
                        style={{ borderColor: C.border }}
                      >
                        <td className="px-4 py-3">
                          <div className="h-8 w-12 rounded-lg flex items-center justify-center" style={{ background: ad.type === 'Video' ? 'rgba(59,130,246,0.1)' : 'rgba(234,179,8,0.1)' }}>
                            {ad.type === 'Video' ? <FileVideo className="h-4 w-4" style={{ color: '#3b82f6' }} /> : <Image className="h-4 w-4" style={{ color: '#eab308' }} />}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{ad.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: ad.type === 'Video' ? 'rgba(59,130,246,0.12)' : ad.type === 'Image' ? 'rgba(234,179,8,0.12)' : 'rgba(168,85,247,0.12)', color: ad.type === 'Video' ? '#3b82f6' : ad.type === 'Image' ? '#eab308' : '#a855f7' }}>
                            {ad.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.textSec }}>{ad.placement}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono" style={{ color: C.textSec }}>{ad.duration}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{
                            background: ad.status === 'Active' ? C.successDim : ad.status === 'Paused' ? 'rgba(234,179,8,0.12)' : ad.status === 'Processing' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.06)',
                            color: ad.status === 'Active' ? C.success : ad.status === 'Paused' ? C.warning : ad.status === 'Processing' ? C.info : C.textDim,
                          }}>
                            {ad.status === 'Active' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                            {ad.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{fmtNum(ad.impressions)}</td>
                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{fmtNum(ad.clicks)}</td>
                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{fmtCurrency(ad.revenue)}</td>
                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{ad.ctr.toFixed(2)}%</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]" style={{ color: C.textSec }}>
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]" style={{ color: C.textSec }}>
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10" style={{ color: C.accent }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: C.border }}>
                <p className="text-[10px]" style={{ color: C.textDim }}>Showing {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filteredAds.length)} of {filteredAds.length} ads</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06] disabled:opacity-30"
                    style={{ color: C.textSec }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all"
                        style={{
                          background: currentPage === p ? C.accent : 'transparent',
                          color: currentPage === p ? '#fff' : C.textTer,
                        }}
                      >
                        {p}
                      </button>
                    )
                  })}
                  {totalPages > 5 && <span className="text-[10px]" style={{ color: C.textDim }}>…</span>}
                  {totalPages > 5 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all"
                      style={{ background: currentPage === totalPages ? C.accent : 'transparent', color: currentPage === totalPages ? '#fff' : C.textTer }}
                    >
                      {totalPages}
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06] disabled:opacity-30"
                    style={{ color: C.textSec }}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ════════════════════════════════════════════════════
          TIMELINE TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'timeline' && (
        <AnimatePresence mode="wait">
          <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Ads Timeline (Unlimited Ads)</h3>
                  <Info className="h-3.5 w-3.5" style={{ color: C.textDim }} />
                </div>
                <div className="flex items-center gap-3">
                  {[
                    { label: 'Video Ad', color: '#3b82f6' },
                    { label: 'Image Ad', color: '#E50914' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                      <span className="text-[10px] font-medium" style={{ color: C.textTer }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Time markers */}
                <div className="flex items-center justify-between mb-2">
                  {Array.from({ length: 13 }, (_, i) => {
                    const totalSec = i * 600 // 10 min intervals = 2h total
                    return (
                      <span key={i} className="text-[9px] font-mono" style={{ color: C.textDim }}>
                        {fmtTime(totalSec)}
                      </span>
                    )
                  })}
                </div>

                {/* Timeline bar */}
                <div className="relative h-16 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Grid lines */}
                  {Array.from({ length: 13 }, (_, i) => (
                    <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: `${(i / 12) * 100}%`, background: 'rgba(255,255,255,0.04)' }} />
                  ))}
                  {/* Ad blocks */}
                  {[
                    { name: 'Nike 4K Ad', start: 0, width: 4, type: 'video' },
                    { name: 'Coca-Cola', start: 6, width: 2, type: 'image' },
                    { name: 'Adidas Pre-Roll', start: 15, width: 3, type: 'video' },
                    { name: 'Samsung', start: 25, width: 5, type: 'video' },
                    { name: 'Puma Banner', start: 35, width: 2, type: 'image' },
                    { name: 'Red Bull', start: 45, width: 3, type: 'video' },
                    { name: 'Uber Eats', start: 55, width: 2, type: 'image' },
                    { name: 'Netflix', start: 65, width: 3, type: 'video' },
                    { name: 'Spotify', start: 75, width: 2, type: 'image' },
                    { name: 'BMW M Series', start: 85, width: 4, type: 'video' },
                  ].map((ad, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="absolute top-2 bottom-2 rounded-lg flex items-center px-2 overflow-hidden cursor-pointer group"
                      style={{
                        left: `${ad.start}%`,
                        width: `${ad.width}%`,
                        background: ad.type === 'video'
                          ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(59,130,246,0.15))'
                          : 'linear-gradient(135deg, rgba(229,9,20,0.3), rgba(229,9,20,0.15))',
                        border: `1px solid ${ad.type === 'video' ? 'rgba(59,130,246,0.3)' : 'rgba(229,9,20,0.3)'}`,
                        transformOrigin: 'left center',
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {ad.type === 'video' ? <FileVideo className="h-3 w-3 flex-shrink-0" style={{ color: '#3b82f6' }} /> : <Image className="h-3 w-3 flex-shrink-0" style={{ color: '#E50914' }} />}
                        <span className="text-[9px] font-medium text-white truncate">{ad.name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress marker */}
                <div className="relative mt-1">
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: C.accent }}
                      initial={{ width: 0 }}
                      animate={{ width: '35%' }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                    />
                  </div>
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
                    style={{ background: C.accent, boxShadow: `0 0 10px ${C.accentGlow}`, left: '35%' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                  />
                </div>
              </div>

              {/* Timeline stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                {[
                  { label: 'Total Ad Breaks', value: '10', sub: 'in 2h stream' },
                  { label: 'Video Ads', value: '6', sub: '60% of breaks' },
                  { label: 'Image Ads', value: '4', sub: '40% of breaks' },
                  { label: 'Avg Gap', value: '12m', sub: 'between breaks' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[10px]" style={{ color: C.textDim }}>{s.label}</p>
                    <p className="text-lg font-bold text-white mt-0.5">{s.value}</p>
                    <p className="text-[9px]" style={{ color: C.textDim }}>{s.sub}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ════════════════════════════════════════════════════
          SETTINGS TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <AnimatePresence mode="wait">
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-5">Ads Settings</h3>
              <div className="space-y-5">
                {/* Auto Ads */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white">Auto Ads</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Automatically insert ads at optimal positions</p>
                  </div>
                  <button
                    onClick={() => setAutoAds(!autoAds)}
                    className="relative h-6 w-11 rounded-full transition-colors"
                    style={{ background: autoAds ? C.success : 'rgba(255,255,255,0.1)' }}
                  >
                    <motion.div
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
                      animate={{ left: autoAds ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="h-px" style={{ background: C.border }} />

                {/* Ad Quality */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white">Ad Quality</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Maximum quality for ad playback</p>
                  </div>
                  <select
                    value={adQuality}
                    onChange={e => setAdQuality(e.target.value)}
                    className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
                  >
                    <option value="480p">480p</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="2k">2K (1440p)</option>
                    <option value="4k">4K (2160p)</option>
                  </select>
                </div>

                <div className="h-px" style={{ background: C.border }} />

                {/* Skip Ads After */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white">Skip Ads After</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Time before viewers can skip ads</p>
                  </div>
                  <select
                    value={skipAfter}
                    onChange={e => setSkipAfter(e.target.value)}
                    className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
                  >
                    <option value="0s">Immediately</option>
                    <option value="3s">3 Seconds</option>
                    <option value="5s">5 Seconds</option>
                    <option value="10s">10 Seconds</option>
                    <option value="15s">15 Seconds</option>
                    <option value="30s">30 Seconds</option>
                  </select>
                </div>

                <div className="h-px" style={{ background: C.border }} />

                {/* Device Targeting */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white">Device Targeting</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Target specific devices for ads</p>
                  </div>
                  <select
                    value={deviceTarget}
                    onChange={e => setDeviceTarget(e.target.value)}
                    className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
                  >
                    <option value="all">All Devices</option>
                    <option value="desktop">Desktop Only</option>
                    <option value="mobile">Mobile Only</option>
                    <option value="tablet">Tablet Only</option>
                  </select>
                </div>

                <div className="h-px" style={{ background: C.border }} />

                {/* Max Ads Per Video */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white">Max Ads Per Video</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Maximum number of ads per video</p>
                  </div>
                  <select
                    value={maxAds}
                    onChange={e => setMaxAds(e.target.value)}
                    className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
                  >
                    <option value="unlimited">Unlimited</option>
                    <option value="1">1 Ad</option>
                    <option value="3">3 Ads</option>
                    <option value="5">5 Ads</option>
                    <option value="10">10 Ads</option>
                  </select>
                </div>

                <div className="h-px" style={{ background: C.border }} />

                {/* Minimum Gap */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white">Minimum Gap Between Ads</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Minimum time between ad breaks</p>
                  </div>
                  <select
                    value={minGap}
                    onChange={e => setMinGap(e.target.value)}
                    className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
                  >
                    <option value="5min">5 Minutes</option>
                    <option value="10min">10 Minutes</option>
                    <option value="15min">15 Minutes</option>
                    <option value="30min">30 Minutes</option>
                  </select>
                </div>

                <div className="h-px" style={{ background: C.border }} />

                {/* Smart Playback */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white">Smart Playback</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Automatically adjust ad quality for smooth playback</p>
                  </div>
                  <button
                    onClick={() => setSmartPlayback(!smartPlayback)}
                    className="relative h-6 w-11 rounded-full transition-colors"
                    style={{ background: smartPlayback ? C.success : 'rgba(255,255,255,0.1)' }}
                  >
                    <motion.div
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
                      animate={{ left: smartPlayback ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110"
                  style={{ background: C.accent, boxShadow: `0 4px 20px ${C.accentGlow}` }}
                >
                  <Check className="h-4 w-4" /> Save Settings
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ════════════════════════════════════════════════════
          CREATE AD MODAL
          ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl p-6 space-y-5"
              style={{
                background: '#181818',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Create New Ad</h3>
                <button onClick={() => setShowCreateModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Ad Name</label>
                  <input className="w-full rounded-xl border px-3.5 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-red-500/50" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }} placeholder="Enter ad name..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Ad Type</label>
                    <select className="w-full rounded-xl border px-3.5 py-2.5 text-sm text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}>
                      <option>Video</option>
                      <option>Image</option>
                      <option>Overlay</option>
                      <option>Banner</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Placement</label>
                    <select className="w-full rounded-xl border px-3.5 py-2.5 text-sm text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}>
                      <option>Pre-Roll</option>
                      <option>Mid-Roll</option>
                      <option>Post-Roll</option>
                      <option>Overlay</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Ad File</label>
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors hover:border-red-500/40" style={{ borderColor: C.borderLight }}>
                    <CloudUpload className="h-6 w-6" style={{ color: C.accent }} />
                    <p className="text-xs" style={{ color: C.textTer }}>Click to upload or drag & drop</p>
                    <p className="text-[10px]" style={{ color: C.textDim }}>MP4, MOV, WebM, JPG, PNG (max 5GB)</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end pt-2">
                <button onClick={() => setShowCreateModal(false)} className="rounded-xl px-4 py-2.5 text-xs font-medium transition-all hover:bg-white/[0.04]" style={{ color: C.textSec, border: `1px solid ${C.border}` }}>
                  Cancel
                </button>
                <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110" style={{ background: C.accent }}>
                  <Plus className="h-4 w-4" /> Create Ad
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
