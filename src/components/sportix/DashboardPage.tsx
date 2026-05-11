'use client'

import { supabase } from '@/lib/supabase'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, Bell, Plus, MoreHorizontal, ChevronDown,
  DollarSign, Users, Video, Clock, CheckCircle, Megaphone,
  TrendingUp, UserPlus, MessageSquare, CreditCard, Star,
  Smartphone, Monitor, Tablet, Tv,
  ArrowUpRight, Eye, ThumbsUp, Calendar, Filter,
  Wallet, Newspaper, Play, Globe, Radio
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
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const points = data.length > 1 
    ? data.map((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((v - min) / range) * (height - 4) - 2
        return `${x},${y}`
      }).join(' ')
    : `${width / 2},${height / 2}`

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

  const s1 = series1 || []
  const s2 = series2 || []
  const allData = [...s1, ...s2]
  const max = allData.length > 0 ? Math.max(...allData) * 1.15 : 100
  const min = 0
  const range = max - min || 1

  const makePoints = (data: number[]) => {
    if (data.length === 0) return []
    if (data.length === 1) return [{ x: padding.left + chartW / 2, y: padding.top + chartH / 2 }]
    return data.map((v, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW
      const y = padding.top + chartH - ((v - min) / range) * chartH
      return { x, y }
    })
  }

  const pts1 = makePoints(series1)
  const pts2 = makePoints(series2)

  const toPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return ''
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  }

  const toArea = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return ''
    const path = toPath(pts)
    return `${path} L${pts[pts.length - 1].x},${padding.top + chartH} L${pts[0].x},${padding.top + chartH} Z`
  }

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
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
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

