'use client'

import { useState, useRef, useMemo } from 'react'
import {
  Calendar, Download, Plus, ChevronDown, Search, Filter,
  CloudUpload, Upload, FileVideo, Image as ImageIcon, Edit3, Trash2,
  Info, TrendingUp, LayoutDashboard, Eye, MousePointerClick, DollarSign,
  Target, BarChart3, Play, Clock, ArrowUpRight, Monitor, Smartphone,
  Tablet, Settings, MoreHorizontal, GripVertical,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#141414',
  card: '#1a1a1a',
  cardInner: '#222222',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',
  accent: '#E50914',
  accentDim: 'rgba(229,9,20,0.15)',
  text: '#ffffff',
  textSec: '#999999',
  textTer: '#666666',
  textDim: '#444444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  orange: '#f59e0b',
  pink: '#ec4899',
  cyan: '#06b6d4',
  yellow: '#eab308',
}

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface KPIMetric {
  label: string
  value: string
  change: string
  positive: boolean
  iconBg: string
  iconColor: string
  Icon: React.ComponentType<{ className?: string }>
}

interface AdRow {
  id: string
  name: string
  type: 'Video' | 'Image'
  placement: string
  duration: string
  status: 'Active' | 'Paused'
  revenue: string
  color: string
}

interface TimelineAd {
  id: string
  time: string
  name: string
  type: 'Video' | 'Image'
  duration: string
  color: string
  startPct: number
  widthPct: number
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */
const KPI_DATA: KPIMetric[] = [
  { label: 'Total Ads', value: '128', change: '+12.5%', positive: true, iconBg: 'rgba(59,130,246,0.15)', iconColor: C.blue, Icon: LayoutDashboard },
  { label: 'Impressions', value: '2.45M', change: '+18.7%', positive: true, iconBg: 'rgba(139,92,246,0.15)', iconColor: C.purple, Icon: Eye },
  { label: 'Clicks', value: '148.7K', change: '+9.3%', positive: true, iconBg: 'rgba(16,185,129,0.15)', iconColor: C.green, Icon: MousePointerClick },
  { label: 'Revenue', value: '$24,780.50', change: '+16.4%', positive: true, iconBg: 'rgba(245,158,11,0.15)', iconColor: C.orange, Icon: DollarSign },
  { label: 'Avg. CTR', value: '6.06%', change: '+4.6%', positive: true, iconBg: 'rgba(236,72,153,0.15)', iconColor: C.pink, Icon: Target },
  { label: 'Avg. CPM', value: '$10.12', change: '+8.2%', positive: true, iconBg: 'rgba(6,182,212,0.15)', iconColor: C.cyan, Icon: BarChart3 },
]

const MOCK_ADS: AdRow[] = [
  { id: '1', name: 'Nike 4K Video Ad', type: 'Video', placement: 'Mid-roll', duration: '00:30', status: 'Active', revenue: '$4,250.75', color: '#3b82f6' },
  { id: '2', name: 'Coca-Cola Banner', type: 'Image', placement: 'Overlay', duration: '00:05', status: 'Active', revenue: '$2,890.50', color: '#10b981' },
  { id: '3', name: 'Adidas Pre-Roll', type: 'Video', placement: 'Pre-roll', duration: '00:15', status: 'Active', revenue: '$5,616.00', color: '#8b5cf6' },
  { id: '4', name: 'Samsung 4K Showcase', type: 'Video', placement: 'Mid-roll', duration: '00:45', status: 'Paused', revenue: '$1,874.40', color: '#f59e0b' },
  { id: '5', name: 'Red Bull Extreme', type: 'Video', placement: 'Post-roll', duration: '00:20', status: 'Active', revenue: '$1,184.40', color: '#ec4899' },
]

const TIMELINE_ADS: TimelineAd[] = [
  { id: '1', time: '00:00:00', name: 'Nike 4K Video Ad', type: 'Video', duration: '00:30', color: '#3b82f6', startPct: 0, widthPct: 10 },
  { id: '2', time: '00:25:00', name: 'Adidas Pre-Roll', type: 'Video', duration: '00:15', color: '#8b5cf6', startPct: 20.8, widthPct: 6 },
  { id: '3', time: '00:50:00', name: 'Red Bull Extreme', type: 'Video', duration: '00:20', color: '#ec4899', startPct: 41.7, widthPct: 8 },
  { id: '4', time: '01:10:00', name: 'Coca-Cola Banner', type: 'Image', duration: '00:05', color: '#10b981', startPct: 58.3, widthPct: 3 },
  { id: '5', time: '01:30:00', name: 'Uber Eats Promo', type: 'Image', duration: '00:05', color: '#f59e0b', startPct: 75, widthPct: 3 },
  { id: '6', time: '01:45:00', name: 'BMW M Series', type: 'Video', duration: '00:30', color: '#06b6d4', startPct: 87.5, widthPct: 10 },
]

const AD_FORMAT_DATA = [
  { name: 'Video Ads', value: 56.3, color: '#3b82f6' },
  { name: 'Image Ads', value: 34.4, color: '#10b981' },
  { name: 'Overlay Ads', value: 6.3, color: '#eab308' },
  { name: 'Banner Ads', value: 3.1, color: '#ec4899' },
]

const AD_TYPE_DATA = [
  { name: 'Pre-roll', count: 32, pct: '25%', color: '#3b82f6' },
  { name: 'Mid-roll', count: 68, pct: '53%', color: '#10b981' },
  { name: 'Post-roll', count: 12, pct: '9%', color: '#eab308' },
  { name: 'Overlay', count: 8, pct: '6%', color: '#ec4899' },
  { name: 'Banner', count: 8, pct: '6%', color: '#8b5cf6' },
]

const PERFORMANCE_LINE_DATA = [
  { x: 0, impressions: 80, clicks: 30, revenue: 20 },
  { x: 20, impressions: 120, clicks: 45, revenue: 35 },
  { x: 40, impressions: 100, clicks: 40, revenue: 28 },
  { x: 60, impressions: 160, clicks: 55, revenue: 50 },
  { x: 80, impressions: 140, clicks: 50, revenue: 42 },
  { x: 100, impressions: 180, clicks: 65, revenue: 60 },
  { x: 120, impressions: 155, clicks: 58, revenue: 48 },
  { x: 140, impressions: 200, clicks: 72, revenue: 70 },
  { x: 160, impressions: 175, clicks: 60, revenue: 55 },
  { x: 180, impressions: 220, clicks: 80, revenue: 85 },
  { x: 200, impressions: 190, clicks: 68, revenue: 65 },
  { x: 220, impressions: 240, clicks: 88, revenue: 95 },
  { x: 240, impressions: 210, clicks: 75, revenue: 78 },
  { x: 260, impressions: 250, clicks: 90, revenue: 100 },
  { x: 280, impressions: 225, clicks: 82, revenue: 88 },
  { x: 300, impressions: 200, clicks: 70, revenue: 72 },
  { x: 320, impressions: 180, clicks: 65, revenue: 60 },
  { x: 340, impressions: 210, clicks: 78, revenue: 80 },
  { x: 360, impressions: 195, clicks: 72, revenue: 75 },
  { x: 380, impressions: 230, clicks: 85, revenue: 90 },
  { x: 400, impressions: 245, clicks: 92, revenue: 98 },
  { x: 420, impressions: 215, clicks: 80, revenue: 82 },
  { x: 440, impressions: 250, clicks: 95, revenue: 105 },
  { x: 460, impressions: 235, clicks: 88, revenue: 92 },
  { x: 480, impressions: 260, clicks: 98, revenue: 110 },
  { x: 500, impressions: 240, clicks: 90, revenue: 100 },
  { x: 520, impressions: 220, clicks: 82, revenue: 85 },
  { x: 540, impressions: 250, clicks: 95, revenue: 108 },
  { x: 560, impressions: 230, clicks: 88, revenue: 95 },
  { x: 580, impressions: 210, clicks: 78, revenue: 80 },
  { x: 600, impressions: 240, clicks: 92, revenue: 102 },
]

const DEVICE_DATA = [
  { name: 'Mobile', value: 52.5, color: '#3b82f6' },
  { name: 'Desktop', value: 28.7, color: '#10b981' },
  { name: 'Tablet', value: 18.8, color: '#f59e0b' },
]

const COUNTRY_DATA = [
  { name: 'United States', code: '🇺🇸', pct: 45.6 },
  { name: 'India', code: '🇮🇳', pct: 24.3 },
  { name: 'United Kingdom', code: '🇬🇧', pct: 12.8 },
  { name: 'Germany', code: '🇩🇪', pct: 8.4 },
  { name: 'Canada', code: '🇨🇦', pct: 5.1 },
  { name: 'Australia', code: '🇦🇺', pct: 3.8 },
]

const TOP_ADS_DATA = [
  { name: 'Nike 4K Video Ad', revenue: '$4,250.75', color: '#3b82f6' },
  { name: 'Adidas Pre-Roll', revenue: '$5,616.00', color: '#8b5cf6' },
  { name: 'Uber Eats Promo', revenue: '$4,017.00', color: '#10b981' },
]

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function buildSmoothPath(data: number[], width: number, height: number, maxY: number): string {
  if (data.length < 2) return ''
  const stepX = width / (data.length - 1)
  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - (v / maxY) * height,
  }))
  let d = `M ${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = prev.x + stepX * 0.4
    const cpx2 = curr.x - stepX * 0.4
    d += ` C ${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`
  }
  return d
}

function buildAreaPath(linePath: string, width: number, height: number): string {
  return `${linePath} L ${width},${height} L 0,${height} Z`
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ── KPI Card ── */
function KPICard({ kpi }: { kpi: KPIMetric }) {
  const Icon = kpi.Icon
  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: C.cardInner,
        border: `1px solid ${C.border}`,
      }}
    >
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 blur-2xl" style={{ background: kpi.iconColor }} />
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: kpi.iconBg }}>
          <Icon className="h-5 w-5" style={{ color: kpi.iconColor }} />
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#10b981' }}>
          <ArrowUpRight className="h-3.5 w-3.5" />
          {kpi.change}
        </div>
      </div>
      <p className="text-2xl font-bold text-white leading-tight">{kpi.value}</p>
      <p className="text-xs mt-1" style={{ color: C.textSec }}>{kpi.label}</p>
    </div>
  )
}

/* ── Toggle Switch ── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0"
      style={{ background: on ? C.accent : '#333' }}
    >
      <div
        className="absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform"
        style={{ left: on ? '20px' : '3px' }}
      />
    </button>
  )
}

/* ── Status Badge ── */
function StatusBadge({ status }: { status: 'Active' | 'Paused' }) {
  const isActive = status === 'Active'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
      style={{
        background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
        color: isActive ? '#10b981' : '#f59e0b',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: isActive ? '#10b981' : '#f59e0b' }} />
      {status}
    </span>
  )
}

/* ── Pie Chart (SVG) ── */
function buildPieSlices(data: { name: string; value: number; color: string }[], cx: number, cy: number, innerRadius: number, outerRadius: number) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return data.reduce<{ acc: { path: string; color: string; name: string; value: number }[]; currentAngle: number }>(
    (prev, d) => {
      const angle = (d.value / total) * 360
      const startAngle = prev.currentAngle
      const endAngle = prev.currentAngle + angle
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180
      const x1 = cx + outerRadius * Math.cos(startRad)
      const y1 = cy + outerRadius * Math.sin(startRad)
      const x2 = cx + outerRadius * Math.cos(endRad)
      const y2 = cy + outerRadius * Math.sin(endRad)
      const ix1 = cx + innerRadius * Math.cos(endRad)
      const iy1 = cy + innerRadius * Math.sin(endRad)
      const ix2 = cx + innerRadius * Math.cos(startRad)
      const iy2 = cy + innerRadius * Math.sin(startRad)
      const largeArc = angle > 180 ? 1 : 0
      const slice = {
        path: `M ${x1},${y1} A ${outerRadius},${outerRadius} 0 ${largeArc},1 ${x2},${y2} L ${ix1},${iy1} A ${innerRadius},${innerRadius} 0 ${largeArc},0 ${ix2},${iy2} Z`,
        color: d.color,
        name: d.name,
        value: d.value,
      }
      return { acc: [...prev.acc, slice], currentAngle: endAngle }
    },
    { acc: [], currentAngle: -90 }
  ).acc
}

function PieChartSVG({ data, size = 180, innerRadius = 55, outerRadius = 80 }: {
  data: { name: string; value: number; color: string }[]
  size?: number
  innerRadius?: number
  outerRadius?: number
}) {
  const cx = size / 2
  const cy = size / 2
  const slices = buildPieSlices(data, cx, cy, innerRadius, outerRadius)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke={C.cardInner} strokeWidth={2} />
      ))}
    </svg>
  )
}

/* ── Donut Chart (SVG) ── */
function DonutChartSVG({ data, size = 160, innerRadius = 48, outerRadius = 68 }: {
  data: { name: string; value: number; color: string }[]
  size?: number
  innerRadius?: number
  outerRadius?: number
}) {
  const cx = size / 2
  const cy = size / 2
  const slices = buildPieSlices(data, cx, cy, innerRadius, outerRadius)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke={C.cardInner} strokeWidth={2} />
      ))}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function VideoAdsAnalyticsPage() {
  /* ── State ── */
  const [uploadTab, setUploadTab] = useState<'video' | 'image'>('video')
  const [uploadQuality, setUploadQuality] = useState('auto')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [autoAds, setAutoAds] = useState(true)
  const [skipAfter, setSkipAfter] = useState('5 Seconds')
  const [maxAds, setMaxAds] = useState('Unlimited')
  const [minGap, setMinGap] = useState('10 Minutes')
  const [adQuality, setAdQuality] = useState('4K Auto')
  const [adPlayback, setAdPlayback] = useState('Smart No Lag')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── Filtered Ads ── */
  const filteredAds = useMemo(() => {
    return MOCK_ADS.filter(ad => {
      if (filterType !== 'all' && ad.type.toLowerCase() !== filterType) return false
      if (filterStatus !== 'all' && ad.status.toLowerCase() !== filterStatus) return false
      if (searchQuery && !ad.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [filterType, filterStatus, searchQuery])

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="min-w-0 space-y-4" style={{ background: C.bg }}>
      {/* ════════════════════════════════════════
          1. HEADER
          ════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontSize: '24px' }}>
            Video Ads Analytics
          </h1>
          <p className="mt-0.5" style={{ fontSize: '12px', color: C.textSec }}>
            Track, analyze and optimize your video &amp; image ads performance
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Range */}
          <button
            className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]"
            style={{ borderColor: C.border, color: C.textSec }}
          >
            <Calendar className="h-3.5 w-3.5" />
            May 10, 2025 - Jun 10, 2025
          </button>

          {/* Export Report */}
          <button
            className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]"
            style={{ borderColor: C.border, color: C.textSec, background: 'rgba(255,255,255,0.03)' }}
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </button>

          {/* Create New Ad */}
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-110"
            style={{ background: C.accent, boxShadow: '0 4px 20px rgba(229,9,20,0.35)' }}
          >
            <Plus className="h-4 w-4" />
            Create New Ad
          </button>

          {/* Admin Dropdown */}
          <button
            className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]"
            style={{ borderColor: C.border, color: C.textSec }}
          >
            <Settings className="h-3.5 w-3.5" />
            Admin
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════
          2. KPI METRIC CARDS
          ════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {KPI_DATA.map((kpi) => (
          <KPICard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* ════════════════════════════════════════
          3. THREE CHARTS ROW
          ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* ── Performance Over Time (Line Chart) ── */}
        <div
          className="lg:col-span-2 rounded-2xl p-3 sm:p-4"
          style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Performance Over Time</h3>
              <Info className="h-3.5 w-3.5" style={{ color: C.textDim }} />
            </div>
            <button
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium"
              style={{ borderColor: C.border, color: C.textSec }}
            >
              Last 30 Days <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* SVG Line Chart */}
          <div className="relative" style={{ height: '280px' }}>
            <svg width="100%" height="100%" viewBox="0 0 620 280" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eab308" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 56, 112, 168, 224, 280].map(y => (
                <line key={y} x1="0" y1={y} x2="620" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              ))}

              {/* Y-axis labels */}
              {['250K', '200K', '150K', '100K', '50K', '0'].map((label, i) => (
                <text key={label} x="0" y={i * 56 + 4} fill="#666" fontSize="10" fontFamily="sans-serif">
                  {label}
                </text>
              ))}

              {/* X-axis labels */}
              {['May 10', 'May 20', 'May 30', 'Jun 10'].map((label, i) => (
                <text key={label} x={i * 200} y="275" fill="#666" fontSize="10" fontFamily="sans-serif" textAnchor="start">
                  {label}
                </text>
              ))}

              {/* Chart area - offset by 30px left for Y labels */}
              <g transform="translate(40, 0)">
                {/* Impressions area */}
                <path
                  d={buildAreaPath(
                    buildSmoothPath(
                      PERFORMANCE_LINE_DATA.map(d => d.impressions),
                      560, 245, 260
                    ),
                    560, 245
                  )}
                  fill="url(#gradImpressions)"
                />
                {/* Impressions line */}
                <path
                  d={buildSmoothPath(
                    PERFORMANCE_LINE_DATA.map(d => d.impressions),
                    560, 245, 260
                  )}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />

                {/* Clicks area */}
                <path
                  d={buildAreaPath(
                    buildSmoothPath(
                      PERFORMANCE_LINE_DATA.map(d => d.clicks),
                      560, 245, 260
                    ),
                    560, 245
                  )}
                  fill="url(#gradClicks)"
                />
                {/* Clicks line */}
                <path
                  d={buildSmoothPath(
                    PERFORMANCE_LINE_DATA.map(d => d.clicks),
                    560, 245, 260
                  )}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />

                {/* Revenue area */}
                <path
                  d={buildAreaPath(
                    buildSmoothPath(
                      PERFORMANCE_LINE_DATA.map(d => d.revenue),
                      560, 245, 260
                    ),
                    560, 245
                  )}
                  fill="url(#gradRevenue)"
                />
                {/* Revenue line */}
                <path
                  d={buildSmoothPath(
                    PERFORMANCE_LINE_DATA.map(d => d.revenue),
                    560, 245, 260
                  )}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2"
                />
              </g>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-3">
            {[
              { label: 'Impressions', color: '#3b82f6' },
              { label: 'Clicks', color: '#10b981' },
              { label: 'Revenue', color: '#eab308' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                <span className="text-xs font-medium" style={{ color: C.textSec }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ad Format Distribution (Pie Chart) ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
        >
          <h3 className="text-sm font-semibold text-white mb-4">Ad Format Distribution</h3>

          <div className="flex justify-center relative">
            <div className="relative">
              <PieChartSVG data={AD_FORMAT_DATA} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-white">128</span>
                <span className="text-[10px]" style={{ color: C.textTer }}>Total Ads</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3 mt-5">
            {AD_FORMAT_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs font-medium text-white">{d.name}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: C.textSec }}>
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ad Type Distribution (Horizontal Bar Chart) ── */}
      <div
        className="rounded-2xl p-3 sm:p-4"
        style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
      >
        <h3 className="text-sm font-semibold text-white mb-5">Ad Type Distribution</h3>

        <div className="space-y-4">
          {AD_TYPE_DATA.map(d => (
            <div key={d.name} className="flex items-center gap-3 md:gap-4">
              <span className="text-xs font-medium text-white w-16 text-right flex-shrink-0">{d.name}</span>
              <div className="flex-1 h-7 rounded-lg overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="h-full rounded-lg flex items-center justify-end pr-3 transition-all"
                  style={{
                    width: `${(d.count / 80) * 100}%`,
                    background: d.color,
                    minWidth: '40px',
                  }}
                >
                  <span className="text-[11px] font-bold text-white">{d.count}</span>
                </div>
              </div>
              <span className="text-xs font-semibold w-10 text-right flex-shrink-0" style={{ color: C.textSec }}>
                {d.pct}
              </span>
            </div>
          ))}
        </div>

        {/* X-axis marker */}
        <div className="flex items-center justify-between mt-3 px-20">
          {[0, 20, 40, 60, 80].map(v => (
            <span key={v} className="text-[10px]" style={{ color: C.textDim }}>{v}</span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          4. UPLOAD NEW AD + ALL ADS LIST
          ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* ── Upload New Ad ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Upload New Ad</h3>
          </div>

          {/* Upload Tabs */}
          <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <button
              onClick={() => setUploadTab('video')}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all"
              style={{
                background: uploadTab === 'video' ? C.accent : 'transparent',
                color: uploadTab === 'video' ? '#fff' : C.textTer,
                borderBottom: uploadTab === 'video' ? '2px solid #fff' : '2px solid transparent',
              }}
            >
              <FileVideo className="h-3.5 w-3.5" />
              Video Ad
            </button>
            <button
              onClick={() => setUploadTab('image')}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all"
              style={{
                background: uploadTab === 'image' ? C.accent : 'transparent',
                color: uploadTab === 'image' ? '#fff' : C.textTer,
                borderBottom: uploadTab === 'image' ? '2px solid #fff' : '2px solid transparent',
              }}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Image Ad
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer hover:border-red-500/40"
            style={{ borderColor: C.borderLight, background: 'rgba(255,255,255,0.01)' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: C.accentDim }}>
              <CloudUpload className="h-6 w-6" style={{ color: C.accent }} />
            </div>
            <p className="text-sm font-medium text-white">Drag &amp; drop file here</p>
            <button
              className="flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold text-white transition-all hover:brightness-110"
              style={{ background: C.accent }}
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
            >
              <Upload className="h-3.5 w-3.5" />
              Choose File
            </button>
            <p className="text-[10px]" style={{ color: C.textDim }}>
              Max file size: 5GB | Supported: {uploadTab === 'video' ? 'MP4, MOV, WebM' : 'JPG, PNG, WebP, GIF'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={uploadTab === 'video' ? 'video/*' : 'image/*'}
            />
          </div>

          {/* File Upload Info (Static) */}
          <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
                <FileVideo className="h-4 w-4" style={{ color: '#3b82f6' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Ad_Video_4K_UHD.mp4</p>
                <p className="text-[10px]" style={{ color: C.textTer }}>2.45 GB / 5.00 GB, 49%</p>
              </div>
              <span className="text-xs font-semibold" style={{ color: C.textSec }}>49%</span>
            </div>
            {/* Progress Bar */}
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: '49%', background: C.accent }} />
            </div>
          </div>

          {/* Quality Options */}
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: C.textTer }}>
              Upload Quality
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'auto', label: 'Auto' },
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
                  <div
                    className="h-3 w-3 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: uploadQuality === q.id ? C.accent : C.textDim }}
                  >
                    {uploadQuality === q.id && <div className="h-1.5 w-1.5 rounded-full" style={{ background: C.accent }} />}
                  </div>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── All Ads List ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
        >
          <h3 className="text-sm font-semibold text-white mb-4">All Ads List</h3>

          {/* Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'video', label: 'Video Ads' },
                { id: 'image', label: 'Image Ads' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilterType(t.id)}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all"
                  style={{
                    background: filterType === t.id ? C.accent : 'transparent',
                    color: filterType === t.id ? '#fff' : C.textTer,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Status Dropdown */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="rounded-xl border px-3 py-1.5 text-[11px] text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>

            {/* Search */}
            <div className="flex-1 min-w-[160px]">
              <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                <Search className="h-3.5 w-3.5" style={{ color: C.textDim }} />
                <input
                  type="text"
                  placeholder="Search ads..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${C.border}` }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Preview', 'Ad Name', 'Type', 'Placement', 'Duration', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textTer }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAds.map(ad => (
                  <tr
                    key={ad.id}
                    className="border-t transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: C.border }}
                  >
                    <td className="px-3 py-3">
                      <div
                        className="h-9 w-14 rounded-lg flex items-center justify-center"
                        style={{ background: `${ad.color}15` }}
                      >
                        {ad.type === 'Video' ? (
                          <Play className="h-3.5 w-3.5" style={{ color: ad.color }} />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5" style={{ color: ad.color }} />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-white font-medium whitespace-nowrap">{ad.name}</td>
                    <td className="px-3 py-3" style={{ color: C.textSec }}>{ad.type}</td>
                    <td className="px-3 py-3" style={{ color: C.textSec }}>{ad.placement}</td>
                    <td className="px-3 py-3" style={{ color: C.textSec }}>{ad.duration}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={ad.status} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <button className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]" style={{ color: C.textSec }}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]" style={{ color: C.textSec }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          5. ADS TIMELINE
          ════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-3 sm:p-4"
        style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Ads Timeline (Unlimited Ads)</h3>
            <Info className="h-3.5 w-3.5" style={{ color: C.textDim }} />
          </div>
        </div>

        {/* Video Title Row */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <Play className="h-4 w-4" style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Video: The Future of AI Technology</p>
              <p className="text-[10px]" style={{ color: C.textTer }}>02:00:00</p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-110"
            style={{ background: C.accent }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Ad
          </button>
        </div>

        {/* Timeline Visual */}
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
          {/* Time Markers */}
          <div className="flex items-center justify-between mb-2 px-1">
            {['00:00:00', '00:20:00', '00:40:00', '01:00:00', '01:20:00', '01:40:00', '02:00:00'].map(t => (
              <span key={t} className="text-[9px] font-mono" style={{ color: C.textDim }}>{t}</span>
            ))}
          </div>

          {/* Timeline Bar */}
          <div className="relative h-12 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {TIMELINE_ADS.map(ad => (
              <div
                key={ad.id}
                className="absolute top-1 h-10 rounded-md flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:opacity-90"
                style={{
                  left: `${ad.startPct}%`,
                  width: `${ad.widthPct}%`,
                  background: ad.color,
                }}
              >
                <span className="text-[8px] font-bold text-white truncate px-1">
                  {ad.type}
                </span>
              </div>
            ))}
          </div>

          {/* Time grid lines */}
          <div className="flex items-center justify-between mt-1 px-1">
            {['00:00:00', '00:20:00', '00:40:00', '01:00:00', '01:20:00', '01:40:00', '02:00:00'].map(t => (
              <div key={t} className="w-px h-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
        </div>

        {/* Timeline Detail Table */}
        <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${C.border}` }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Time', 'Preview', 'Ad Name', 'Type', 'Duration', 'Action'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textTer }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMELINE_ADS.map(ad => (
                <tr
                  key={ad.id}
                  className="border-t transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: C.border }}
                >
                  <td className="px-3 py-3 font-mono text-[11px]" style={{ color: C.textSec }}>{ad.time}</td>
                  <td className="px-3 py-3">
                    <div
                      className="h-8 w-12 rounded-lg flex items-center justify-center"
                      style={{ background: `${ad.color}15` }}
                    >
                      {ad.type === 'Video' ? (
                        <Play className="h-3 w-3" style={{ color: ad.color }} />
                      ) : (
                        <ImageIcon className="h-3 w-3" style={{ color: ad.color }} />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-white font-medium whitespace-nowrap">{ad.name}</td>
                  <td className="px-3 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{ background: `${ad.color}20`, color: ad.color }}
                    >
                      {ad.type}
                    </span>
                  </td>
                  <td className="px-3 py-3" style={{ color: C.textSec }}>{ad.duration}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]" style={{ color: C.textSec }}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]" style={{ color: C.textSec }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════
          6. BOTTOM ROW (4 columns)
          ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {/* ── Top Performing Ads ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Top Performing Ads</h3>
            <button
              className="flex items-center gap-1 text-[10px] font-medium"
              style={{ color: C.textSec }}
            >
              By Revenue <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {TOP_ADS_DATA.map((ad, i) => (
              <div key={ad.name} className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-white/[0.03]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div
                  className="h-10 w-14 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${ad.color}15` }}
                >
                  <Play className="h-4 w-4" style={{ color: ad.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{ad.name}</p>
                  <p className="text-[10px]" style={{ color: C.textTer }}>Revenue</p>
                </div>
                <span className="text-xs font-bold" style={{ color: C.green }}>{ad.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Device Performance (Donut Chart) ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
        >
          <h3 className="text-sm font-semibold text-white mb-4">Device Performance</h3>

          <div className="flex justify-center relative">
            <div className="relative">
              <DonutChartSVG data={DEVICE_DATA} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-white">100%</span>
                <span className="text-[9px]" style={{ color: C.textTer }}>Total</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            {DEVICE_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs font-medium text-white">{d.name}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: C.textSec }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Top Countries ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
        >
          <h3 className="text-sm font-semibold text-white mb-4">Top Countries</h3>

          <div className="space-y-3">
            {COUNTRY_DATA.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{c.code}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white truncate">{c.name}</span>
                    <span className="text-xs font-semibold" style={{ color: C.textSec }}>{c.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.pct}%`, background: C.accent, opacity: 0.5 + (c.pct / 100) * 0.5 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ads Settings ── */}
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: C.cardInner, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4" style={{ color: C.textSec }} />
            <h3 className="text-sm font-semibold text-white">Ads Settings</h3>
          </div>

          <div className="space-y-4">
            {/* Auto Ads */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">Auto Ads</p>
                <p className="text-[10px]" style={{ color: C.textTer }}>Automatically insert ads</p>
              </div>
              <Toggle on={autoAds} onToggle={() => setAutoAds(!autoAds)} />
            </div>

            {/* Skip Ads After */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">Skip Ads After</p>
                <p className="text-[10px]" style={{ color: C.textTer }}>Time before skip is allowed</p>
              </div>
              <select
                value={skipAfter}
                onChange={e => setSkipAfter(e.target.value)}
                className="rounded-lg border px-2.5 py-1 text-[11px] text-white focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}
              >
                <option value="5 Seconds">5 Seconds</option>
                <option value="10 Seconds">10 Seconds</option>
                <option value="15 Seconds">15 Seconds</option>
                <option value="30 Seconds">30 Seconds</option>
              </select>
            </div>

            {/* Max Ads Per Video */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">Max Ads Per Video</p>
                <p className="text-[10px]" style={{ color: C.textTer }}>Maximum number of ads</p>
              </div>
              <select
                value={maxAds}
                onChange={e => setMaxAds(e.target.value)}
                className="rounded-lg border px-2.5 py-1 text-[11px] text-white focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}
              >
                <option value="Unlimited">Unlimited</option>
                <option value="1">1</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>

            {/* Minimum Gap Between Ads */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">Min Gap Between Ads</p>
                <p className="text-[10px]" style={{ color: C.textTer }}>Minimum time between ads</p>
              </div>
              <select
                value={minGap}
                onChange={e => setMinGap(e.target.value)}
                className="rounded-lg border px-2.5 py-1 text-[11px] text-white focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}
              >
                <option value="5 Minutes">5 Minutes</option>
                <option value="10 Minutes">10 Minutes</option>
                <option value="15 Minutes">15 Minutes</option>
                <option value="30 Minutes">30 Minutes</option>
              </select>
            </div>

            {/* Ad Quality */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">Ad Quality</p>
                <p className="text-[10px]" style={{ color: C.textTer }}>Maximum ad quality</p>
              </div>
              <select
                value={adQuality}
                onChange={e => setAdQuality(e.target.value)}
                className="rounded-lg border px-2.5 py-1 text-[11px] text-white focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}
              >
                <option value="Auto">Auto</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4K Auto">4K Auto</option>
              </select>
            </div>

            {/* Ad Playback */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">Ad Playback</p>
                <p className="text-[10px]" style={{ color: C.textTer }}>Playback optimization</p>
              </div>
              <select
                value={adPlayback}
                onChange={e => setAdPlayback(e.target.value)}
                className="rounded-lg border px-2.5 py-1 text-[11px] text-white focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: C.border }}
              >
                <option value="Smart No Lag">Smart No Lag</option>
                <option value="Standard">Standard</option>
                <option value="High Quality">High Quality</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
