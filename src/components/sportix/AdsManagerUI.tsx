'use client'

import { useState, useMemo } from 'react'
import {
  Eye, MousePointerClick, DollarSign, Target,
  Download, Calendar, Plus, Search,
  ChevronDown, ChevronLeft, ChevronRight,
  Edit3, MoreHorizontal, Megaphone,
  ArrowUpRight, ArrowDownRight, Copy,
  Rocket, FileText, Layout, X, CloudUpload,
  type LucideIcon,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   THEME CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bg: '#141414',
  card: '#1a1a1a',
  border: 'rgba(255,255,255,0.08)',
  accent: '#E50914',
  white: '#ffffff',
  textSec: '#b3b3b3',
  textTer: '#808080',
  textDim: '#555555',
} as const

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface AdItem {
  id: string
  name: string
  type: 'Video' | 'Banner'
  placement: string
  status: 'Active' | 'Paused'
  impressions: number
  clicks: number
  ctr: number
  revenue: number
}

type PerfMetric = 'revenue' | 'impressions' | 'clicks' | 'ctr' | 'cpc'

interface TopAd {
  rank: number
  name: string
  type: string
  placement: string
  revenue: string
  clicks: number
  color: string
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */
const MOCK_ADS: AdItem[] = [
  { id: '1', name: 'Summer Sale Video', type: 'Video', placement: 'Homepage', status: 'Active', impressions: 24500, clicks: 735, ctr: 11.94, revenue: 26.68 },
  { id: '2', name: 'Gaming Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 18320, clicks: 612, ctr: 11.25, revenue: 15.42 },
  { id: '3', name: 'Tech Promo Video', type: 'Video', placement: 'Sidebar', status: 'Paused', impressions: 12450, clicks: 498, ctr: 10.12, revenue: 9.80 },
  { id: '4', name: 'App Install Banner', type: 'Banner', placement: 'Footer', status: 'Active', impressions: 9850, clicks: 321, ctr: 8.91, revenue: 7.25 },
  { id: '5', name: 'New Collection Video', type: 'Video', placement: 'Homepage', status: 'Active', impressions: 7120, clicks: 178, ctr: 7.61, revenue: 5.60 },
  { id: '6', name: 'Premium Plan Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 16800, clicks: 580, ctr: 10.82, revenue: 12.90 },
  { id: '7', name: 'Sports Highlight Video', type: 'Video', placement: 'Sidebar', status: 'Active', impressions: 11200, clicks: 412, ctr: 9.46, revenue: 8.75 },
  { id: '8', name: 'Food Delivery Banner', type: 'Banner', placement: 'Footer', status: 'Paused', impressions: 8900, clicks: 295, ctr: 8.42, revenue: 6.30 },
  { id: '9', name: 'Fitness App Video', type: 'Video', placement: 'Homepage', status: 'Active', impressions: 13500, clicks: 520, ctr: 11.14, revenue: 11.20 },
  { id: '10', name: 'Travel Deals Banner', type: 'Banner', placement: 'Sidebar', status: 'Active', impressions: 10200, clicks: 380, ctr: 9.58, revenue: 7.85 },
  { id: '11', name: 'Education Promo Video', type: 'Video', placement: 'Homepage', status: 'Active', impressions: 14200, clicks: 490, ctr: 9.72, revenue: 10.50 },
  { id: '12', name: 'Fashion Week Banner', type: 'Banner', placement: 'Footer', status: 'Active', impressions: 7800, clicks: 260, ctr: 8.46, revenue: 5.95 },
  { id: '13', name: 'Auto Show Video', type: 'Video', placement: 'Sidebar', status: 'Paused', impressions: 9100, clicks: 310, ctr: 8.57, revenue: 6.80 },
  { id: '14', name: 'Cloud Storage Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 15600, clicks: 540, ctr: 10.44, revenue: 11.75 },
  { id: '15', name: 'Movie Premiere Video', type: 'Video', placement: 'Homepage', status: 'Active', impressions: 19800, clicks: 680, ctr: 11.62, revenue: 14.30 },
  { id: '16', name: 'Dating App Video', type: 'Video', placement: 'Footer', status: 'Active', impressions: 6400, clicks: 195, ctr: 7.66, revenue: 4.50 },
  { id: '17', name: 'Insurance Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 12500, clicks: 420, ctr: 8.96, revenue: 8.20 },
  { id: '18', name: 'Pet Care Video', type: 'Video', placement: 'Sidebar', status: 'Active', impressions: 5800, clicks: 175, ctr: 7.59, revenue: 3.90 },
  { id: '19', name: 'Smart Home Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 14700, clicks: 510, ctr: 10.61, revenue: 10.10 },
  { id: '20', name: 'Crypto Trading Video', type: 'Video', placement: 'Homepage', status: 'Paused', impressions: 11800, clicks: 390, ctr: 8.47, revenue: 7.60 },
  { id: '21', name: 'Job Portal Banner', type: 'Banner', placement: 'Footer', status: 'Active', impressions: 8200, clicks: 270, ctr: 8.54, revenue: 5.40 },
  { id: '22', name: 'Social Media Video', type: 'Video', placement: 'Sidebar', status: 'Active', impressions: 10500, clicks: 360, ctr: 8.57, revenue: 7.10 },
  { id: '23', name: 'Real Estate Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 13200, clicks: 460, ctr: 10.76, revenue: 9.45 },
  { id: '24', name: 'Gaming Console Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 17100, clicks: 590, ctr: 10.88, revenue: 13.20 },
  { id: '25', name: 'Music Stream Ad', type: 'Banner', placement: 'Footer', status: 'Active', impressions: 7500, clicks: 240, ctr: 7.80, revenue: 4.85 },
]

const PERF_DATA = [
  { date: 'May 3', revenue: 18.72, impressions: 3200, clicks: 380, ctr: 11.8, cpc: 2.48 },
  { date: 'May 4', revenue: 22.45, impressions: 3800, clicks: 450, ctr: 11.8, cpc: 2.42 },
  { date: 'May 5', revenue: 19.80, impressions: 3500, clicks: 420, ctr: 12.0, cpc: 2.50 },
  { date: 'May 6', revenue: 26.68, impressions: 4200, clicks: 510, ctr: 12.1, cpc: 2.40 },
  { date: 'May 7', revenue: 24.30, impressions: 3900, clicks: 470, ctr: 12.0, cpc: 2.45 },
  { date: 'May 8', revenue: 21.15, impressions: 3600, clicks: 430, ctr: 11.9, cpc: 2.43 },
  { date: 'May 9', revenue: 28.90, impressions: 4500, clicks: 538, ctr: 12.0, cpc: 2.38 },
]

const TOP_ADS: TopAd[] = [
  { rank: 1, name: 'Summer Sale Video', type: 'Video', placement: 'Homepage', revenue: '₹26.68', clicks: 8, color: '#FF3B30' },
  { rank: 2, name: 'Gaming Banner', type: 'Banner', placement: 'Homepage', revenue: '₹15.42', clicks: 6, color: '#8B5CF6' },
  { rank: 3, name: 'Tech Promo Video', type: 'Video', placement: 'Sidebar', revenue: '₹9.80', clicks: 4, color: '#F59E0B' },
  { rank: 4, name: 'App Install Banner', type: 'Banner', placement: 'Footer', revenue: '₹7.25', clicks: 3, color: '#3B82F6' },
  { rank: 5, name: 'New Collection Video', type: 'Video', placement: 'Homepage', revenue: '₹5.60', clicks: 2, color: '#10B981' },
]

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function fmtNum(n: number): string {
  return n.toLocaleString('en-IN')
}

function fmtCur(n: number): string {
  return '₹' + n.toFixed(2)
}

/* ═══════════════════════════════════════════════════════════════
   PURE SVG: Area Chart
   ═══════════════════════════════════════════════════════════════ */
function AreaChartSVG({
  data,
  color,
  yDomain,
  metric,
}: {
  data: number[]
  color: string
  yDomain: [number, number]
  metric: PerfMetric
}) {
  const w = 700
  const h = 200
  const padX = 40
  const padY = 10
  const padBottom = 25
  const chartW = w - padX - padX
  const chartH = h - padY - padBottom

  const gradId = `grad-${metric}`

  const points = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * chartH,
  }))

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`

  function formatY(val: number): string {
    if (metric === 'revenue' || metric === 'cpc') return '₹' + val.toFixed(val % 1 === 0 ? 0 : 1)
    if (metric === 'ctr') return val.toFixed(1) + '%'
    return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : String(val)
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {Array.from({ length: 5 }, (_, i) => {
        const y = padY + (i / 4) * chartH
        return (
          <line
            key={i}
            x1={padX}
            y1={y}
            x2={w - padX}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4 4"
          />
        )
      })}
      {/* Y-axis labels */}
      {Array.from({ length: 5 }, (_, i) => {
        const val = yDomain[1] - (i / 4) * (yDomain[1] - yDomain[0])
        const y = padY + (i / 4) * chartH
        return (
          <text
            key={i}
            x={padX - 5}
            y={y + 3}
            textAnchor="end"
            fill={T.textDim}
            fontSize="9"
          >
            {formatY(val)}
          </text>
        )
      })}
      {/* X-axis labels */}
      {data.map((_, i) => {
        const x = padX + (i / (data.length - 1)) * chartW
        return (
          <text
            key={i}
            x={x}
            y={h - 5}
            textAnchor="middle"
            fill={T.textDim}
            fontSize="9"
          >
            {'May ' + (3 + i)}
          </text>
        )
      })}
      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />
      {/* Line */}
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PURE SVG: Donut Chart
   ═══════════════════════════════════════════════════════════════ */
function DonutChartSVG({
  pct,
  color,
  size = 120,
}: {
  pct: number
  color: string
  size?: number
}) {
  const r = size / 2 - 12
  const circumference = 2 * Math.PI * r
  const strokeW = 10

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeW}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
        strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SPARKLINE — pure SVG mini line
   ═══════════════════════════════════════════════════════════════ */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80
  const h = 20
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ')
  return (
    <svg width={w} height={h} className="flex-shrink-0" viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD WRAPPER
   ═══════════════════════════════════════════════════════════════ */
function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{ background: T.card, border: `1px solid ${T.border}` }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   KPI CARD
   ═══════════════════════════════════════════════════════════════ */
function KpiCard({
  label,
  value,
  change,
  positive,
  icon: Icon,
  iconColor,
  iconBg,
  spark,
}: {
  label: string
  value: string
  change: string
  positive: boolean
  icon: LucideIcon
  iconColor: string
  iconBg: string
  spark: number[]
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
        </div>
        <MoreHorizontal className="h-3.5 w-3.5" style={{ color: T.textTer }} />
      </div>
      <p className="text-[10px] mb-0.5" style={{ color: T.textTer }}>{label}</p>
      <p className="text-lg font-bold text-white leading-tight">{value}</p>
      <div className="flex items-center gap-1 mt-1.5">
        {positive ? (
          <ArrowUpRight className="h-3 w-3 text-emerald-400" />
        ) : (
          <ArrowDownRight className="h-3 w-3 text-red-400" />
        )}
        <span
          className="text-[10px] font-medium"
          style={{ color: positive ? '#34d399' : '#f87171' }}
        >
          {change} vs last 7 days
        </span>
      </div>
      <div className="mt-1.5">
        <Sparkline data={spark} color={iconColor} />
      </div>
    </Card>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CREATE AD MODAL
   ═══════════════════════════════════════════════════════════════ */
function CreateAdModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [adName, setAdName] = useState('')
  const [adType, setAdType] = useState('Video')
  const [adPlacement, setAdPlacement] = useState('Homepage')

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-full max-w-lg rounded-xl p-5 space-y-4"
        style={{ background: T.card, border: `1px solid ${T.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Create New Ad</h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
            style={{ color: T.textSec }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: T.textTer }}>
              Ad Name
            </label>
            <input
              value={adName}
              onChange={(e) => setAdName(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#555] focus:outline-none transition-colors"
              style={{ background: T.bg, border: `1px solid ${T.border}` }}
              placeholder="Enter ad name..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: T.textTer }}>
                Type
              </label>
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}
              >
                <option>Video</option>
                <option>Banner</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: T.textTer }}>
                Placement
              </label>
              <select
                value={adPlacement}
                onChange={(e) => setAdPlacement(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
                style={{ background: T.bg, border: `1px solid ${T.border}` }}
              >
                <option>Homepage</option>
                <option>Sidebar</option>
                <option>Footer</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: T.textTer }}>
              Ad File
            </label>
            <div
              className="border-2 border-dashed rounded-lg p-5 flex flex-col items-center gap-2 cursor-pointer transition-colors hover:border-[#E50914]/50"
              style={{ borderColor: T.border }}
            >
              <CloudUpload className="h-6 w-6" style={{ color: T.accent }} />
              <p className="text-xs" style={{ color: T.textSec }}>Click to upload</p>
              <p className="text-[10px]" style={{ color: T.textTer }}>
                MP4, MOV, JPG, PNG (max 10MB)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 justify-end pt-1">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium transition-colors hover:bg-white/5"
            style={{ color: T.textSec, border: `1px solid ${T.border}` }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: T.accent }}
          >
            <Plus className="h-4 w-4" /> Create Ad
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function AdsManagerUI() {
  const [search, setSearch] = useState('')
  const [perfMetric, setPerfMetric] = useState<PerfMetric>('revenue')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(5)
  const [showCreateModal, setShowCreateModal] = useState(false)

  /* ── KPI data ── */
  const kpis = useMemo(
    () => [
      {
        label: 'Total Revenue',
        value: '₹26.68',
        change: '+12.5%',
        positive: true,
        icon: DollarSign,
        iconColor: T.accent,
        iconBg: 'rgba(229,9,20,0.12)',
        spark: [18, 22, 20, 28, 24, 30, 28],
      },
      {
        label: 'Impressions',
        value: '24,500',
        change: '+8.3%',
        positive: true,
        icon: Eye,
        iconColor: '#8B5CF6',
        iconBg: 'rgba(139,92,246,0.12)',
        spark: [30, 35, 32, 40, 38, 42, 45],
      },
      {
        label: 'Clicks',
        value: '735',
        change: '+14.3%',
        positive: true,
        icon: MousePointerClick,
        iconColor: '#F59E0B',
        iconBg: 'rgba(245,158,11,0.12)',
        spark: [12, 15, 14, 18, 16, 20, 22],
      },
      {
        label: 'CTR',
        value: '11.94%',
        change: '+6.7%',
        positive: true,
        icon: Target,
        iconColor: '#EC4899',
        iconBg: 'rgba(236,72,153,0.12)',
        spark: [5, 6, 5.5, 7, 6.5, 7.5, 7],
      },
      {
        label: 'Avg. CPC',
        value: '₹2.45',
        change: '-4.2%',
        positive: false,
        icon: DollarSign,
        iconColor: '#FBBF24',
        iconBg: 'rgba(251,191,36,0.12)',
        spark: [2.6, 2.5, 2.55, 2.4, 2.48, 2.42, 2.38],
      },
    ],
    [],
  )

  /* ── Budget ── */
  const budget = 10000
  const spent = 7500
  const budgetPct = (spent / budget) * 100

  /* ── Metric tab config ── */
  const metricConfig: Record<
    PerfMetric,
    { color: string; yDomain: [number, number] }
  > = useMemo(
    () => ({
      revenue: { color: T.accent, yDomain: [0, 30] },
      impressions: { color: '#8B5CF6', yDomain: [0, 5000] },
      clicks: { color: '#F59E0B', yDomain: [0, 600] },
      ctr: { color: '#EC4899', yDomain: [10, 13] },
      cpc: { color: '#FBBF24', yDomain: [2.2, 2.6] },
    }),
    [],
  )

  const activeMetric = metricConfig[perfMetric]

  /* ── Chart data for selected metric ── */
  const chartData = useMemo(() => PERF_DATA.map((d) => d[perfMetric]), [perfMetric])

  /* ── Filtered & paginated ads ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_ADS
    const q = search.toLowerCase()
    return MOCK_ADS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.placement.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q),
    )
  }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * perPage, currentPage * perPage),
    [filtered, currentPage, perPage],
  )

  function handleSearch(val: string) {
    setSearch(val)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-3 min-w-0" style={{ background: T.bg }}>
      {/* ═══════════════════════════════════════════════════════
          ROW 1: HEADER
          ═══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: T.accent }}
          >
            <Megaphone className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              AdManager
            </h1>
            <p className="text-[11px]" style={{ color: T.textTer }}>
              Track, manage and optimize your ad campaigns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5"
            style={{ color: T.textSec, border: `1px solid ${T.border}` }}
          >
            <Calendar className="h-3.5 w-3.5" />
            May 3 - May 9, 2026
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: T.accent }}
          >
            <Plus className="h-3.5 w-3.5" /> Create New Ad
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          ROW 2: KPI CARDS
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          ROW 3: CHARTS ROW (2/3 + 1/3)
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* ── LEFT: Performance Overview ── */}
        <Card className="lg:col-span-2 p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Performance Overview
              </h3>
              <span
                className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[9px] font-bold"
                style={{ background: 'rgba(229,9,20,0.15)', color: T.accent }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: T.accent }}
                />
                LIVE
              </span>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors hover:bg-white/5"
              style={{ color: T.textSec, border: `1px solid ${T.border}` }}
            >
              7 Days
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Metric Tabs */}
          <div className="flex items-center gap-1 px-3 pb-2">
            {(['revenue', 'impressions', 'clicks', 'ctr', 'cpc'] as const).map(
              (m) => (
                <button
                  key={m}
                  onClick={() => setPerfMetric(m)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-medium capitalize transition-all"
                  style={{
                    background:
                      perfMetric === m
                        ? `${metricConfig[m].color}18`
                        : 'transparent',
                    color:
                      perfMetric === m ? metricConfig[m].color : T.textTer,
                    border: `1px solid ${
                      perfMetric === m
                        ? `${metricConfig[m].color}30`
                        : 'transparent'
                    }`,
                  }}
                >
                  {m}
                </button>
              ),
            )}
          </div>

          {/* Chart Area */}
          <div className="px-3 pb-2 h-48">
            <AreaChartSVG
              data={chartData}
              color={activeMetric.color}
              yDomain={activeMetric.yDomain}
              metric={perfMetric}
            />
          </div>
        </Card>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-2.5">
          {/* Top Performing Ads */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">
                Top Performing Ads
              </h3>
              <button className="text-[10px] font-medium hover:brightness-110 transition-all" style={{ color: T.accent }}>
                View All
              </button>
            </div>
            <div className="space-y-1">
              {TOP_ADS.map((ad) => (
                <div
                  key={ad.rank}
                  className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-white/[0.03] transition-colors"
                >
                  <span
                    className="h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      background:
                        ad.rank === 1
                          ? 'rgba(251,191,36,0.15)'
                          : 'rgba(255,255,255,0.05)',
                      color: ad.rank === 1 ? '#FBBF24' : T.textTer,
                    }}
                  >
                    #{ad.rank}
                  </span>
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${ad.color}15` }}
                  >
                    {ad.type === 'Video' ? (
                      <Eye className="h-3.5 w-3.5" style={{ color: ad.color }} />
                    ) : (
                      <Layout className="h-3.5 w-3.5" style={{ color: ad.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {ad.name}
                    </p>
                    <p className="text-[10px]" style={{ color: T.textTer }}>
                      {ad.type} &bull; {ad.placement}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold" style={{ color: T.accent }}>
                      {ad.revenue}
                    </p>
                    <p className="text-[10px]" style={{ color: T.textTer }}>{ad.clicks} clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Campaign Budget */}
          <Card className="p-3">
            <h3 className="text-sm font-semibold text-white mb-2">
              Campaign Budget
            </h3>
            <div className="flex justify-center mb-2 relative">
              <DonutChartSVG pct={budgetPct} color={T.accent} size={110} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-bold text-white">
                  {Math.round(budgetPct)}%
                </span>
                <span className="text-[9px]" style={{ color: T.textTer }}>
                  of ₹{budget.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: T.textTer }}>Spent</span>
                <span className="text-xs font-bold" style={{ color: T.accent }}>
                  ₹{spent.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: T.textTer }}>Remaining</span>
                <span className="text-xs font-bold text-white">
                  ₹{(budget - spent).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${budgetPct}%`, background: T.accent }}
                />
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-3">
            <h3 className="text-sm font-semibold text-white mb-2">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Create New Ad', icon: Plus, color: T.accent, bg: 'rgba(229,9,20,0.1)' },
                { label: 'Duplicate Ad', icon: Copy, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
                { label: 'Edit Ad', icon: Edit3, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
                { label: 'View Reports', icon: FileText, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-1.5 rounded-lg p-2.5 text-center hover:bg-white/[0.03] transition-colors"
                    style={{ border: `1px solid ${T.border}` }}
                  >
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center"
                      style={{ background: action.bg }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: action.color }} />
                    </div>
                    <p className="text-[10px] font-medium text-white">
                      {action.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          ROW 4: ALL ADS TABLE
          ═══════════════════════════════════════════════════════ */}
      <Card className="p-0 overflow-hidden">
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">All Ads</h3>
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold"
              style={{ background: 'rgba(229,9,20,0.15)', color: T.accent }}
            >
              {MOCK_ADS.length} Total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors hover:bg-white/5"
              style={{ color: T.textSec, border: `1px solid ${T.border}` }}
            >
              Columns <ChevronDown className="h-3 w-3" />
            </button>
            <button
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors hover:bg-white/5"
              style={{ color: T.textSec, border: `1px solid ${T.border}` }}
            >
              Export <Download className="h-3 w-3" />
            </button>
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5"
              style={{ border: `1px solid ${T.border}` }}
            >
              <Search className="h-3.5 w-3.5" style={{ color: T.textTer }} />
              <input
                type="text"
                placeholder="Search ads..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-28 bg-transparent text-[11px] text-white placeholder:text-[#555] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr style={{ background: T.bg }}>
                {['AD INFO', 'TYPE/SLOT', 'STATUS', 'IMPRESSIONS', 'CLICKS', 'CTR', 'REVENUE', 'ACTIONS'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: T.textTer }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {paged.map((ad) => (
                <tr
                  key={ad.id}
                  className="hover:bg-white/[0.015] transition-colors"
                  style={{ borderTop: `1px solid ${T.border}` }}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-8 w-11 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            ad.type === 'Video'
                              ? 'rgba(229,9,20,0.1)'
                              : 'rgba(59,130,246,0.1)',
                        }}
                      >
                        {ad.type === 'Video' ? (
                          <Eye
                            className="h-3.5 w-3.5"
                            style={{ color: T.accent }}
                          />
                        ) : (
                          <Layout className="h-3.5 w-3.5" style={{ color: '#3B82F6' }} />
                        )}
                      </div>
                      <p className="text-xs font-medium text-white truncate max-w-[140px]">
                        {ad.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background:
                          ad.type === 'Video'
                            ? 'rgba(229,9,20,0.1)'
                            : 'rgba(59,130,246,0.1)',
                        color: ad.type === 'Video' ? T.accent : '#3B82F6',
                      }}
                    >
                      {ad.type}
                    </span>
                    <p className="text-[9px] mt-1" style={{ color: T.textTer }}>
                      {ad.placement}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background:
                          ad.status === 'Active'
                            ? 'rgba(52,211,153,0.1)'
                            : 'rgba(251,191,36,0.1)',
                        color:
                          ad.status === 'Active' ? '#34d399' : '#FBBF24',
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background:
                            ad.status === 'Active' ? '#34d399' : '#FBBF24',
                        }}
                      />
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-white">{fmtNum(ad.impressions)}</td>
                  <td className="px-3 py-2.5 text-white">{fmtNum(ad.clicks)}</td>
                  <td className="px-3 py-2.5 text-white">{ad.ctr}%</td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: T.accent }}>
                    {fmtCur(ad.revenue)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-white/5 transition-colors">
                        <Edit3 className="h-3 w-3" style={{ color: T.textTer }} />
                      </button>
                      <button className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-white/5 transition-colors">
                        <MoreHorizontal className="h-3 w-3" style={{ color: T.textTer }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2.5"
          style={{ borderTop: `1px solid ${T.border}` }}
        >
          <p className="text-[10px]" style={{ color: T.textTer }}>
            Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} ads
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5 disabled:opacity-30"
              style={{ color: T.textSec, border: `1px solid ${T.border}` }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-colors hover:bg-white/5"
                style={{
                  background: currentPage === p ? T.accent : 'transparent',
                  color: currentPage === p ? '#fff' : T.textSec,
                  border: `1px solid ${currentPage === p ? T.accent : T.border}`,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5 disabled:opacity-30"
              style={{ color: T.textSec, border: `1px solid ${T.border}` }}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          MODAL
          ═══════════════════════════════════════════════════════ */}
      <CreateAdModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  )
}