const DashboardPage = React.memo(function DashboardPage() {
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

  // ── Real-time KPI data (updates via Supabase) ──
  const [kpis, setKpis] = useState([
    { label: 'Total Revenue', value: 0, prefix: '₹', suffix: '', change: 0, icon: DollarSign, color: C.accent, sparkData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { label: 'Total Users', value: 0, prefix: '', suffix: '', change: 0, icon: Users, color: C.purple, sparkData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { label: 'Total Videos', value: 0, prefix: '', suffix: '', change: 0, icon: Video, color: C.blue, sparkData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { label: 'Watch Time', value: 0, prefix: '', suffix: 'h', change: 0, icon: Clock, color: C.orange, sparkData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { label: 'Subscriptions', value: 0, prefix: '', suffix: '', change: 0, icon: CheckCircle, color: C.green, sparkData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { label: 'Ad Revenue', value: 0, prefix: '₹', suffix: '', change: 0, icon: Megaphone, color: C.accent, sparkData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  ])

  const [revenueOverview, setRevenueOverview] = useState({
    total: '₹0',
    change: '0%',
    series1: [0, 0, 0, 0, 0, 0, 0],
    series2: [0, 0, 0, 0, 0, 0, 0],
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
  })
  
  const [usersGrowth, setUsersGrowth] = useState({
    total: '0',
    change: '0%',
    series1: [0, 0, 0, 0, 0, 0, 0],
    series2: [0, 0, 0, 0, 0, 0, 0],
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
  })

  const [topContent, setTopContent] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [deviceStats, setDeviceStats] = useState([
    { value: 65.2, color: C.accent, label: 'Mobile', pct: '65.2%' },
    { value: 18.5, color: C.purple, label: 'Smart TV', pct: '18.5%' },
    { value: 11.7, color: C.blue, label: 'Desktop', pct: '11.7%' },
    { value: 4.6, color: C.orange, label: 'Tablet', pct: '4.6%' },
  ])
  const [topCountries, setTopCountries] = useState([
    { name: 'India', pct: 65.6, flag: '🇮🇳' },
    { name: 'USA', pct: 12.7, flag: '🇺🇸' },
    { name: 'UK', pct: 4.3, flag: '🇬🇧' },
    { name: 'Canada', pct: 3.2, flag: '🇨🇦' },
    { name: 'UAE', pct: 2.8, flag: '🇦🇪' },
  ])
  const [recentVideos, setRecentVideos] = useState<any[]>([])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard stats')
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data.overview
        setKpis([
          { label: 'Total Revenue', value: d.totalRevenue, prefix: '₹', suffix: '', change: 12.5, icon: DollarSign, color: C.accent, sparkData: [45, 52, 48, 61, 55, 67, 72, 68, 75, 82] },
          { label: 'Total Users', value: d.totalUsers, prefix: '', suffix: '', change: 8.2, icon: Users, color: C.purple, sparkData: [2100, 2400, 2200, 2800, 2600, 3100, 2900, 3400, 3200, 3800] },
          { label: 'Total Videos', value: d.totalVideos, prefix: '', suffix: '', change: 4.3, icon: Video, color: C.blue, sparkData: [450, 480, 460, 510, 490, 540, 520, 570, 550, 600] },
          { label: 'Watch Time', value: d.watchTime, prefix: '', suffix: 'h', change: 15.1, icon: Clock, color: C.orange, sparkData: [1200, 1400, 1300, 1600, 1500, 1800, 1700, 2000, 1900, 2200] },
          { label: 'Subscriptions', value: Math.floor(d.totalUsers * 0.12), prefix: '', suffix: '', change: 9.7, icon: CheckCircle, color: C.green, sparkData: [120, 140, 130, 160, 150, 180, 170, 200, 190, 220] },
          { label: 'Ad Revenue', value: d.adRevenue, prefix: '₹', suffix: '', change: 18.4, icon: Megaphone, color: C.accent, sparkData: [25, 32, 28, 41, 35, 47, 42, 51, 45, 58] },
        ])
        
        setRevenueOverview(prev => ({
          ...prev,
          total: `₹${Math.floor(d.totalRevenue).toLocaleString()}`,
          change: '12.5%',
          series1: [42, 58, 52, 68, 75, 62, 78],
          series2: [18, 25, 22, 32, 35, 28, 38],
          labels: ['May 10', 'May 15', 'May 20', 'May 25', 'May 30', 'Jun 05', 'Jun 10']
        }))

        setUsersGrowth(prev => ({
          ...prev,
          total: d.totalUsers.toLocaleString(),
          change: '8.2%',
          series1: [2800, 3500, 3200, 4100, 3800, 4500, 4200],
          series2: [1800, 2200, 2000, 2800, 2600, 3200, 3000],
          labels: ['May 10', 'May 15', 'May 20', 'May 25', 'May 30', 'Jun 05', 'Jun 10']
        }))

        if (json.data.topPerforming) {
          setTopContent(json.data.topPerforming.map((v: any) => ({
            title: v.title,
            category: v.category || 'Highlights',
            views: v.views / 1000000,
            viewsStr: v.views >= 1000000 ? (v.views / 1000000).toFixed(1) + 'M' : (v.views / 1000).toFixed(0) + 'K',
            color: C.accent
          })))
        }

        if (json.data.recentActivity) {
          setActivities(json.data.recentActivity.map((a: any) => ({
            icon: a.type === 'user' ? UserPlus : a.type === 'stream' ? Radio : a.type === 'content' ? Play : a.type === 'alert' ? Wallet : MessageSquare,
            color: a.type === 'user' ? C.purple : a.type === 'stream' ? C.accent : a.type === 'content' ? C.blue : a.type === 'alert' ? C.orange : C.warning,
            text: a.message,
            time: 'Just now'
          })))
        }

        if (json.data.videos) {
          setRecentVideos(json.data.videos.slice(0, 3).map((v: any) => ({
            title: v.title,
            category: v.category,
            duration: v.duration ? new Date(v.duration * 1000).toISOString().substr(11, 8) : '00:00:00',
            views: v.views >= 1000000 ? (v.views / 1000000).toFixed(1) + 'M' : (v.views / 1000).toFixed(0) + 'K',
            likes: (v.views * 0.08 >= 1000) ? (v.views * 0.08 / 1000).toFixed(0) + 'K' : Math.floor(v.views * 0.08),
            status: 'Published',
            date: new Date(v.createdAt).toLocaleDateString()
          })))
        }
      }
    } catch (err) {
      console.error('Stats fetch error:', err)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    
    // Manual Refresh Listener
    const handleManualRefresh = () => fetchStats()
    window.addEventListener('sportix-refresh-data', handleManualRefresh)

    const channel = supabase
      .channel('dashboard_full_updates')
      .on('postgres_changes' as any, { event: '*', table: 'Ad' }, () => fetchStats())
      .on('postgres_changes' as any, { event: '*', table: 'User' }, () => fetchStats())
      .on('postgres_changes' as any, { event: '*', table: 'Stream' }, () => fetchStats())
      .on('postgres_changes' as any, { event: '*', table: 'Video' }, () => fetchStats())
      .subscribe()

    return () => {
      clearInterval(interval)
      window.removeEventListener('sportix-refresh-data', handleManualRefresh)
      supabase.removeChannel(channel)
    }
  }, [fetchStats])

  const fmtValue = (kpi: typeof kpis[0]) => {
    if (kpi.prefix === '₹') {
      return `₹${Math.floor(kpi.value).toLocaleString('en-IN')}.${((kpi.value % 1) * 100).toFixed(0).padStart(2, '0')}`
    }
    if (kpi.value >= 1000) return `${kpi.value.toLocaleString('en-IN')}${kpi.suffix}`
    return `${kpi.value}${kpi.suffix}`
  }



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
                <div className="hidden sm:block">
                  <Sparkline data={kpi.sparkData} color={kpi.color} width={60} height={24} />
                </div>
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
            <span className="text-xl font-bold text-white">{revenueOverview.total}</span>
            <span className="text-[10px] font-semibold" style={{ color: C.green }}>↑{revenueOverview.change}</span>
          </div>
          <p className="text-[10px] mb-3" style={{ color: C.textDim }}>vs Apr 10 - May 10</p>
          <DualLineChart
            series1={revenueOverview.series1} series2={revenueOverview.series2}
            color1={C.accent} color2={C.purple}
            labels={revenueOverview.labels} yLabels={['₹100K', '₹80K', '₹60K', '₹40K', '₹20K', '₹0']}
            height={180} legend1="Total Revenue" legend2="Ad Revenue"
          />
        </div>

        {/* Users Growth */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Users Growth</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-white">{usersGrowth.total}</span>
            <span className="text-[10px] font-semibold" style={{ color: C.green }}>↑{usersGrowth.change}</span>
          </div>
          <p className="text-[10px] mb-3" style={{ color: C.textDim }}>vs Apr 10 - May 10</p>
          <DualLineChart
            series1={usersGrowth.series1} series2={usersGrowth.series2}
            color1={C.accent} color2={C.purple}
            labels={usersGrowth.labels} yLabels={['5K', '4K', '3K', '2K', '1K', '0']}
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
})

export default DashboardPage
