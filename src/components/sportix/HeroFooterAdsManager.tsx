'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Eye, MousePointerClick, DollarSign, TrendingUp, Target,
  Download, Upload, CloudUpload, Pause, X, Play, Search, Filter,
  ChevronDown, ChevronLeft, ChevronRight, Calendar, Plus, Image,
  Edit3, Trash2, MoreHorizontal, Info, Zap, Clock, Film,
  BarChart3, ArrowUpRight, Monitor, Smartphone, Tablet, Settings,
  Check, Image as ImageIcon, Megaphone, Star, ChevronUp, ExternalLink,
  MonitorSmartphone, Layout, Type, Link2, CalendarDays, Video,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#0a0a0a',
  card: '#141414',
  border: 'rgba(255,255,255,0.07)',
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
  teal: '#2a9d8f',
  orange: '#f77f00',
  text: '#ffffff',
  textSec: '#a1a1aa',
  textTer: '#71717a',
  textDim: '#52525b',
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ec4899', '#a855f7']

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
type Tab = 'overview' | 'create' | 'ads-list' | 'preview' | 'top-ads' | 'settings'

interface HeroAdItem {
  id: string
  name: string
  placement: 'Hero Banner' | 'Footer Banner' | 'Sticky Banner' | 'Other'
  size: string
  status: 'Active' | 'Paused' | 'Draft'
  impressions: number
  clicks: number
  ctr: number
  revenue: number
  thumbnail?: string
  mediaUrl?: string
  targetUrl?: string
  deviceTarget: string
  openIn: 'New Tab' | 'Same Tab'
  isFeatured: boolean
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */
const MOCK_ADS: HeroAdItem[] = [
  { id: '1', name: 'Summer Sale Hero Banner', placement: 'Hero Banner', size: '1920×600', status: 'Active', impressions: 725600, clicks: 48200, ctr: 6.64, revenue: 8245.30, targetUrl: 'https://example.com/summer-sale', deviceTarget: 'all', openIn: 'New Tab', isFeatured: true },
  { id: '2', name: 'New Arrivals Footer Banner', placement: 'Footer Banner', size: '1200×200', status: 'Active', impressions: 512400, clicks: 28600, ctr: 5.58, revenue: 3245.60, targetUrl: 'https://example.com/new', deviceTarget: 'all', openIn: 'New Tab', isFeatured: false },
  { id: '3', name: 'Black Friday Hero Banner', placement: 'Hero Banner', size: '1920×600', status: 'Paused', impressions: 325800, clicks: 18700, ctr: 5.74, revenue: 2125.40, targetUrl: 'https://example.com/black-friday', deviceTarget: 'all', openIn: 'New Tab', isFeatured: true },
  { id: '4', name: 'Subscribe Footer Banner', placement: 'Footer Banner', size: '1200×200', status: 'Active', impressions: 285600, clicks: 15300, ctr: 5.36, revenue: 1854.20, targetUrl: 'https://example.com/subscribe', deviceTarget: 'all', openIn: 'New Tab', isFeatured: false },
  { id: '5', name: 'Special Offer Hero Banner', placement: 'Hero Banner', size: '1920×600', status: 'Active', impressions: 198400, clicks: 9800, ctr: 4.94, revenue: 1245.10, targetUrl: 'https://example.com/offer', deviceTarget: 'all', openIn: 'New Tab', isFeatured: false },
  { id: '6', name: 'App Install Sticky Banner', placement: 'Sticky Banner', size: '728×90', status: 'Active', impressions: 450200, clicks: 22500, ctr: 5.0, revenue: 1800.00, targetUrl: 'https://example.com/app', deviceTarget: 'mobile', openIn: 'New Tab', isFeatured: false },
  { id: '7', name: 'World Cup Promo Banner', placement: 'Hero Banner', size: '1920×600', status: 'Draft', impressions: 0, clicks: 0, ctr: 0, revenue: 0, targetUrl: '', deviceTarget: 'all', openIn: 'New Tab', isFeatured: false },
  { id: '8', name: 'Premium Plan Footer', placement: 'Footer Banner', size: '1200×200', status: 'Active', impressions: 167800, clicks: 8420, ctr: 5.02, revenue: 1094.60, targetUrl: 'https://example.com/premium', deviceTarget: 'desktop', openIn: 'New Tab', isFeatured: false },
]

const PERF_DATA = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2025-05-10')
  d.setDate(d.getDate() + i)
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    impressions: Math.floor(Math.random() * 60000 + 40000),
    clicks: Math.floor(Math.random() * 4000 + 1500),
    revenue: Math.floor(Math.random() * 2500 + 800),
  }
})

