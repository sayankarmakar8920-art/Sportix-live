'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, Bell, Plus, MoreHorizontal, ChevronDown,
  DollarSign, Users, Video, Clock, CheckCircle, Megaphone,
  TrendingUp, UserPlus, MessageSquare, CreditCard, Star,
  Smartphone, Monitor, Tablet, Tv,
  ArrowUpRight, Eye, ThumbsUp, Calendar, Filter,
  Wallet, Newspaper, Play, Globe
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — matches AdminPanel.tsx C object exactly
   ═══════════════════════════════════════════════════════════════ */

const C = {
  bg: '#141414',
  card: '#1a1a1a',
  cardHover: '#222222',
  border: 'rgba(255,255,255,0.08)',
  accent: '#E50914',
  purple: '#9b59b6',
  blue: '#0071eb',
  orange: '#f97316',
  green: '#46d369',
  warning: '#f5c518',
  text: '#ffffff',
  textSec: '#b3b3b3',
  textTer: '#808080',
  textDim: '#555555',
}

/* ═══════════════════════════════════════════════════════════════
   SVG SPARKLINE — for KPI cards
   ═══════════════════════════════════════════════════════════════ */

function Sparkline({ data, color, width = 100, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SVG DUAL LINE CHART — Revenue & Users sections
   ═══════════════════════════════════════════════════════════════ */

function DualLineChart({
  series1, series2, color1, color2, labels, yLabels, height = 200,
  legend1, legend2,
}: {
  series1: number[]; series2: number[]; color1: string; color2: string
  labels: string[]; yLabels: string[]; height?: number; legend1: string; legend2: string
}) {
  const svgRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(300)
  const padding = { top: 10, right: 10, bottom: 30, left: 45 }
  const chartW = w - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setW(entry.contentRect.width)
    })
    ro.observe(el)
    setW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const allData = [...series1, ...series2]
  const max = Math.max(...allData) * 1.15
  const min = 0
  const range = max - min || 1

  const makePoints = (data: number[]) =>
    data.map((v, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW
      const y = padding.top + chartH - ((v - min) / range) * chartH
      return { x, y }
    })

  const pts1 = makePoints(series1)
  const pts2 = makePoints(series2)

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  const toArea = (pts: { x: number; y: number }[]) =>
    `${toPath(pts)} L${pts[pts.length - 1].x},${padding.top + chartH} L${pts[0].x},${padding.top + chartH} Z`

  const gridLines = 5
  const gridY = Array.from({ length: gridLines }, (_, i) =>
    padding.top + (i / (gridLines - 1)) * chartH
  )

  return (
    <div ref={svgRef} className="w-full" style={{ height }}>
      <svg width={w} height={height} className="overflow-visible">
        {/* Grid lines */}
        {gridY.map((y, i) => (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={w - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 3} textAnchor="end" fill={C.textDim} fontSize="9" fontFamily="sans-serif">
              {yLabels[yLabels.length - 1 - i] || ''}
            </text>
          </g>
        ))}
        {/* X-axis labels */}
        {labels.map((label, i) => {
          const x = padding.left + (i / (labels.length - 1)) * chartW
          return (
            <text key={i} x={x} y={height - 5} textAnchor="middle" fill={C.textDim} fontSize="9" fontFamily="sans-serif">
              {label}
            </text>
          )
        })}
        {/* Area fills */}
        <defs>
          <linearGradient id={`dl-grad1-${color1.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color1} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color1} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`dl-grad2-${color2.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color2} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color2} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={toArea(pts1)} fill={`url(#dl-grad1-${color1.replace('#', '')})`} />
        <path d={toArea(pts2)} fill={`url(#dl-grad2-${color2.replace('#', '')})`} />
        {/* Lines */}
        <path d={toPath(pts1)} fill="none" stroke={color1} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={toPath(pts2)} fill="none" stroke={color2} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="6 3" />
        {/* Dots on series1 */}
        {pts1.map((p, i) => (
          <circle key={`d1-${i}`} cx={p.x} cy={p.y} r="3" fill={color1} stroke={C.card} strokeWidth="1.5" />
        ))}
        {/* Dots on series2 */}
        {pts2.map((p, i) => (
          <circle key={`d2-${i}`} cx={p.x} cy={p.y} r="3" fill={color2} stroke={C.card} strokeWidth="1.5" />
        ))}
      </svg>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full" style={{ background: color1 }} />
          <span className="text-[11px]" style={{ color: C.textTer }}>{legend1}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full" style={{ background: color2 }} />
          <span className="text-[11px]" style={{ color: C.textTer }}>{legend2}</span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SVG DONUT CHART — Device Stats
   ═══════════════════════════════════════════════════════════════ */

function DonutChart({ segments, size = 160, strokeWidth = 22 }: {
  segments: { value: number; color: string; label: string; pct: string }[]
  size?: number; strokeWidth?: number
}) {
  const total = segments.reduce((a, s) => a + s.value, 0)
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offsets: number[] = []
  let acc = 0
  for (const s of segments) {
    offsets.push(acc)
    acc += (s.value / total) * circ
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={s.color} strokeWidth={strokeWidth}
              strokeDasharray={`${(s.value / total) * circ} ${circ - (s.value / total) * circ}`}
              strokeDashoffset={-offsets[i]}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">100%</span>
          <span className="text-[10px]" style={{ color: C.textTer }}>All Devices</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-[11px]" style={{ color: C.textSec }}>
              {s.label} <span className="font-semibold text-white">{s.pct}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE — Exact screenshot match
   ═══════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('')
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
      const hour = now.getHours()
      if (hour < 12) setGreeting('Good morning')
      else if (hour < 17) setGreeting('Good afternoon')
      else setGreeting('Good evening')
    }
    tick()
    const i = setInterval(tick, 30000)
    return () => clearInterval(i)
  }, [])

  // ── Real-time KPI data (updates every 5 seconds) ──
  const [kpis, setKpis] = useState([
    { label: 'Total Revenue', value: 324580.50, prefix: '₹', suffix: '', change: 12.5, icon: DollarSign, color: C.accent, sparkData: [45, 62, 58, 72, 80, 65, 78, 90, 85, 95] },
    { label: 'Total Users', value: 128643, prefix: '', suffix: '', change: 8.2, icon: Users, color: C.purple, sparkData: [80, 95, 88, 102, 98, 110, 105, 118, 112, 125] },
    { label: 'Total Videos', value: 4756, prefix: '', suffix: '', change: 15.3, icon: Video, color: C.blue, sparkData: [30, 42, 38, 50, 45, 55, 52, 60, 58, 65] },
    { label: 'Watch Time', value: 12643, prefix: '', suffix: 'h', change: 10.7, icon: Clock, color: C.orange, sparkData: [70, 85, 78, 92, 88, 100, 95, 108, 102, 115] },
    { label: 'Subscriptions', value: 8856, prefix: '', suffix: '', change: 9.4, icon: CheckCircle, color: C.green, sparkData: [50, 60, 55, 68, 65, 72, 70, 78, 75, 82] },
    { label: 'Ad Revenue', value: 125430.20, prefix: '₹', suffix: '', change: 14.6, icon: Megaphone, color: C.accent, sparkData: [35, 48, 42, 55, 60, 52, 65, 70, 62, 75] },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prev => prev.map(k => {
        const fluctuation = (Math.random() - 0.45) * 0.02
        const newVal = k.value * (1 + fluctuation)
        const newSpark = [...k.sparkData.slice(1), k.sparkData[k.sparkData.length - 1] + (Math.random() - 0.4) * 10]
        return { ...k, value: k.prefix === '₹' ? Math.round(newVal * 100) / 100 : Math.round(newVal), sparkData: newSpark }
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fmtValue = (kpi: typeof kpis[0]) => {
    if (kpi.prefix === '₹') {
      return `₹${Math.floor(kpi.value).toLocaleString('en-IN')}.${((kpi.value % 1) * 100).toFixed(0).padStart(2, '0')}`
    }
    if (kpi.value >= 1000) return `${kpi.value.toLocaleString('en-IN')}${kpi.suffix}`
    return `${kpi.value}${kpi.suffix}`
  }

  // ── Chart data ──
  const revenueData1 = [42, 58, 52, 68, 75, 62, 78]
  const revenueData2 = [18, 25, 22, 32, 35, 28, 38]
  const usersData1 = [2800, 3500, 3200, 4100, 3800, 4500, 4200]
  const usersData2 = [1800, 2200, 2000, 2800, 2600, 3200, 3000]
  const chartLabels = ['May 10', 'May 15', 'May 20', 'May 25', 'May 30', 'Jun 05', 'Jun 10']
  const revenueYLabels = ['₹100K', '₹80K', '₹60K', '₹40K', '₹20K', '₹0']
  const usersYLabels = ['5K', '4K', '3K', '2K', '1K', '0']

  // ── Top Content data ──
  const topContent = [
    { title: 'The Dark Knight', category: 'Action', views: 2.4, viewsStr: '2.4M', color: C.accent },
    { title: 'Avengers: Endgame', category: 'Action', views: 1.8, viewsStr: '1.8M', color: C.accent },
    { title: 'Interstellar', category: 'Sci-Fi', views: 1.2, viewsStr: '1.2M', color: C.accent },
    { title: 'Money Heist S2', category: 'Drama', views: 0.98, viewsStr: '980K', color: C.accent },
    { title: 'The Lion King', category: 'Animation', views: 0.87, viewsStr: '870K', color: C.accent },
  ]

  // ── Recent Activities ──
  const activities = [
    { icon: UserPlus, color: C.purple, text: 'New user John Doe registered', time: '2 mins ago' },
    { icon: Play, color: C.blue, text: "Video 'The Dark Knight' uploaded", time: '10 mins ago' },
    { icon: Wallet, color: C.orange, text: 'Payment of ₹1,299 received from Michael Brown', time: '25 mins ago' },
    { icon: MessageSquare, color: C.purple, text: "New comment on 'Interstellar'", time: '1 hour ago' },
    { icon: Star, color: C.warning, text: "Subscription plan 'Premium' purchased", time: '2 hours ago' },
    { icon: Megaphone, color: C.green, text: "Ad campaign 'Summer Sale' created", time: '3 hours ago' },
  ]

  // ── Device Stats ──
  const deviceStats = [
    { value: 61.2, color: C.accent, label: 'Mobile', pct: '61.2%' },
    { value: 20.5, color: C.purple, label: 'Smart TV', pct: '20.5%' },
    { value: 13.7, color: C.blue, label: 'Desktop', pct: '13.7%' },
    { value: 4.6, color: C.orange, label: 'Tablet', pct: '4.6%' },
  ]

  // ── Top Countries ──
  const topCountries = [
    { name: 'India', pct: 45.6, flag: '🇮🇳' },
    { name: 'USA', pct: 18.7, flag: '🇺🇸' },
    { name: 'UK', pct: 6.3, flag: '🇬🇧' },
    { name: 'Canada', pct: 5.2, flag: '🇨🇦' },
    { name: 'Australia', pct: 4.8, flag: '🇦🇺' },
  ]

  // ── Recent Videos ──
  const recentVideos = [
    { title: 'The Dark Knight', category: 'Action', duration: '02:32:15', views: '2.4M', likes: '125K', status: 'Published', date: 'Jun 10, 2025' },
    { title: 'Interstellar', category: 'Sci-Fi', duration: '02:49:20', views: '1.2M', likes: '98K', status: 'Published', date: 'Jun 9, 2025' },
    { title: 'Money Heist S2 E5', category: 'Drama', duration: '00:55:10', views: '980K', likes: '75K', status: 'Published', date: 'Jun 8, 2025' },
  ]

  return (
    <div className="space-y-4 fade-in-up">
      {/* ════════ GREETING + SEARCH BAR ════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">
            {greeting}, Super Admin! <span className="inline-block">👋</span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: C.textTer }}>
            Here&apos;s what&apos;s happening with your platform today.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto no-scrollbar">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2 min-w-0" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }}>
            <Search className="h-4 w-4 flex-shrink-0" style={{ color: C.textDim }} />
            <input type="text" placeholder="Search here..." className="bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none w-28 sm:w-36 md:w-48" />
          </div>
          {/* Currency */}
          <button className="flex items-center gap-1 rounded-xl border px-2.5 sm:px-3 py-2 text-xs font-medium transition-colors hover:bg-white/[0.03] whitespace-nowrap" style={{ borderColor: C.border, color: C.textSec }}>
            ₹K <ChevronDown className="h-3 w-3" />
          </button>
          {/* Create */}
          <button className="flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 whitespace-nowrap" style={{ background: C.accent }}>
            <Plus className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Create</span>
          </button>
        </div>
      </div>

      {/* ════════ 6 KPI CARDS ════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border p-3 sm:p-3.5 transition-all duration-200 hover:border-white/10"
              style={{ background: C.card, borderColor: C.border }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl" style={{ background: `${kpi.color}18` }}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: kpi.color }} />
                  </div>
                </div>
                <Sparkline data={kpi.sparkData} color={kpi.color} width={60} height={24} className="hidden sm:block" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: C.textTer }}>{kpi.label}</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight truncate">{fmtValue(kpi)}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3" style={{ color: C.green }} />
                <span className="text-[9px] sm:text-[10px] font-semibold" style={{ color: C.green }}>{kpi.change}%</span>
                <span className="text-[8px] sm:text-[9px] hidden sm:inline" style={{ color: C.textDim }}>vs Apr 10 - May 10</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ════════ CHARTS ROW: Revenue + Users + Top Content ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* Revenue Overview */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Revenue Overview</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-white">₹3,24,580.50</span>
            <span className="text-[10px] font-semibold" style={{ color: C.green }}>↑12.5%</span>
          </div>
          <p className="text-[10px] mb-3" style={{ color: C.textDim }}>vs Apr 10 - May 10</p>
          <DualLineChart
            series1={revenueData1} series2={revenueData2}
            color1={C.accent} color2={C.purple}
            labels={chartLabels} yLabels={revenueYLabels}
            height={180} legend1="Total Revenue" legend2="Ad Revenue"
          />
        </div>

        {/* Users Growth */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Users Growth</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-white">128,643</span>
            <span className="text-[10px] font-semibold" style={{ color: C.green }}>↑8.2%</span>
          </div>
          <p className="text-[10px] mb-3" style={{ color: C.textDim }}>vs Apr 10 - May 10</p>
          <DualLineChart
            series1={usersData1} series2={usersData2}
            color1={C.accent} color2={C.purple}
            labels={chartLabels} yLabels={usersYLabels}
            height={180} legend1="New Users" legend2="Active Users"
          />
        </div>

        {/* Top Content by Views */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Top Content by Views</h3>
            <button className="text-[11px] font-medium" style={{ color: C.purple }}>View All</button>
          </div>
          <div className="space-y-3.5">
            {topContent.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg overflow-hidden" style={{ background: `${C.accent}15` }}>
                  <Play className="h-4 w-4" style={{ color: C.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-white truncate pr-2">{item.title}</p>
                    <span className="text-[11px] font-semibold text-white flex-shrink-0">{item.viewsStr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(item.views / topContent[0].views) * 100}%`, background: C.accent }} />
                    </div>
                    <span className="text-[9px] flex-shrink-0" style={{ color: C.textDim }}>{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ STATS ROW: Activities + Device + Countries ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* Recent Activities */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Activities</h3>
            <button className="text-[11px] font-medium" style={{ color: C.purple }}>View All</button>
          </div>
          <div className="space-y-0">
            {activities.map((act, i) => {
              const Icon = act.icon
              return (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: C.border }}>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg mt-0.5" style={{ background: `${act.color}15` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: act.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] leading-relaxed text-white/90">{act.text}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: C.textDim }}>{act.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Device / Platform Stats */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Device / Platform Stats</h3>
          </div>
          <div className="flex justify-center">
            <DonutChart segments={deviceStats} size={150} strokeWidth={20} />
          </div>
        </div>

        {/* Top Countries */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Top Countries</h3>
            <button className="text-[11px] font-medium" style={{ color: C.purple }}>View All</button>
          </div>

          {/* Mini World Map SVG */}
          <div className="flex justify-center mb-4">
            <svg viewBox="0 0 600 300" className="w-full max-w-sm opacity-30" fill="none">
              {/* Simplified world map outline */}
              <ellipse cx="300" cy="150" rx="280" ry="130" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {/* Grid lines */}
              <line x1="20" y1="150" x2="580" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <line x1="300" y1="20" x2="300" y2="280" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <ellipse cx="300" cy="150" rx="200" ry="130" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <ellipse cx="300" cy="150" rx="120" ry="130" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              {/* Hotspot dots */}
              <circle cx="385" cy="135" r="12" fill="#E50914" opacity="0.3" />
              <circle cx="385" cy="135" r="6" fill="#E50914" opacity="0.6" />
              <circle cx="385" cy="135" r="3" fill="#E50914" />
              <circle cx="165" cy="125" r="8" fill="#E50914" opacity="0.3" />
              <circle cx="165" cy="125" r="4" fill="#E50914" opacity="0.6" />
              <circle cx="165" cy="125" r="2" fill="#E50914" />
              <circle cx="310" cy="100" r="5" fill="#E50914" opacity="0.3" />
              <circle cx="310" cy="100" r="2.5" fill="#E50914" opacity="0.6" />
              <circle cx="310" cy="100" r="1.5" fill="#E50914" />
              <circle cx="155" cy="110" r="4" fill="#E50914" opacity="0.3" />
              <circle cx="155" cy="110" r="2" fill="#E50914" opacity="0.6" />
              <circle cx="500" cy="195" r="4" fill="#E50914" opacity="0.3" />
              <circle cx="500" cy="195" r="2" fill="#E50914" opacity="0.6" />
            </svg>
          </div>

          {/* Country list */}
          <div className="space-y-2.5">
            {topCountries.map((country, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{country.flag}</span>
                  <span className="text-xs font-medium text-white">{country.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(country.pct / topCountries[0].pct) * 100}%`, background: C.accent }} />
                  </div>
                  <span className="text-[11px] font-semibold text-white w-12 text-right">{country.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ RECENT VIDEOS TABLE ════════ */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: C.card, borderColor: C.border }}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: C.border }}>
          <h3 className="text-sm font-semibold text-white">Recent Videos</h3>
          <button className="text-[11px] font-medium" style={{ color: C.purple }}>View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Video', 'Category', 'Duration', 'Views', 'Likes', 'Status', 'Published On', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentVideos.map((video, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `${C.accent}15` }}>
                        <Play className="h-3.5 w-3.5" style={{ color: C.accent }} />
                      </div>
                      <span className="text-xs font-medium text-white">{video.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: C.textSec }}>
                      {video.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: C.textSec }}>
                    <span className="font-mono">{video.duration}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" style={{ color: C.textDim }} />
                      <span className="text-xs font-medium text-white">{video.views}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" style={{ color: C.textDim }} />
                      <span className="text-xs" style={{ color: C.textSec }}>{video.likes}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: 'rgba(70,211,105,0.12)', color: C.green }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.green }} />
                      {video.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px]" style={{ color: C.textTer }}>{video.date}</td>
                  <td className="px-4 py-3">
                    <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}>
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
