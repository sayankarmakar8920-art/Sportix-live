'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Radio, Eye, Calendar, Clock, Heart, Bell,
  ArrowUpRight, ArrowDownRight, Trophy, Play,
  Smartphone, Monitor, Tablet, Tv, Wifi, Zap,
  TrendingUp, Star, MessageSquare, Shield, ChevronRight,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — exact match with admin DashboardPage.tsx
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
  cyan: '#06b6d4',
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
        <linearGradient id={`usk-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#usk-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SVG AREA CHART — Viewers Trend with gradient fill + tooltip
   ═══════════════════════════════════════════════════════════════ */

function AreaChart({ data, labels, color, height = 200 }: {
  data: number[]; labels: string[]; color: string; height?: number
}) {
  const svgRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(300)
  const [tip, setTip] = useState<{ x: number; y: number; val: number; label: string } | null>(null)
  const padding = { top: 12, right: 12, bottom: 32, left: 42 }
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

  const max = Math.max(...data) * 1.15
  const min = 0
  const range = max - min || 1

  const pts = data.map((v, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((v - min) / range) * chartH,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${padding.top + chartH} L${pts[0].x},${padding.top + chartH} Z`

  const gridLines = 5
  const yLabels = Array.from({ length: gridLines }, (_, i) => {
    const val = max - (i / (gridLines - 1)) * max
    return val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(0)
  })

  const handleMouse = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    let closest = 0
    let minDist = Infinity
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - mx)
      if (d < minDist) { minDist = d; closest = i }
    })
    if (minDist < 30) {
      setTip({ x: pts[closest].x, y: pts[closest].y, val: data[closest], label: labels[closest] })
    } else {
      setTip(null)
    }
  }, [data, labels, pts])

  return (
    <div ref={svgRef} className="w-full" style={{ height }}>
      <svg width={w} height={height} className="overflow-visible" onMouseMove={handleMouse} onMouseLeave={() => setTip(null)}>
        <defs>
          <linearGradient id={`uarea-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: gridLines }, (_, i) => {
          const y = padding.top + (i / (gridLines - 1)) * chartH
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={w - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" fill={C.textDim} fontSize="9" fontFamily="sans-serif">{yLabels[i]}</text>
            </g>
          )
        })}
        {labels.map((label, i) => {
          const x = padding.left + (i / (labels.length - 1)) * chartW
          return <text key={i} x={x} y={height - 6} textAnchor="middle" fill={C.textDim} fontSize="9" fontFamily="sans-serif">{label}</text>
        })}
        <path d={areaPath} fill={`url(#uarea-${color.replace('#', '')})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke={C.card} strokeWidth="1.5" />
        ))}
        {tip && (
          <>
            <line x1={tip.x} y1={padding.top} x2={tip.x} y2={padding.top + chartH} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
            <circle cx={tip.x} cy={tip.y} r="5" fill={color} stroke={C.card} strokeWidth="2" />
          </>
        )}
      </svg>
      {tip && (
        <div className="absolute rounded-lg border px-2.5 py-1.5 text-[10px] pointer-events-none" style={{ left: tip.x - 40, top: tip.y - 36, background: '#222', borderColor: C.border, color: C.text }}>
          <p className="font-bold">{tip.val.toLocaleString()} viewers</p>
          <p style={{ color: C.textTer }}>{tip.label}</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SVG BAR CHART — Match Activity by sport + tooltip
   ═══════════════════════════════════════════════════════════════ */

function BarChart({ data, height = 200 }: {
  data: { label: string; value: number; color: string }[]
  height?: number
}) {
  const svgRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(300)
  const [hovered, setHovered] = useState<number | null>(null)
  const padding = { top: 12, right: 12, bottom: 32, left: 42 }
  const chartW = w - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const barW = Math.min(36, chartW / data.length - 8)
  const gap = (chartW - barW * data.length) / (data.length + 1)

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

  const max = Math.max(...data.map(d => d.value)) * 1.15

  return (
    <div ref={svgRef} className="w-full relative" style={{ height }}>
      <svg width={w} height={height}>
        {Array.from({ length: 5 }, (_, i) => {
          const y = padding.top + (i / 4) * chartH
          const val = max - (i / 4) * max
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={w - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" fill={C.textDim} fontSize="9" fontFamily="sans-serif">
                {val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(0)}
              </text>
            </g>
          )
        })}
        {data.map((d, i) => {
          const x = padding.left + gap * (i + 1) + barW * i
          const barH = (d.value / max) * chartH
          const y = padding.top + chartH - barH
          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={x} y={y} width={barW} height={barH} rx={4} fill={hovered === i ? d.color : `${d.color}88`} transition="fill 0.15s" />
              <text x={x + barW / 2} y={height - 6} textAnchor="middle" fill={C.textDim} fontSize="9" fontFamily="sans-serif">{d.label}</text>
            </g>
          )
        })}
      </svg>
      {hovered !== null && (
        <div className="absolute rounded-lg border px-2.5 py-1.5 text-[10px] pointer-events-none" style={{ left: padding.left + gap * (hovered + 1) + barW * hovered + barW / 2 - 30, top: padding.top + chartH - (data[hovered].value / max) * chartH - 40, background: '#222', borderColor: C.border, color: C.text, zIndex: 10 }}>
          <p className="font-bold">{data[hovered].value.toLocaleString()}</p>
          <p style={{ color: data[hovered].color }}>{data[hovered].label}</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SVG DONUT CHART — with hover + legend
   ═══════════════════════════════════════════════════════════════ */

function DonutChart({ segments, size = 150, strokeWidth = 20, centerLabel }: {
  segments: { value: number; color: string; label: string; pct: string }[]
  size?: number; strokeWidth?: number; centerLabel?: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
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
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={hovered === i ? s.color : `${s.color}cc`} strokeWidth={hovered === i ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={`${(s.value / total) * circ} ${circ - (s.value / total) * circ}`}
              strokeDashoffset={-offsets[i]}
              strokeLinecap="round"
              style={{ transition: 'all 0.15s', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{centerLabel || '100%'}</span>
          <span className="text-[9px]" style={{ color: C.textTer }}>{hovered !== null ? segments[hovered].label : 'All'}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color, opacity: hovered === null || hovered === i ? 1 : 0.4 }} />
            <span className="text-[10px]" style={{ color: hovered === i ? C.text : C.textSec }}>
              {s.label} <span className="font-semibold text-white">{s.pct}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SVG PEAK HOURS BAR CHART — horizontal mini bars
   ═══════════════════════════════════════════════════════════════ */

function PeakHoursChart({ data }: { data: { hour: string; viewers: number; pct: number }[] }) {
  const max = Math.max(...data.map(d => d.viewers))
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono w-14 text-right flex-shrink-0" style={{ color: C.textTer }}>{d.hour}</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.viewers / max) * 100}%`, background: C.accent, transition: 'width 0.6s ease' }}
            />
          </div>
          <span className="text-[10px] font-semibold text-white w-10 text-right flex-shrink-0">{d.pct}%</span>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LIVE SCORES DATA — matches existing SCHEDULE_DATA pattern
   ═══════════════════════════════════════════════════════════════ */

interface LiveScore {
  id: string; home: string; away: string; homeScore: number; awayScore: number
  league: string; sport: string; time: string; minute: string
}

const LIVE_SCORES: LiveScore[] = [
  { id: 'ls1', home: 'Barcelona', away: 'Bayern Munich', homeScore: 2, awayScore: 1, league: 'UCL', sport: 'football', time: '78\'', minute: '2nd Half' },
  { id: 'ls2', home: 'Arsenal', away: 'Man City', homeScore: 1, awayScore: 1, league: 'EPL', sport: 'football', time: '55\'', minute: '2nd Half' },
  { id: 'ls3', home: 'Lakers', away: 'Celtics', homeScore: 87, awayScore: 82, league: 'NBA', sport: 'basketball', time: 'Q3', minute: '3rd Quarter' },
  { id: 'ls4', home: 'Real Madrid', away: 'Atlético Madrid', homeScore: 3, awayScore: 0, league: 'La Liga', sport: 'football', time: '90+2\'', minute: 'Added Time' },
  { id: 'ls5', home: 'Djokovic', away: 'Alcaraz', homeScore: 6, awayScore: 4, league: 'Wimbledon', sport: 'tennis', time: 'Set 2', minute: '2nd Set' },
]

const UPCOMING_MATCHES = [
  { home: 'Ferrari', away: 'Red Bull', date: 'Tomorrow', time: '2:00 PM', league: 'F1', sport: 'racing' },
  { home: 'PSG', away: 'AC Milan', date: 'Sun, Jun 8', time: '7:00 PM', league: 'UCL', sport: 'football' },
  { home: 'Warriors', away: 'Bucks', date: 'Mon, Jun 9', time: '8:00 PM', league: 'NBA', sport: 'basketball' },
  { home: 'Man United', away: 'Liverpool', date: 'Sat, Jun 7', time: '5:30 PM', league: 'EPL', sport: 'football' },
]

const ACTIVITY_FEED = [
  { icon: Play, color: C.accent, text: 'Watched Barcelona vs Bayern Munich', time: '5 min ago' },
  { icon: Heart, color: '#ff3b3b', text: 'Added NBA Finals to Favorites', time: '20 min ago' },
  { icon: Trophy, color: C.warning, text: 'Earned "Super Fan" badge', time: '1 hour ago' },
  { icon: MessageSquare, color: C.purple, text: 'Commented on EPL Highlights', time: '2 hours ago' },
  { icon: Star, color: C.orange, text: 'Rated Wimbledon SF ★★★★★', time: '3 hours ago' },
  { icon: Bell, color: C.cyan, text: 'Reminder set: F1 GP Tomorrow', time: '4 hours ago' },
  { icon: Zap, color: C.green, text: 'Stream quality auto-upgraded to 1080p', time: '5 hours ago' },
]

const TOP_LEAGUES = [
  { name: 'UEFA Champions League', icon: '🏆', viewers: 2.4, pct: 92 },
  { name: 'Premier League', icon: '🦁', viewers: 1.8, pct: 78 },
  { name: 'La Liga', icon: '⭐', viewers: 1.5, pct: 65 },
  { name: 'NBA', icon: '🏀', viewers: 1.2, pct: 52 },
  { name: 'Formula 1', icon: '🏎️', viewers: 0.9, pct: 40 },
  { name: 'Wimbledon', icon: '🎾', viewers: 0.7, pct: 31 },
]

const SPORT_ICONS: Record<string, string> = { football: '⚽', basketball: '🏀', tennis: '🎾', racing: '🏎️', cricket: '🏏', mma: '🥊' }

/* ═══════════════════════════════════════════════════════════════
   USER DASHBOARD — Main Component
   ═══════════════════════════════════════════════════════════════ */

export default function UserDashboard() {
  // ── Live clock ──
  const [clock, setClock] = useState('')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }))
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])

  // ── Real-time KPI data (updates every 3 seconds) ──
  const [kpis, setKpis] = useState([
    { label: 'Live Now', value: 4, icon: Radio, color: '#ff3b3b', change: 0, sparkData: [2, 3, 3, 4, 5, 4, 4, 3, 4, 5] },
    { label: 'Total Viewers', value: 184320, icon: Eye, color: C.accent, change: 12.5, sparkData: [140, 152, 148, 165, 170, 158, 175, 180, 172, 184] },
    { label: "Today's Matches", value: 12, icon: Calendar, color: C.blue, change: 8.3, sparkData: [6, 7, 8, 10, 9, 11, 10, 12, 11, 12] },
    { label: 'Your Watch Time', value: 6.5, icon: Clock, color: C.orange, change: 15.2, sparkData: [2.1, 3.0, 2.8, 4.2, 3.8, 5.1, 4.5, 5.8, 6.0, 6.5] },
    { label: 'Favorites', value: 24, icon: Heart, color: '#ff3b3b', change: 4.2, sparkData: [18, 19, 20, 20, 21, 22, 21, 23, 23, 24] },
    { label: 'Notifications', value: 7, icon: Bell, color: C.cyan, change: -2.1, sparkData: [10, 12, 9, 11, 8, 10, 9, 8, 7, 7] },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prev => prev.map((k, i) => {
        if (i === 0) {
          // Live Now: fluctuates 3-6
          const newVal = Math.max(2, Math.min(7, k.value + Math.round((Math.random() - 0.45) * 2)))
          const newSpark = [...k.sparkData.slice(1), newVal]
          return { ...k, value: newVal, sparkData: newSpark }
        }
        if (i === 1) {
          // Total Viewers: fluctuates
          const fluctuation = (Math.random() - 0.4) * 5000
          const newVal = Math.max(150000, k.value + fluctuation)
          const newSpark = [...k.sparkData.slice(1), newVal / 1000]
          return { ...k, value: Math.round(newVal), sparkData: newSpark }
        }
        if (i === 3) {
          // Watch Time: slowly increases
          const newVal = k.value + Math.random() * 0.05
          const newSpark = [...k.sparkData.slice(1), newVal]
          return { ...k, value: Math.round(newVal * 10) / 10, sparkData: newSpark }
        }
        const newSpark = [...k.sparkData.slice(1), k.sparkData[k.sparkData.length - 1] + (Math.random() - 0.4) * 2]
        return { ...k, sparkData: newSpark }
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // ── Real-time live scores (updates every 5 seconds) ──
  const [liveScores, setLiveScores] = useState(LIVE_SCORES)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveScores(prev => prev.map(s => {
        // Small chance of score change
        if (Math.random() > 0.7) {
          const homeScores = Math.random() > 0.5
          return {
            ...s,
            homeScore: homeScores ? s.homeScore + (Math.random() > 0.8 ? 1 : 0) : s.homeScore,
            awayScore: !homeScores ? s.awayScore + (Math.random() > 0.8 ? 1 : 0) : s.awayScore,
          }
        }
        return s
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // ── Real-time chart data (updates every 4 seconds) ──
  const [viewersData, setViewersData] = useState([45, 62, 58, 72, 80, 65, 78, 90, 85, 95, 88, 92])
  const viewersLabels = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM']

  const [matchActivityData, setMatchActivityData] = useState([
    { label: '⚽', value: 48, color: '#10b981' },
    { label: '🏀', value: 24, color: C.orange },
    { label: '🎾', value: 18, color: C.warning },
    { label: '🏎️', value: 14, color: C.accent },
    { label: '🏏', value: 12, color: C.cyan },
    { label: '🥊', value: 8, color: C.purple },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setViewersData(prev => [...prev.slice(1), prev[prev.length - 1] + (Math.random() - 0.4) * 15])
      setMatchActivityData(prev => prev.map(d => ({
        ...d,
        value: Math.max(4, d.value + Math.round((Math.random() - 0.45) * 3)),
      })))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // ── Popular Sports Donut ──
  const popularSports = [
    { value: 38, color: '#10b981', label: 'Football', pct: '38%' },
    { value: 22, color: C.orange, label: 'Basketball', pct: '22%' },
    { value: 16, color: C.warning, label: 'Tennis', pct: '16%' },
    { value: 12, color: C.accent, label: 'Racing', pct: '12%' },
    { value: 8, color: C.cyan, label: 'Cricket', pct: '8%' },
    { value: 4, color: C.purple, label: 'MMA', pct: '4%' },
  ]

  // ── Platform Stats ──
  const deviceStats = [
    { value: 52.1, color: C.accent, label: 'Mobile', pct: '52.1%' },
    { value: 24.3, color: C.purple, label: 'Desktop', pct: '24.3%' },
    { value: 15.8, color: C.blue, label: 'Smart TV', pct: '15.8%' },
    { value: 7.8, color: C.orange, label: 'Tablet', pct: '7.8%' },
  ]

  const peakHours = [
    { hour: '6-9 AM', viewers: 45, pct: 12 },
    { hour: '9-12 PM', viewers: 78, pct: 21 },
    { hour: '12-3 PM', viewers: 62, pct: 17 },
    { hour: '3-6 PM', viewers: 85, pct: 23 },
    { hour: '6-9 PM', viewers: 95, pct: 26 },
    { hour: '9-12 AM', viewers: 70, pct: 19 },
  ]

  // ── Format helpers ──
  const fmtKpi = (kpi: typeof kpis[0], i: number) => {
    if (i === 0) return `${kpi.value}`
    if (i === 1) return `${(kpi.value / 1000).toFixed(1)}K`
    if (i === 2) return `${kpi.value}`
    if (i === 3) return `${kpi.value}h`
    if (i === 4) return `${kpi.value}`
    if (i === 5) return `${kpi.value}`
    return String(kpi.value)
  }

  return (
    <div className="space-y-3 md:space-y-4 fade-in-up">

      {/* ════════ GREETING SECTION ════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            Welcome back, Sportix Fan!
            <span className="inline-block animate-bounce">🏟️</span>
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-xs" style={{ color: C.textTer }}>{dateStr}</p>
            <span className="text-xs font-mono font-semibold" style={{ color: C.accent }}>{clock}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }}>
            <Wifi className="h-3 w-3" style={{ color: C.green }} />
            <span className="text-[10px] font-medium" style={{ color: C.green }}>Connected</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }}>
            <Shield className="h-3 w-3" style={{ color: C.accent }} />
            <span className="text-[10px] font-medium" style={{ color: C.textSec }}>Premium</span>
          </div>
        </div>
      </div>

      {/* ════════ 6 KPI CARDS ════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          const isLive = idx === 0
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border p-3 sm:p-3.5 transition-all duration-200 hover:border-white/10"
              style={{ background: C.card, borderColor: C.border }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl relative" style={{ background: `${kpi.color}18` }}>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: kpi.color }} />
                  {isLive && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#ff3b3b] live-pulse" />
                  )}
                </div>
                <Sparkline data={kpi.sparkData} color={kpi.color} width={60} height={24} className="hidden sm:block" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: C.textTer }}>{kpi.label}</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight truncate">
                {isLive && (<span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#ff3b3b] live-pulse" /></span>)}
                {fmtKpi(kpi, idx)}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                {kpi.change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" style={{ color: C.green }} />
                ) : (
                  <ArrowDownRight className="h-3 w-3" style={{ color: '#ff3b3b' }} />
                )}
                <span className="text-[10px] font-semibold" style={{ color: kpi.change >= 0 ? C.green : '#ff3b3b' }}>
                  {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                </span>
                <span className="text-[9px]" style={{ color: C.textDim }}>today</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ════════ CHARTS ROW: Viewers Trend + Match Activity + Popular Sports ════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* Viewers Trend */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Viewers Trend</h3>
            <span className="text-[10px] font-semibold" style={{ color: C.green }}>Live</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-white">{(kpis[1].value / 1000).toFixed(1)}K</span>
            <span className="text-[10px] font-semibold" style={{ color: C.green }}>↑12.5%</span>
          </div>
          <p className="text-[10px] mb-3" style={{ color: C.textDim }}>Real-time viewers across all sports</p>
          <div className="relative">
            <AreaChart data={viewersData} labels={viewersLabels} color={C.accent} height={180} />
          </div>
        </div>

        {/* Match Activity */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Match Activity</h3>
            <span className="text-[10px] font-medium" style={{ color: C.textTer }}>By Sport</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-white">{matchActivityData.reduce((a, d) => a + d.value, 0)}</span>
            <span className="text-[10px]" style={{ color: C.textTer }}>active matches</span>
          </div>
          <p className="text-[10px] mb-3" style={{ color: C.textDim }}>Current live & recent matches</p>
          <BarChart data={matchActivityData} height={180} />
        </div>

        {/* Popular Sports Donut */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Popular Sports</h3>
            <span className="text-[10px] font-medium" style={{ color: C.textTer }}>By Viewership</span>
          </div>
          <div className="flex justify-center">
            <DonutChart segments={popularSports} size={140} strokeWidth={18} centerLabel="6" />
          </div>
        </div>
      </div>

      {/* ════════ LIVE MATCH SCORES TABLE ════════ */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: C.card, borderColor: C.border }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b3b] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff3b3b]" />
            </span>
            <h3 className="text-sm font-semibold text-white">Live Match Scores</h3>
            <span className="text-[10px] font-semibold rounded-full bg-[#ff3b3b]/15 px-2 py-0.5 text-[#ff3b3b]">{liveScores.length} LIVE</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Match', 'League', 'Sport', 'Time', 'Score', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveScores.map((match) => (
                <tr key={match.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${C.accent}15` }}>
                        <Play className="h-3 w-3" style={{ color: C.accent }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{match.home} <span className="text-[#E50914] font-bold">vs</span> {match.away}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: C.textSec }}>
                      {match.league}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{SPORT_ICONS[match.sport] || '⚽'}</span>
                    <span className="text-[10px] ml-1 capitalize" style={{ color: C.textTer }}>{match.sport}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: C.textSec }}>{match.minute}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-black text-white">{match.homeScore} <span style={{ color: C.textDim }}>-</span> {match.awayScore}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: 'rgba(255,59,59,0.12)', color: '#ff3b3b' }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b3b] live-pulse" />
                      {match.time}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════ UPCOMING + ACTIVITY FEED ════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Upcoming Matches */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4" style={{ color: C.blue }} />
              Upcoming Matches
            </h3>
            <button className="text-[10px] font-medium flex items-center gap-0.5" style={{ color: C.accent }}>
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {UPCOMING_MATCHES.map((m, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-white/[0.03]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-base flex-shrink-0">{SPORT_ICONS[m.sport] || '⚽'}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{m.home} <span className="text-[#E50914] font-bold">vs</span> {m.away}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px]" style={{ color: C.textTer }}>{m.league}</span>
                      <span className="text-[10px]" style={{ color: C.textDim }}>•</span>
                      <span className="text-[10px]" style={{ color: C.textTer }}>{m.date}</span>
                    </div>
                  </div>
                </div>
                <span className="flex-shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold" style={{ background: 'rgba(0,113,235,0.1)', color: C.blue }}>
                  {m.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Your Activity Feed */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="h-4 w-4" style={{ color: C.orange }} />
              Your Activity
            </h3>
            <button className="text-[10px] font-medium flex items-center gap-0.5" style={{ color: C.accent }}>
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-0">
            {ACTIVITY_FEED.map((act, i) => {
              const Icon = act.icon
              return (
                <div key={i} className="flex items-start gap-2.5 py-2.5 border-b last:border-0" style={{ borderColor: C.border }}>
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg mt-0.5" style={{ background: `${act.color}15` }}>
                    <Icon className="h-3 w-3" style={{ color: act.color }} />
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
      </div>

      {/* ════════ TOP LEAGUES TABLE ════════ */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: C.card, borderColor: C.border }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.border }}>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Trophy className="h-4 w-4" style={{ color: C.warning }} />
            Top Leagues
          </h3>
          <span className="text-[10px]" style={{ color: C.textTer }}>By viewership</span>
        </div>
        <div className="divide-y" style={{ borderColor: C.border }}>
          {TOP_LEAGUES.map((league, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]">
              <span className="text-lg flex-shrink-0">{league.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-white truncate pr-2">{league.name}</p>
                  <span className="text-[11px] font-semibold text-white flex-shrink-0">{league.viewers}M</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${league.pct}%`, background: C.accent }} />
                  </div>
                  <span className="text-[10px] font-semibold w-8 text-right" style={{ color: C.textTer }}>{league.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════ PLATFORM STATS: Device Breakdown + Peak Hours ════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Device Breakdown */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Smartphone className="h-4 w-4" style={{ color: C.cyan }} />
              Device Breakdown
            </h3>
          </div>
          <div className="flex justify-center">
            <DonutChart segments={deviceStats} size={140} strokeWidth={18} centerLabel="4" />
          </div>
          {/* Device icons row */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
            {[
              { icon: Smartphone, label: 'Mobile', color: C.accent },
              { icon: Monitor, label: 'Desktop', color: C.purple },
              { icon: Tv, label: 'TV', color: C.blue },
              { icon: Tablet, label: 'Tablet', color: C.orange },
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <d.icon className="h-4 w-4" style={{ color: d.color }} />
                <span className="text-[9px]" style={{ color: C.textTer }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: C.green }} />
              Peak Viewing Hours
            </h3>
            <span className="text-[10px] font-medium" style={{ color: C.textTer }}>Today</span>
          </div>
          <PeakHoursChart data={peakHours} />
          <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: C.accent }} />
              <span className="text-[10px]" style={{ color: C.textTer }}>Busiest: 6-9 PM</span>
            </div>
            <span className="text-[10px] font-semibold" style={{ color: C.green }}>+18% vs avg</span>
          </div>
        </div>
      </div>
    </div>
  )
}