const PLACEMENT_DATA = [
  { name: 'Hero Banner', value: 12, color: PIE_COLORS[0] },
  { name: 'Footer Banner', value: 8, color: PIE_COLORS[1] },
  { name: 'Sticky Banner', value: 2, color: PIE_COLORS[2] },
  { name: 'Other', value: 2, color: PIE_COLORS[3] },
]

const DEVICE_DATA = [
  { name: 'Mobile', value: 1450000, color: PIE_COLORS[0] },
  { name: 'Desktop', value: 889000, color: PIE_COLORS[1] },
  { name: 'Tablet', value: 419000, color: PIE_COLORS[2] },
  { name: 'Other', value: 91000, color: PIE_COLORS[3] },
]

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toString()
}
function fmtCur(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [d, setD] = useState(0)
  useEffect(() => {
    const t0 = performance.now()
    const dur = 1200
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      setD(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  const f = value >= 100 ? fmtNum(Math.round(d)) : d.toFixed(value % 1 !== 0 ? 2 : 0)
  return <span>{prefix}{f}{suffix}</span>
}

/* ═══════════════════════════════════════════════════════════════
   GLASS CARD
   ═══════════════════════════════════════════════════════════════ */
function GlassCard({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl p-3 sm:p-4 transition-all duration-200 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PURE SVG AREA CHART (replaces recharts AreaChart)
   ═══════════════════════════════════════════════════════════════ */
interface AreaSeries {
  dataKey: string
  name: string
  color: string
  gradientId: string
}

function SvgAreaChart({ data, series, xKey = 'date', height = 280 }: {
  data: Record<string, any>[]
  series: AreaSeries[]
  xKey?: string
  height?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; items: { name: string; color: string; value: number }[] } | null>(null)
  const [svgW, setSvgW] = useState(600)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setSvgW(entry.contentRect.width)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const padL = 10
  const padR = 10
  const padT = 8
  const padB = 28
  const chartW = svgW - padL - padR
  const chartH = height - padT - padB

  // Build point arrays for each series
  const allValues = data.flatMap(d => series.map(s => (d[s.dataKey] as number) || 0))
  const maxVal = Math.max(...allValues, 1)

  const getX = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * chartW
  const getY = (v: number) => padT + chartH - (v / maxVal) * chartH

  const buildPolyline = (dataKey: string) => {
    return data.map((d, i) => {
      const v = (d[dataKey] as number) || 0
      return `${getX(i).toFixed(1)},${getY(v).toFixed(1)}`
    }).join(' ')
  }

  const buildAreaPath = (dataKey: string) => {
    const points = data.map((d, i) => {
      const v = (d[dataKey] as number) || 0
      return `${getX(i).toFixed(1)},${getY(v).toFixed(1)}`
    })
    const x0 = getX(0).toFixed(1)
    const xn = getX(data.length - 1).toFixed(1)
    const baseY = (padT + chartH).toFixed(1)
    return `M${x0},${baseY} L${points.join(' L')} L${xn},${baseY} Z`
  }

  // X-axis labels
  const xLabels = data.filter((_, i) => i % 5 === 0 || i === data.length - 1)

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const ratio = (mx - padL) / chartW
    const idx = Math.round(ratio * (data.length - 1))
    if (idx < 0 || idx >= data.length) { setTooltip(null); return }

    const x = getX(idx)
    const topItem = series.map(s => ({ name: s.name, color: s.color, value: (data[idx][s.dataKey] as number) || 0 }))
      .sort((a, b) => b.value - a.value)[0]
    setTooltip({
      x,
      y: padT,
      label: data[idx][xKey] as string,
      items: series.map(s => ({ name: s.name, color: s.color, value: (data[idx][s.dataKey] as number) || 0 })),
    })
  }, [data, series, xKey, padL, chartW, padT, getX])

  const handleMouseLeave = useCallback(() => { setTooltip(null) }, [setTooltip])

  return (
    <div ref={containerRef} style={{ width: '100%', height, position: 'relative' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${svgW} ${height}`} preserveAspectRatio="none"
        onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ overflow: 'visible' }}>
        <defs>
          {series.map(s => (
            <linearGradient key={s.gradientId} id={s.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padT + (chartH / 4) * i
          return <line key={i} x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
        })}

        {/* X-axis labels */}
        {xLabels.map((d, i) => {
          const idx = data.indexOf(d)
          if (idx === -1) return null
          return (
            <text key={i} x={getX(idx)} y={height - 4} textAnchor="middle" fill="#52525b" fontSize="9" fontFamily="system-ui">
              {d[xKey]}
            </text>
          )
        })}

        {/* Area fills (render in reverse so first series is on top) */}
        {[...series].reverse().map(s => (
          <path key={`area-${s.dataKey}`} d={buildAreaPath(s.dataKey)} fill={`url(#${s.gradientId})`} />
        ))}

        {/* Lines */}
        {series.map(s => (
          <polyline key={`line-${s.dataKey}`} points={buildPolyline(s.dataKey)}
            fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 rounded-xl px-3 py-2 text-xs"
          style={{
            background: 'rgba(0,0,0,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            left: Math.min(tooltip.x, svgW - 140),
            top: tooltip.y + 8,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-white/60 mb-1" style={{ fontSize: 10 }}>{tooltip.label}</p>
          {tooltip.items.map((item, i) => (
            <p key={i} style={{ color: item.color, fontSize: 11 }} className="font-medium">
              {item.name}: {item.name === 'Revenue' ? `$${item.value.toLocaleString()}` : fmtNum(item.value)}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PURE SVG DONUT CHART (replaces recharts PieChart)
   ═══════════════════════════════════════════════════════════════ */
function SvgDonutChart({ data, size = 170, innerR = 50, outerR = 75, id = 'donut' }: {
  data: { name: string; value: number; color: string }[]
  size?: number
  innerR?: number
  outerR?: number
  id?: string
}) {
  const cx = size / 2
  const cy = size / 2
  const total = data.reduce((s, d) => s + d.value, 0)
  const [hovered, setHovered] = useState<string | null>(null)

  const segments = data.reduce<Array<{ name: string; value: number; color: string; startAngle: number; endAngle: number; startRad: number; endRad: number; pathD: string }>>((acc, d) => {
    const angle = total > 0 ? (d.value / total) * 360 : 0
    const startAngle = acc.length === 0 ? -90 : acc[acc.length - 1].endAngle
    const endAngle = startAngle + angle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const gap = data.length > 1 ? 1.5 : 0
    const gapRad = (gap * Math.PI) / 180

    const x1 = cx + outerR * Math.cos(startRad + gapRad)
    const y1 = cy + outerR * Math.sin(startRad + gapRad)
    const x2 = cx + outerR * Math.cos(endRad - gapRad)
    const y2 = cy + outerR * Math.sin(endRad - gapRad)
    const x3 = cx + innerR * Math.cos(endRad - gapRad)
    const y3 = cy + innerR * Math.sin(endRad - gapRad)
    const x4 = cx + innerR * Math.cos(startRad + gapRad)
    const y4 = cy + innerR * Math.sin(startRad + gapRad)

    const largeArc = angle > 180 ? 1 : 0
    const path = `M${x1.toFixed(2)},${y1.toFixed(2)} A${outerR},${outerR} 0 ${largeArc} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} A${innerR},${innerR} 0 ${largeArc} 0 ${x4.toFixed(2)},${y4.toFixed(2)} Z`

    return { ...d, pathD: path, startAngle, endAngle, startRad, endRad, pct: total > 0 ? ((d.value / total) * 100).toFixed(1) : '0' }
  }, [])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map(seg => (
        <path
          key={seg.name}
          d={seg.pathD}
          fill={seg.color}
          stroke="none"
          style={{
            opacity: hovered && hovered !== seg.name ? 0.5 : 1,
            transition: 'opacity 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHovered(seg.name)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function HeroFooterAdsManager() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [ads, setAds] = useState<HeroAdItem[]>(MOCK_ADS)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createTab, setCreateTab] = useState<'hero' | 'footer'>('hero')
  const [previewTab, setPreviewTab] = useState<'hero' | 'footer'>('hero')
  const [previewIdx, setPreviewIdx] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [adLink, setAdLink] = useState('https://example.com')
  const [openIn, setOpenIn] = useState('New Tab')
  const [adEnabled, setAdEnabled] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Settings
  const [adRotation, setAdRotation] = useState('enable')
  const [rotationInterval, setRotationInterval] = useState('30s')
  const [maxAdsPerPos, setMaxAdsPerPos] = useState('3')
  const [showDesktop, setShowDesktop] = useState(true)
  const [showTablet, setShowTablet] = useState(true)
  const [showMobile, setShowMobile] = useState(true)
  const [startDate, setStartDate] = useState('2025-05-10')
  const [endDate, setEndDate] = useState('2025-06-10')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const imgTypes = ['image/jpeg', 'image/png', 'image/webp']
    const vidTypes = ['video/mp4', 'video/quicktime', 'video/webm']
    if (!imgTypes.includes(file.type) && !vidTypes.includes(file.type)) return
    setUploadedFile(file)
    if (uploadPreview) URL.revokeObjectURL(uploadPreview)
    setUploadPreview(URL.createObjectURL(file))
  }
  const isVideoFile = uploadedFile?.type.startsWith('video/')
  const perPage = 8

  // KPIs
  const totalAds = ads.length
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0)
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0)
  const totalRevenue = ads.reduce((s, a) => s + a.revenue, 0)
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgCPM = totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0

  const kpis = [
    { label: 'Total Ads', value: totalAds, prefix: '', suffix: '', change: '+14.8%', positive: true, icon: BarChart3, color: '#4361ee', bg: 'rgba(67,97,238,0.1)' },
    { label: 'Impressions', value: totalImpressions, prefix: '', suffix: '', change: '+18.7%', positive: true, icon: Eye, color: '#7209b7', bg: 'rgba(114,9,183,0.1)' },
    { label: 'Clicks', value: totalClicks, prefix: '', suffix: '', change: '+9.3%', positive: true, icon: MousePointerClick, color: '#2a9d8f', bg: 'rgba(42,157,143,0.1)' },
    { label: 'Revenue', value: totalRevenue, prefix: '$', suffix: '', change: '+16.4%', positive: true, icon: DollarSign, color: '#f77f00', bg: 'rgba(247,127,0,0.1)' },
    { label: 'Avg. CTR', value: avgCTR, prefix: '', suffix: '%', change: '+4.6%', positive: true, icon: Target, color: '#e63946', bg: 'rgba(230,57,70,0.1)' },
    { label: 'Avg. CPM', value: avgCPM, prefix: '$', suffix: '', change: '+8.2%', positive: true, icon: Monitor, color: '#4cc9f0', bg: 'rgba(76,201,240,0.1)' },
  ]

  // Filtered ads
  const filtered = useMemo(() => {
    return ads.filter(a => {
      if (filterType !== 'all') {
        if (filterType === 'hero' && a.placement !== 'Hero Banner') return false
        if (filterType === 'footer' && a.placement !== 'Footer Banner') return false
      }
      if (filterStatus !== 'all' && a.status.toLowerCase() !== filterStatus) return false
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [ads, filterType, filterStatus, search])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Top ads by CTR
  const topAds = useMemo(() => [...ads].filter(a => a.ctr > 0).sort((a, b) => b.ctr - a.ctr).slice(0, 5), [ads])

  // Preview items
  const previewItems = previewTab === 'hero' ? ads.filter(a => a.placement === 'Hero Banner') : ads.filter(a => a.placement === 'Footer Banner')

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'create', label: 'Create Ad', icon: Plus },
    { id: 'ads-list', label: 'All Ads', icon: Image },
    { id: 'preview', label: 'Preview', icon: Monitor },
    { id: 'top-ads', label: 'Top Ads', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="space-y-3 min-w-0">
      {/* ══════════════════════════════════════
          PAGE HEADER
          ════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all duration-200">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hero & Footer Ads</h1>
          <p className="text-sm mt-0.5" style={{ color: C.textTer }}>Create, manage and optimize hero banner & footer ads across your website</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]" style={{ borderColor: C.border, color: C.textSec }}>
            <Calendar className="h-3.5 w-3.5" /> May 10, 2025 - Jun 10, 2025
          </button>
          <button className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]" style={{ borderColor: C.border, color: C.textSec }}>
            <Download className="h-3.5 w-3.5" /> Export Report
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-110" style={{ background: C.accent, boxShadow: `0 4px 20px ${C.accentGlow}` }}>
            <Plus className="h-4 w-4" /> Create New Ad
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          KPI CARDS
          ════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label}
              className="rounded-2xl p-3 relative overflow-hidden transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 blur-2xl" style={{ background: kpi.color }} />
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: C.success }}>
                  <ArrowUpRight className="h-3 w-3" /> {kpi.change}
                </div>
              </div>
              <p className="text-lg font-bold text-white leading-tight"><AnimatedCounter value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} /></p>
              <p className="text-[10px] mt-0.5" style={{ color: C.textTer }}>{kpi.label}</p>
              <p className="text-[9px] mt-1" style={{ color: C.textDim }}>from last 30 days</p>
            </div>
          )
        })}
      </div>

      {/* ══════════════════════════════════════
          TABS
          ════════════════════════════════════════ */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all whitespace-nowrap flex-shrink-0"
              style={{ background: active ? C.accentDim : 'transparent', color: active ? C.accent : C.textTer, border: `1px solid ${active ? 'rgba(229,9,20,0.25)' : C.border}` }}>
              <Icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* ════════════════════════════════════════════════════
          OVERVIEW TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
              {/* Performance Chart — Pure SVG */}
              <GlassCard className="lg:col-span-2" style={{ padding: 0 }}>
                <div className="flex items-center justify-between px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">Performance Over Time</h3>
                    <Info className="h-3.5 w-3.5" style={{ color: C.textDim }} />
                  </div>
                  <button className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium" style={{ borderColor: C.border, color: C.textSec }}>Last 30 Days <ChevronDown className="h-3 w-3" /></button>
                </div>
                <div className="px-3 pb-3" style={{ height: 288 }}>
                  <SvgAreaChart
                    data={PERF_DATA}
                    height={288}
                    series={[
                      { dataKey: 'impressions', name: 'Impressions', color: '#3b82f6', gradientId: 'gImp2' },
                      { dataKey: 'clicks', name: 'Clicks', color: '#22c55e', gradientId: 'gClk2' },
                      { dataKey: 'revenue', name: 'Revenue', color: '#f77f00', gradientId: 'gRev2' },
                    ]}
                  />
                </div>
                <div className="flex items-center justify-center gap-5 pb-4">
                  {[{ label: 'Impressions', color: '#3b82f6' }, { label: 'Clicks', color: '#22c55e' }, { label: 'Revenue', color: '#f77f00' }].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full" style={{ background: l.color }} /><span className="text-[10px] font-medium" style={{ color: C.textTer }}>{l.label}</span></div>
                  ))}
                </div>
              </GlassCard>

              {/* Placement Distribution — Pure SVG Donut */}
              <GlassCard>
                <h3 className="text-sm font-semibold text-white mb-2">Placement Distribution</h3>
                <div className="flex justify-center">
                  <div className="relative" style={{ width: 170, height: 170 }}>
                    <SvgDonutChart data={PLACEMENT_DATA} size={170} innerR={50} outerR={75} id="placementDonut" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-base font-bold text-white">24</span>
                      <span className="text-[9px]" style={{ color: C.textDim }}>Total Ads</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5 mt-4">
                  {PLACEMENT_DATA.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} /><span className="text-[11px] font-medium text-white">{d.name}</span></div>
                      <span className="text-[11px] font-semibold" style={{ color: C.textSec }}>{d.value} <span style={{ color: C.textDim }}>({((d.value / 24) * 100).toFixed(1)}%)</span></span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Device Distribution — Pure SVG Donut */}
            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-2">Device Distribution</h3>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative flex-shrink-0" style={{ width: 170, height: 170 }}>
                  <SvgDonutChart data={DEVICE_DATA} size={170} innerR={50} outerR={75} id="deviceDonut" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-bold text-white">2.85M</span>
                    <span className="text-[9px]" style={{ color: C.textDim }}>Impressions</span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-2">
                  {DEVICE_DATA.map(d => {
                    const total = DEVICE_DATA.reduce((s, x) => s + x.value, 0)
                    const pct = ((d.value / total) * 100).toFixed(1)
                    return (
                      <div key={d.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} /><span className="text-[11px] font-medium text-white">{d.name}</span></div>
                          <span className="text-[11px] font-semibold" style={{ color: C.textSec }}>{fmtNum(d.value)} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full transition-all duration-1000" style={{ background: d.color, width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </GlassCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CREATE AD TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'create' && (
        <div className="space-y-3">
            <GlassCard>
              {/* Tabs */}
              <div className="flex items-center gap-0 mb-3 border-b" style={{ borderColor: C.border }}>
                {(['hero', 'footer'] as const).map(t => (
                  <button key={t} onClick={() => setCreateTab(t)} className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px"
                    style={{ borderColor: createTab === t ? C.accent : 'transparent', color: createTab === t ? C.accent : C.textTer }}>
                    {t === 'hero' ? <Film className="h-4 w-4" /> : <Layout className="h-4 w-4" />}
                    {t === 'hero' ? 'Hero Ads' : 'Footer Ads'}
                  </button>
                ))}
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-2.5 transition-colors cursor-pointer hover:border-red-500/40"
                style={{ borderColor: C.borderLight, background: 'rgba(255,255,255,0.01)' }}
                onClick={() => fileInputRef.current?.click()}>
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: C.accentDim }}>
                  <CloudUpload className="h-7 w-7" style={{ color: C.accent }} />
                </div>
                <p className="text-sm font-medium text-white">Drag & drop image or video or click to upload</p>
                <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110"
                  style={{ background: C.accent }} onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>
                  <Upload className="h-3.5 w-3.5" /> Choose File
                </button>
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" style={{ color: C.textDim }} />
                    <span className="text-[10px]" style={{ color: C.textDim }}>JPG, PNG, WebP (max 10MB)</span>
                  </div>
                  <span className="text-[10px]" style={{ color: C.textDim }}>·</span>
                  <div className="flex items-center gap-1">
                    <Video className="h-3 w-3" style={{ color: C.textDim }} />
                    <span className="text-[10px]" style={{ color: C.textDim }}>MP4, MOV, WebM (max 5GB)</span>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleFileSelect} />
              </div>

              {/* Upload Preview */}
              {uploadPreview && (
                <div className="mt-3 rounded-xl overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="aspect-[21/9]">
                    {isVideoFile ? (
                      <video src={uploadPreview} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={uploadPreview} alt="Upload preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <button onClick={() => { if (uploadPreview) URL.revokeObjectURL(uploadPreview); setUploadPreview(null); setUploadedFile(null) }}
                    className="absolute top-2 right-2 h-7 w-7 rounded-lg flex items-center justify-center bg-black/60 hover:bg-black/80 transition-colors" style={{ color: '#fff' }}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {uploadedFile && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-medium" style={{ background: 'rgba(0,0,0,0.7)', color: C.textSec }}>
                      {isVideoFile ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      {uploadedFile.name} ({(uploadedFile.size / (1024 * 1024)).toFixed(1)}MB)
                    </div>
                  )}
                </div>
              )}

              {/* Ad Link */}
              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Ad Link (URL)</label>
                  <div className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }}>
                    <Link2 className="h-4 w-4 flex-shrink-0" style={{ color: C.textDim }} />
                    <input type="url" value={adLink} onChange={e => setAdLink(e.target.value)} placeholder="https://example.com"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-white/15 focus:outline-none" />
                  </div>
                </div>

                {/* Open In + Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Open In</label>
                      <select value={openIn} onChange={e => setOpenIn(e.target.value)}
                        className="rounded-xl border px-3.5 py-2.5 text-xs text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}>
                        <option>New Tab</option>
                        <option>Same Tab</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-white">Enabled</span>
                    <button onClick={() => setAdEnabled(!adEnabled)} className="relative h-6 w-11 rounded-full transition-colors"
                      style={{ background: adEnabled ? C.success : 'rgba(255,255,255,0.1)' }}>
                      <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200"
                        style={{ left: adEnabled ? 22 : 2 }} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110"
                    style={{ background: C.accent, boxShadow: `0 4px 20px ${C.accentGlow}` }}>
                    <Check className="h-4 w-4" /> Create Ad
                  </button>
                </div>
              </div>
            </GlassCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          ALL ADS LIST TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'ads-list' && (
        <div className="space-y-3">
            <GlassCard style={{ padding: 0 }}>
              <div className="p-3 border-b" style={{ borderColor: C.border }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['all', 'hero', 'footer'].map(t => (
                      <button key={t} onClick={() => { setFilterType(t); setCurrentPage(1) }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all capitalize"
                        style={{ background: filterType === t ? C.accent : 'transparent', color: filterType === t ? '#fff' : C.textTer }}>
                        {t === 'all' ? 'All' : t === 'hero' ? 'Hero Ads' : 'Footer Ads'}
                      </button>
                    ))}
                  </div>
                  <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1) }}
                    className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </select>
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                      <Search className="h-3.5 w-3.5" style={{ color: C.textDim }} />
                      <input type="text" placeholder="Search ads..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                        className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/20 focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b" style={{ borderColor: C.border }}>
                      {['Preview', 'Ad Name', 'Placement', 'Size', 'Status', 'Impressions', 'Clicks', 'CTR', 'Revenue', 'Actions'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(ad => (
                      <tr key={ad.id}
                        className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                        <td className="px-3 py-2.5">
                          <div className="h-8 w-14 rounded-lg flex items-center justify-center" style={{ background: ad.placement === 'Hero Banner' ? 'rgba(229,9,20,0.1)' : 'rgba(168,85,247,0.1)' }}>
                            <Image className="h-4 w-4" style={{ color: ad.placement === 'Hero Banner' ? C.accent : C.purple }} />
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{ad.name}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: ad.placement === 'Hero Banner' ? 'rgba(229,9,20,0.12)' : ad.placement === 'Footer Banner' ? 'rgba(168,85,247,0.12)' : 'rgba(59,130,246,0.12)', color: ad.placement === 'Hero Banner' ? C.accent : ad.placement === 'Footer Banner' ? C.purple : C.info }}>
                            {ad.placement}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono whitespace-nowrap" style={{ color: C.textSec }}>{ad.size}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{
                            background: ad.status === 'Active' ? C.successDim : ad.status === 'Paused' ? 'rgba(234,179,8,0.12)' : 'rgba(255,255,255,0.06)',
                            color: ad.status === 'Active' ? C.success : ad.status === 'Paused' ? C.warning : C.textDim,
                          }}>
                            {ad.status === 'Active' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{ad.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{fmtNum(ad.impressions)}</td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{fmtNum(ad.clicks)}</td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{ad.ctr.toFixed(2)}%</td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{fmtCur(ad.revenue)}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }}><Edit3 className="h-3.5 w-3.5" /></button>
                            <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }}><Download className="h-3.5 w-3.5" /></button>
                            <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-500/10" style={{ color: C.accent }}><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-3 py-2.5 border-t" style={{ borderColor: C.border }}>
                <p className="text-[10px]" style={{ color: C.textDim }}>Showing {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] disabled:opacity-30" style={{ color: C.textSec }}><ChevronLeft className="h-3.5 w-3.5" /></button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all"
                      style={{ background: currentPage === i + 1 ? C.accent : 'transparent', color: currentPage === i + 1 ? '#fff' : C.textTer }}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] disabled:opacity-30" style={{ color: C.textSec }}><ChevronRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </GlassCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PREVIEW TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'preview' && (
        <div className="space-y-3">
            <GlassCard>
              <div className="flex items-center gap-1 mb-3 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {(['hero', 'footer'] as const).map(t => (
                  <button key={t} onClick={() => { setPreviewTab(t); setPreviewIdx(0) }}
                    className="rounded-lg px-4 py-2 text-xs font-medium transition-all"
                    style={{ background: previewTab === t ? C.accent : 'transparent', color: previewTab === t ? '#fff' : C.textTer }}>
                    {t === 'hero' ? 'Hero Banner Preview' : 'Footer Banner Preview'}
                  </button>
                ))}
              </div>

              {previewItems.length > 0 ? (
                <div className="relative">
                  {/* Preview area */}
                  <div className="rounded-xl overflow-hidden" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', aspectRatio: previewTab === 'hero' ? '21/9' : '6/1' }}>
                    <div className="w-full h-full flex items-center justify-center relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-2 p-8">
                          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(229,9,20,0.1)' }}>
                            {previewTab === 'hero' ? <Film className="h-8 w-8" style={{ color: C.accent }} /> : <Layout className="h-8 w-8" style={{ color: C.purple }} />}
                          </div>
                          <p className="text-sm font-semibold text-white">{previewItems[previewIdx]?.name || 'No ads'}</p>
                          <p className="text-[10px]" style={{ color: C.textTer }}>{previewItems[previewIdx]?.size} · {previewItems[previewIdx]?.placement}</p>
                          {previewItems[previewIdx]?.targetUrl && (
                            <p className="text-[10px] flex items-center justify-center gap-1" style={{ color: C.info }}>
                              <ExternalLink className="h-3 w-3" /> {previewItems[previewIdx].targetUrl}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <button onClick={() => setPreviewIdx(i => Math.max(0, i - 1))} disabled={previewIdx === 0}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] disabled:opacity-30" style={{ color: C.textSec, border: `1px solid ${C.border}` }}>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {previewItems.map((_, i) => (
                        <button key={i} onClick={() => setPreviewIdx(i)}
                          className="h-2 w-2 rounded-full transition-all" style={{ background: i === previewIdx ? C.accent : 'rgba(255,255,255,0.15)' }} />
                      ))}
                    </div>
                    <button onClick={() => setPreviewIdx(i => Math.min(previewItems.length - 1, i + 1))} disabled={previewIdx === previewItems.length - 1}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] disabled:opacity-30" style={{ color: C.textSec, border: `1px solid ${C.border}` }}>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-center text-[10px] mt-2" style={{ color: C.textDim }}>{previewIdx + 1} / {previewItems.length}</p>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Image className="h-7 w-7" style={{ color: C.textDim }} />
                  </div>
                  <p className="text-sm font-medium text-white">No {previewTab} ads to preview</p>
                  <p className="text-[11px]" style={{ color: C.textTer }}>Create one in the Create Ad tab</p>
                </div>
              )}
            </GlassCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TOP ADS TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'top-ads' && (
        <div className="space-y-3">
            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Top Performing Ads</h3>
                <button className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium" style={{ borderColor: C.border, color: C.textSec }}>By CTR <ChevronDown className="h-3 w-3" /></button>
              </div>
              <div className="space-y-2">
                {topAds.map((ad, i) => (
                  <div key={ad.id}
                    className="flex items-center gap-2.5 rounded-xl p-3.5 transition-all duration-200 hover:bg-white/[0.02]"
                    style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: i === 0 ? 'rgba(234,179,8,0.15)' : i === 1 ? 'rgba(192,192,192,0.12)' : i === 2 ? 'rgba(205,127,50,0.12)' : 'rgba(255,255,255,0.05)',
                        color: i === 0 ? '#eab308' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : C.textDim }}>
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{ad.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px]" style={{ color: C.textTer }}>
                        <span>{fmtNum(ad.impressions)} imp</span>
                        <span>{fmtNum(ad.clicks)} clicks</span>
                        <span>{fmtCur(ad.revenue)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold" style={{ color: i === 0 ? '#eab308' : C.success }}>{ad.ctr.toFixed(2)}%</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: i === 0 ? 'rgba(234,179,8,0.12)' : C.successDim, color: i === 0 ? '#eab308' : C.success }}>CTR</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          SETTINGS TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="space-y-3">
            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-3">Ads Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-medium text-white">Ad Rotation</p><p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Enable or disable automatic ad rotation</p></div>
                  <select value={adRotation} onChange={e => setAdRotation(e.target.value)} className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}>
                    <option value="enable">Enable</option>
                    <option value="disable">Disable</option>
                  </select>
                </div>
                <div className="h-px" style={{ background: C.border }} />

                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-medium text-white">Show on Desktop</p><p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Display ads on desktop devices</p></div>
                  <button onClick={() => setShowDesktop(!showDesktop)} className="relative h-6 w-11 rounded-full transition-colors" style={{ background: showDesktop ? C.success : 'rgba(255,255,255,0.1)' }}>
                    <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200" style={{ left: showDesktop ? 22 : 2 }} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-medium text-white">Rotation Interval</p><p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Time between ad rotations</p></div>
                  <select value={rotationInterval} onChange={e => setRotationInterval(e.target.value)} className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}>
                    <option value="10s">10 Seconds</option>
                    <option value="30s">30 Seconds</option>
                    <option value="60s">60 Seconds</option>
                    <option value="120s">2 Minutes</option>
                  </select>
                </div>
                <div className="h-px" style={{ background: C.border }} />

                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-medium text-white">Show on Tablet</p><p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Display ads on tablet devices</p></div>
                  <button onClick={() => setShowTablet(!showTablet)} className="relative h-6 w-11 rounded-full transition-colors" style={{ background: showTablet ? C.success : 'rgba(255,255,255,0.1)' }}>
                    <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200" style={{ left: showTablet ? 22 : 2 }} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-medium text-white">Max Ads Per Position</p><p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Maximum number of ads per ad slot</p></div>
                  <select value={maxAdsPerPos} onChange={e => setMaxAdsPerPos(e.target.value)} className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}>
                    <option value="1">1 Ad</option>
                    <option value="3">3 Ads</option>
                    <option value="5">5 Ads</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>
                <div className="h-px" style={{ background: C.border }} />

                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-medium text-white">Show on Mobile</p><p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Display ads on mobile devices</p></div>
                  <button onClick={() => setShowMobile(!showMobile)} className="relative h-6 w-11 rounded-full transition-colors" style={{ background: showMobile ? C.success : 'rgba(255,255,255,0.1)' }}>
                    <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200" style={{ left: showMobile ? 22 : 2 }} />
                  </button>
                </div>
                <div className="h-px" style={{ background: C.border }} />

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Start Date</label>
                    <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }}>
                      <CalendarDays className="h-3.5 w-3.5" style={{ color: C.textDim }} />
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 bg-transparent text-[11px] text-white focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>End Date</label>
                    <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }}>
                      <CalendarDays className="h-3.5 w-3.5" style={{ color: C.textDim }} />
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 bg-transparent text-[11px] text-white focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110"
                  style={{ background: C.accent, boxShadow: `0 4px 20px ${C.accentGlow}` }}>
                  <Check className="h-4 w-4" /> Save Settings
                </button>
              </div>
            </GlassCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CREATE MODAL
          ════════════════════════════════════════════════════ */}
      {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200" onClick={() => setShowCreateModal(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-lg rounded-2xl p-4 space-y-3 transition-all duration-200" style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Create New Ad</h3>
                <button onClick={() => setShowCreateModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }}><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div><label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Ad Name</label><input className="w-full rounded-xl border px-3.5 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }} placeholder="Enter ad name..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Placement</label><select className="w-full rounded-xl border px-3.5 py-2.5 text-sm text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}><option>Hero Banner</option><option>Footer Banner</option><option>Sticky Banner</option></select></div>
                  <div><label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Size</label><select className="w-full rounded-xl border px-3.5 py-2.5 text-sm text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}><option>1920×600</option><option>1200×200</option><option>728×90</option></select></div>
                </div>
                <div><label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Ad Image / Video</label>
                  <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-red-500/40" style={{ borderColor: C.borderLight }}>
                    <CloudUpload className="h-6 w-6" style={{ color: C.accent }} /><p className="text-xs" style={{ color: C.textTer }}>Click to upload</p><p className="text-[10px]" style={{ color: C.textDim }}>JPG, PNG, WebP, MP4, MOV, WebM</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end pt-2">
                <button onClick={() => setShowCreateModal(false)} className="rounded-xl px-4 py-2.5 text-xs font-medium hover:bg-white/[0.04]" style={{ color: C.textSec, border: `1px solid ${C.border}` }}>Cancel</button>
                <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white hover:brightness-110" style={{ background: C.accent }}><Plus className="h-4 w-4" /> Create Ad</button>
              </div>
            </div>
          </div>
      )}
    </div>
  )
}
