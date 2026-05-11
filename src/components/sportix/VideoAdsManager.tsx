'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

import {
  LayoutDashboard, Eye, MousePointerClick, DollarSign, Target,
  Download, Upload, CloudUpload, Pause, X, Play, Search,
  ChevronDown, ChevronLeft, ChevronRight, Calendar, Plus, FileVideo,
  Image, Edit3, Trash2, Info, Clock, Film,
  BarChart3, ArrowUpRight, Settings, Check, SkipForward, List,
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

import { supabase } from '@/lib/supabase'
import VideoUploadUI from './VideoUploadUI'

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
type Tab = 'overview' | 'upload' | 'ads-list' | 'timeline' | 'settings' | 'pre-roll' | 'mid-roll' | 'post-roll'

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
  xhr?: XMLHttpRequest | null
}


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

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 // 5GB

const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'avi', 'mkv']
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const ALL_ALLOWED_EXTENSIONS = [...ALLOWED_VIDEO_EXTENSIONS, ...ALLOWED_IMAGE_EXTENSIONS]

function getFileExt(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

let _uid = 0
const uid = () => `u${++_uid}_${Date.now()}`

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
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
   PURE SVG AREA CHART
   ═══════════════════════════════════════════════════════════════ */
function SvgAreaChart({ data, seriesKeys, seriesColors, seriesNames, height = 192 }: {
  data: { date: string; [k: string]: string | number }[]
  seriesKeys: string[]
  seriesColors: string[]
  seriesNames: string[]
  height?: number
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; items: { name: string; value: number; color: string }[]; label: string } | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const W = 700
  const H = height
  const PAD_L = 5
  const PAD_R = 15
  const PAD_T = 8
  const PAD_B = 28
  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  // Compute max value across all series for shared Y axis
  const allValues = data.flatMap(d => seriesKeys.map(k => Number(d[k] || 0)))
  const maxVal = Math.max(...allValues, 1)

  const xStep = chartW / (data.length - 1)

  const buildPathAndArea = (key: string) => {
    const points = data.map((d, i) => ({
      x: PAD_L + i * xStep,
      y: PAD_T + chartH - (Number(d[key] || 0) / maxVal) * chartH,
    }))
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const areaPath = linePath + ` L${points[points.length - 1].x},${PAD_T + chartH} L${PAD_L},${PAD_T + chartH} Z`
    return { linePath, areaPath, points }
  }

  // Y-axis tick values
  const yTicks = 4
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxVal / yTicks) * i))

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * W
    const idx = Math.round((mx - PAD_L) / xStep)
    if (idx < 0 || idx >= data.length) { setTooltip(null); setHoveredIdx(null); return }
    const items = seriesKeys.map((k, i) => ({
      name: seriesNames[i],
      value: Number(data[idx][k] || 0),
      color: seriesColors[i],
    }))
    const px = ((PAD_L + idx * xStep) / W) * 100
    const py = ((PAD_T + chartH * 0.2) / H) * 100
    setTooltip({ x: px, y: py, items, label: data[idx].date })
    setHoveredIdx(idx)
  }, [data, seriesKeys, seriesNames, seriesColors, xStep, W, H, PAD_L, PAD_T, chartH])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
    setHoveredIdx(null)
  }, [])

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {seriesKeys.map((_, i) => (
            <linearGradient key={i} id={`svgGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesColors[i]} stopOpacity={0.3} />
              <stop offset="100%" stopColor={seriesColors[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = PAD_T + (chartH / yTicks) * i
          return <line key={i} x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
        })}

        {/* Y-axis labels */}
        {yTickValues.map((v, i) => (
          <text key={i} x={PAD_L - 2} y={PAD_T + (chartH / yTicks) * i + 3} fill="#52525b" fontSize="9" textAnchor="end" fontFamily="system-ui">{fmtNum(v)}</text>
        ))}

        {/* X-axis labels (every 5th) */}
        {data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map((d, _, arr) => {
          const origIdx = data.indexOf(d)
          return (
            <text key={origIdx} x={PAD_L + origIdx * xStep} y={H - 6} fill="#52525b" fontSize="9" textAnchor="middle" fontFamily="system-ui">{d.date}</text>
          )
        })}

        {/* Areas and lines */}
        {seriesKeys.map((key, i) => {
          const { linePath, areaPath } = buildPathAndArea(key)
          return (
            <g key={key}>
              <path d={areaPath} fill={`url(#svgGrad${i})`} />
              <path d={linePath} fill="none" stroke={seriesColors[i]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          )
        })}

        {/* Hover vertical line + dots */}
        {hoveredIdx !== null && (
          <>
            <line x1={PAD_L + hoveredIdx * xStep} y1={PAD_T} x2={PAD_L + hoveredIdx * xStep} y2={PAD_T + chartH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 2" />
            {seriesKeys.map((key, i) => {
              const y = PAD_T + chartH - (Number(data[hoveredIdx][key] || 0) / maxVal) * chartH
              return <circle key={key} cx={PAD_L + hoveredIdx * xStep} cy={y} r={4} fill={seriesColors[i]} stroke="#0a0a0a" strokeWidth={2} />
            })}
          </>
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="rounded-xl px-3 py-2 text-xs pointer-events-none"
          style={{
            position: 'absolute',
            left: `${Math.min(tooltip.x, 75)}%`,
            top: `${tooltip.y}%`,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(0,0,0,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            zIndex: 20,
            whiteSpace: 'nowrap',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-1">{tooltip.label}</p>
          {tooltip.items.map((item, i) => (
            <p key={i} style={{ color: item.color }} className="font-medium">
              {item.name}: {item.name === 'Revenue' ? fmtCurrency(item.value) : fmtNum(item.value)}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PURE SVG BAR CHART
   ═══════════════════════════════════════════════════════════════ */
function SvgBarChart({ data, dataKey, nameKey, colorKey }: {
  data: { name: string; count: number; color: string }[]
  dataKey: string
  nameKey: string
  colorKey: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; value: number; color: string } | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const W = 700
  const H = 224
  const PAD_L = 5
  const PAD_R = 15
  const PAD_T = 8
  const PAD_B = 32
  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  const maxVal = Math.max(...data.map(d => d.count), 1)
  const barGroupW = chartW / data.length
  const barW = barGroupW * 0.6
  const barGap = (barGroupW - barW) / 2

  const yTicks = 4
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxVal / yTicks) * i))

  const handleBarHover = useCallback((idx: number, e: React.MouseEvent) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * W
    setTooltip({
      x: (mx / W) * 100,
      y: ((PAD_T + chartH - (data[idx].count / maxVal) * chartH) / H) * 100,
      name: data[idx].name,
      value: data[idx].count,
      color: data[idx].color,
    })
    setHoveredIdx(idx)
  }, [data, maxVal, W, H, PAD_T, chartH])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
    setHoveredIdx(null)
  }, [])

  return (
    <div style={{ width: '100%', height: H, position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = PAD_T + (chartH / yTicks) * i
          return <line key={i} x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
        })}

        {/* Y-axis labels */}
        {yTickValues.map((v, i) => (
          <text key={i} x={PAD_L - 2} y={PAD_T + (chartH / yTicks) * i + 3} fill="#52525b" fontSize="9" textAnchor="end" fontFamily="system-ui">{v}</text>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.count / maxVal) * chartH
          const x = PAD_L + i * barGroupW + barGap
          const y = PAD_T + chartH - barH
          return (
            <g key={d.name} onMouseMove={(e) => handleBarHover(i, e)}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={6}
                ry={6}
                fill={d.color}
                opacity={hoveredIdx !== null && hoveredIdx !== i ? 0.5 : 1}
                style={{ transition: 'opacity 0.15s', cursor: 'pointer' }}
              />
              {/* Value on top of bar */}
              <text x={x + barW / 2} y={y - 6} fill={d.color} fontSize="9" textAnchor="middle" fontFamily="system-ui" fontWeight="600">{d.count}</text>
            </g>
          )
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={d.name} x={PAD_L + i * barGroupW + barGroupW / 2} y={H - 8} fill="#52525b" fontSize="9" textAnchor="middle" fontFamily="system-ui">{d.name}</text>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="rounded-xl px-3 py-2 text-xs pointer-events-none"
          style={{
            position: 'absolute',
            left: `${tooltip.x}%`,
            top: `${tooltip.y}%`,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(0,0,0,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            zIndex: 20,
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-0.5">{tooltip.name}</p>
          <p style={{ color: tooltip.color }} className="font-medium">Count: {tooltip.value}</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PURE SVG DONUT CHART
   ═══════════════════════════════════════════════════════════════ */
function SvgDonutChart({ data, size = 180, innerR = 55, outerR = 80 }: {
  data: { name: string; value: number; color: string }[]
  size?: number
  innerR?: number
  outerR?: number
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; value: number; color: string; pct: number } | null>(null)
  const total = data.reduce((s, d) => s + d.value, 0)
  const cx = size / 2
  const cy = size / 2
  const midR = (innerR + outerR) / 2

  // Build arcs using SVG circle stroke-dasharray trick
  const circumference = 2 * Math.PI * midR

  const segments = data.reduce<Array<typeof data[0] & { pct: number; dashArray: string; dashOffset: number; startAngle: number }>>((acc, d) => {
    const pct = d.value / total
    const prevOffset = acc.length > 0 ? acc[acc.length - 1].dashOffset + (acc[acc.length - 1].pct * circumference) : 0
    const dashLength = pct * circumference
    const gap = circumference - dashLength
    return [...acc, {
      ...d,
      pct,
      dashArray: `${dashLength} ${gap}`,
      dashOffset: -prevOffset,
      startAngle: (prevOffset / circumference) * 360,
    }]
  }, [])

  const handleSegmentHover = useCallback((seg: typeof segments[0], e: React.MouseEvent) => {
    setTooltip({
      x: 50,
      y: 15,
      name: seg.name,
      value: seg.value,
      color: seg.color,
      pct: seg.pct,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {segments.map((seg, i) => (
          <circle
            key={seg.name}
            cx={cx}
            cy={cy}
            r={midR}
            fill="none"
            stroke={seg.color}
            strokeWidth={outerR - innerR}
            strokeDasharray={seg.dashArray}
            strokeDashoffset={seg.dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={(e) => handleSegmentHover(seg, e)}
            onMouseMove={(e) => handleSegmentHover(seg, e)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg font-bold text-white">{total}</span>
        <span className="text-[9px]" style={{ color: C.textDim }}>Total Ads</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="rounded-xl px-3 py-2 text-xs pointer-events-none"
          style={{
            position: 'absolute',
            left: `${tooltip.x}%`,
            top: `${tooltip.y}%`,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(0,0,0,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            zIndex: 20,
            whiteSpace: 'nowrap',
          }}
        >
          <p style={{ color: tooltip.color }} className="font-medium">
            {tooltip.name}: {tooltip.value} ({(tooltip.pct * 100).toFixed(1)}%)
          </p>
        </div>
      )}
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
  const [ads, setAds] = useState<AdItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
  const [performanceData, setPerformanceData] = useState<any[]>([])
  
  const [form, setForm] = useState({
    title: '',
    type: 'video',
    placement: 'mid-roll',
    mediaUrl: '',
    duration: 15,
  })
  const [saving, setSaving] = useState(false)

  const handleCreateAd = async () => {
    if (!form.title) return
    setSaving(true)
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          isActive: true
        })
      })
      if (res.ok) {
        setShowCreateModal(false)
        fetchAds()
        setForm({ title: '', type: 'video', placement: 'mid-roll', mediaUrl: '', duration: 15 })
      }
    } catch (err) {
      console.error('Error creating ad:', err)
    } finally {
      setSaving(false)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const xhrRefs = useRef<Map<string, XMLHttpRequest>>(new Map())

  const fetchAds = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('Ad')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error

      const mapped: AdItem[] = (data || []).map(ad => ({
        id: ad.id,
        name: ad.title,
        type: (ad.type === 'video' ? 'Video' : ad.type === 'banner' ? 'Banner' : 'Image') as any,
        placement: (ad.placement || 'Mid-roll') as any,
        duration: ad.duration ? `00:${String(ad.duration).padStart(2, '0')}` : '00:15',
        status: ad.isActive ? 'Active' : 'Paused',
        impressions: ad.impressions || 0,
        clicks: ad.clicks || 0,
        revenue: (ad.clicks * (ad.cpc || 0)) + ((ad.impressions / 1000) * (ad.cpm || 0)),
        ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0,
        thumbnail: ad.mediaUrl
      }))
      setAds(mapped)
    } catch (err) {
      console.error('Error fetching ads:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAds()
    const channel = supabase
      .channel('video_ads_updates')
      .on('postgres_changes' as any, { event: '*', table: 'Ad' }, () => fetchAds())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchAds])

  const adFormatData = useMemo(() => {
    const counts = ads.reduce((acc, ad) => {
      acc[ad.type] = (acc[ad.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, value], i) => ({
      name: name + ' Ads',
      value,
      color: CHART_COLORS[i % CHART_COLORS.length]
    }))
  }, [ads])

  const adTypeData = useMemo(() => {
    const counts = ads.reduce((acc, ad) => {
      acc[ad.placement] = (acc[ad.placement] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, count], i) => ({
      name,
      count,
      color: CHART_COLORS[i % CHART_COLORS.length]
    }))
  }, [ads])
  const perPage = 8

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchSearch = ad.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchType = filterType === 'all' || ad.type.toLowerCase() === filterType.toLowerCase()
      const matchStatus = filterStatus === 'all' || ad.status.toLowerCase() === filterStatus.toLowerCase()
      return matchSearch && matchType && matchStatus
    })
  }, [ads, searchQuery, filterType, filterStatus])

  const totalPages = Math.ceil(filteredAds.length / perPage)
  const pagedAds = filteredAds.slice((currentPage - 1) * perPage, currentPage * perPage)

  /* ═══════ CHUNK SIZE for large files ═══════ */
  const CHUNK_UPLOAD_SIZE = 50 * 1024 * 1024 // 50MB per chunk for large files
  const cancelledUploads = useRef<Set<string>>(new Set())

  /* ═══════ REAL UPLOAD via Chunked XMLHttpRequest ═══════ */
  const realUpload = useCallback(async (file: File) => {
    const entryId = uid()

    // Validate file extension
    const ext = getFileExt(file.name)
    const isVideo = uploadTab === 'video'
    const allowedExts = isVideo ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS

    if (!allowedExts.includes(ext)) {
      const entry: UploadEntry = {
        id: entryId, file, status: 'error', progress: 0,
        uploadedBytes: 0, totalBytes: file.size, speed: 0,
        error: `Unsupported file type: .${ext}. Allowed: ${allowedExts.join(', ')}`,
        startTime: Date.now(),
      }
      setUploads(prev => [entry, ...prev])
      return
    }

    // Validate file size (5GB)
    if (file.size > MAX_FILE_SIZE) {
      const entry: UploadEntry = {
        id: entryId, file, status: 'error', progress: 0,
        uploadedBytes: 0, totalBytes: file.size, speed: 0,
        error: `File too large (${fmtBytes(file.size)}). Max: 5GB`,
        startTime: Date.now(),
      }
      setUploads(prev => [entry, ...prev])
      return
    }

    if (file.size === 0) {
      const entry: UploadEntry = {
        id: entryId, file, status: 'error', progress: 0,
        uploadedBytes: 0, totalBytes: 0, speed: 0,
        error: 'File is empty (0 bytes)',
        startTime: Date.now(),
      }
      setUploads(prev => [entry, ...prev])
      return
    }

    const entry: UploadEntry = {
      id: entryId, file, status: 'uploading', progress: 0,
      uploadedBytes: 0, totalBytes: file.size, speed: 0,
      startTime: Date.now(),
    }
    setUploads(prev => [entry, ...prev])

    // ─── Small file: single upload ───
    if (file.size <= CHUNK_UPLOAD_SIZE) {
      const xhr = new XMLHttpRequest()
      xhrRefs.current.set(entryId, xhr)

      const formData = new FormData()
      formData.append('file', file)

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          const elapsed = (Date.now() - entry.startTime) / 1000
          const speed = elapsed > 0 ? e.loaded / elapsed : 0
          setUploads(prev => prev.map(u =>
            u.id === entryId
              ? { ...u, progress, uploadedBytes: e.loaded, speed }
              : u
          ))
        }
      })

      xhr.addEventListener('load', () => {
        xhrRefs.current.delete(entryId)
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText)
            if (res.success) {
              const fileUrl = res.url || res.fileUrl || ''
              if (fileUrl) {
                setForm(f => ({ ...f, mediaUrl: fileUrl }))
              }
              setUploads(prev => prev.map(u =>
                u.id === entryId
                  ? { ...u, status: 'complete', progress: 100, uploadedBytes: u.totalBytes }
                  : u
              ))
              return
            } else {
              setUploads(prev => prev.map(u =>
                u.id === entryId
                  ? { ...u, status: 'error', error: res.error || 'Upload failed' }
                  : u
              ))
              return
            }
          } catch { /* ignore parse error */ }
          setUploads(prev => prev.map(u =>
            u.id === entryId
              ? { ...u, status: 'complete', progress: 100, uploadedBytes: u.totalBytes }
              : u
          ))
        } else {
          let errorMsg = `Upload failed (HTTP ${xhr.status})`
          try {
            const res = JSON.parse(xhr.responseText)
            errorMsg = res.error || errorMsg
          } catch { /* ignore */ }
          setUploads(prev => prev.map(u =>
            u.id === entryId
              ? { ...u, status: 'error', error: errorMsg }
              : u
          ))
        }
      })

      xhr.addEventListener('error', () => {
        xhrRefs.current.delete(entryId)
        setUploads(prev => prev.map(u =>
          u.id === entryId
            ? { ...u, status: 'error', error: 'Network error. Please try again.' }
            : u
        ))
      })

      xhr.addEventListener('abort', () => {
        xhrRefs.current.delete(entryId)
        setUploads(prev => prev.map(u =>
          u.id === entryId
            ? { ...u, status: 'cancelled' }
            : u
        ))
      })

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
      return
    }

    // ─── Large file: chunked upload ───
    const fileId = `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const totalChunks = Math.ceil(file.size / CHUNK_UPLOAD_SIZE)
    let uploadedChunks = 0
    let totalUploadedBytes = 0

    const uploadNextChunk = async (chunkIdx: number): Promise<boolean> => {
      if (cancelledUploads.current.has(entryId)) return false

      const start = chunkIdx * CHUNK_UPLOAD_SIZE
      const end = Math.min(start + CHUNK_UPLOAD_SIZE, file.size)
      const chunk = file.slice(start, end)

      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest()
        xhrRefs.current.set(entryId, xhr)

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const chunkProgress = e.loaded / (end - start)
            const totalProgress = ((uploadedChunks + chunkProgress) / totalChunks) * 100
            const totalBytes = totalUploadedBytes + e.loaded
            const elapsed = (Date.now() - entry.startTime) / 1000
            const speed = elapsed > 0 ? totalBytes / elapsed : 0
            setUploads(prev => prev.map(u =>
              u.id === entryId
                ? { ...u, progress: totalProgress, uploadedBytes: totalBytes, speed }
                : u
            ))
          }
        })

        xhr.addEventListener('load', () => {
          xhrRefs.current.delete(entryId)
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText)
              if (res.success) {
                const fileUrl = res.url || res.fileUrl || ''
                if (fileUrl) {
                  setForm(f => ({ ...f, mediaUrl: fileUrl }))
                }
                // If this was the last chunk and server assembled the file
                if (res.url) {
                  setUploads(prev => prev.map(u =>
                    u.id === entryId
                      ? { ...u, status: 'complete', progress: 100, uploadedBytes: u.totalBytes }
                      : u
                  ))
                  resolve(true)
                  return
                }
                uploadedChunks++
                totalUploadedBytes += (end - start)
                setUploads(prev => prev.map(u =>
                  u.id === entryId
                    ? { ...u, progress: (uploadedChunks / totalChunks) * 100, uploadedBytes: totalUploadedBytes }
                    : u
                ))
                resolve(true)
                return
              }
            } catch { /* ignore */ }
          }
          let errorMsg = `Chunk ${chunkIdx + 1} failed (HTTP ${xhr.status})`
          try {
            const res = JSON.parse(xhr.responseText)
            errorMsg = res.error || errorMsg
          } catch { /* ignore */ }
          setUploads(prev => prev.map(u =>
            u.id === entryId
              ? { ...u, status: 'error', error: errorMsg }
              : u
          ))
          resolve(false)
        })

        xhr.addEventListener('error', () => {
          xhrRefs.current.delete(entryId)
          setUploads(prev => prev.map(u =>
            u.id === entryId
              ? { ...u, status: 'error', error: `Chunk ${chunkIdx + 1} network error` }
              : u
          ))
          resolve(false)
        })

        xhr.addEventListener('abort', () => {
          xhrRefs.current.delete(entryId)
          setUploads(prev => prev.map(u =>
            u.id === entryId
              ? { ...u, status: 'cancelled' }
              : u
          ))
          resolve(false)
        })

        xhr.open('POST', '/api/upload')
        xhr.setRequestHeader('x-upload-type', 'chunk')
        xhr.setRequestHeader('x-file-id', fileId)
        xhr.setRequestHeader('x-chunk-index', String(chunkIdx))
        xhr.setRequestHeader('x-total-chunks', String(totalChunks))
        xhr.setRequestHeader('x-file-name', file.name)
        xhr.setRequestHeader('x-file-size', String(file.size))
        xhr.setRequestHeader('x-file-mime', file.type || 'application/octet-stream')
        xhr.send(chunk)
      })
    }

    // Upload chunks sequentially
    for (let i = 0; i < totalChunks; i++) {
      if (cancelledUploads.current.has(entryId)) break
      const ok = await uploadNextChunk(i)
      if (!ok) break
    }
  }, [uploadTab])

  const pauseUpload = useCallback((entryId: string) => {
    cancelledUploads.current.add(entryId)
    const xhr = xhrRefs.current.get(entryId)
    if (xhr) {
      xhr.abort()
    }
  }, [])

  const cancelUpload = useCallback((entryId: string) => {
    cancelledUploads.current.add(entryId)
    const xhr = xhrRefs.current.get(entryId)
    if (xhr) {
      xhr.abort()
    }
    setUploads(prev => prev.filter(u => u.id !== entryId))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    files.forEach(realUpload)
  }, [realUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(realUpload)
    e.target.value = ''
  }, [realUpload])


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
    { id: 'pre-roll', label: 'Pre-Roll', icon: Play },
    { id: 'mid-roll', label: 'Mid-Roll', icon: Film },
    { id: 'post-roll', label: 'Post-Roll', icon: SkipForward },
    { id: 'upload', label: 'Upload Ad', icon: CloudUpload },
    { id: 'ads-list', label: 'All Ads', icon: List },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="space-y-4 min-w-0">
      {/* ════════════════════════════════════════
          PAGE HEADER
          ════════════════════════════════════════ */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 transition-all duration-200"
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
      </div>

      {/* ════════════════════════════════════════
          KPI CARDS
          ════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="rounded-2xl p-4 relative overflow-hidden group cursor-default transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
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
            </div>
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
          <div className="space-y-4 transition-all duration-200">
            {/* Performance Chart + Ad Format Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
              {/* Performance Line Chart (Pure SVG) */}
              <GlassCard className="lg:col-span-2" style={{ padding: 0 }}>
                <div className="flex items-center justify-between px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">Performance Over Time</h3>
                    <Info className="h-3.5 w-3.5" style={{ color: C.textDim }} />
                  </div>
                  <button className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium" style={{ borderColor: C.border, color: C.textSec }}>
                    Last 30 Days <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <div className="px-3 pb-4">
                  <SvgAreaChart
                    data={performanceData.length > 0 ? performanceData : [{ date: 'May 10', impressions: 0, clicks: 0, revenue: 0 }]}
                    seriesKeys={['impressions', 'clicks', 'revenue']}
                    seriesColors={['#3b82f6', '#22c55e', '#eab308']}
                    seriesNames={['Impressions', 'Clicks', 'Revenue']}
                    height={192}
                  />
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

              {/* Ad Format Distribution (Pure SVG Donut) */}
              <GlassCard>
                <h3 className="text-sm font-semibold text-white mb-2">Ad Format Distribution</h3>
                <div className="flex justify-center">
                  <SvgDonutChart data={adFormatData} size={180} innerR={55} outerR={80} />
                </div>
                <div className="space-y-2.5 mt-4">
                  {adFormatData.map(d => (
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

            {/* Ad Type Distribution (Pure SVG Bar Chart) */}
            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-2">Ad Type Distribution</h3>
              <SvgBarChart
                data={adTypeData}
                dataKey="count"
                nameKey="name"
                colorKey="color"
              />
            </GlassCard>
          </div>
      )}

      {/* ════════════════════════════════════════════════════
          UPLOAD TAB (REAL UPLOAD)
          ════════════════════════════════════════════════════ */}
      {activeTab === 'upload' && (
        <VideoUploadUI onClose={() => setActiveTab('ads-list')} />
      )}

      {/* ════════════════════════════════════════════════════
          ADS LIST TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'ads-list' && (
          <div className="space-y-4 transition-all duration-200">
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
                <table className="w-full min-w-[900px] text-[11px]">
                  <thead>
                    <tr className="border-b" style={{ borderColor: C.border }}>
                      {['Preview', 'Ad Name', 'Type', 'Placement', 'Duration', 'Status', 'Impressions', 'Clicks', 'Revenue', 'CTR', 'Actions'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAds.map(ad => (
                      <tr
                        key={ad.id}
                        className="border-b transition-colors hover:bg-white/[0.02]"
                        style={{ borderColor: C.border }}
                      >
                        <td className="px-3 py-2.5">
                          <div className="h-8 w-12 rounded-lg flex items-center justify-center" style={{ background: ad.type === 'Video' ? 'rgba(59,130,246,0.1)' : 'rgba(234,179,8,0.1)' }}>
                            {ad.type === 'Video' ? <FileVideo className="h-4 w-4" style={{ color: '#3b82f6' }} /> : <Image className="h-4 w-4" style={{ color: '#eab308' }} />}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{ad.name}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: ad.type === 'Video' ? 'rgba(59,130,246,0.12)' : ad.type === 'Image' ? 'rgba(234,179,8,0.12)' : 'rgba(168,85,247,0.12)', color: ad.type === 'Video' ? '#3b82f6' : ad.type === 'Image' ? '#eab308' : '#a855f7' }}>
                            {ad.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: C.textSec }}>{ad.placement}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap font-mono" style={{ color: C.textSec }}>{ad.duration}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{
                            background: ad.status === 'Active' ? C.successDim : ad.status === 'Paused' ? 'rgba(234,179,8,0.12)' : ad.status === 'Processing' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.06)',
                            color: ad.status === 'Active' ? C.success : ad.status === 'Paused' ? C.warning : ad.status === 'Processing' ? C.info : C.textDim,
                          }}>
                            {ad.status === 'Active' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                            {ad.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{fmtNum(ad.impressions)}</td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{fmtNum(ad.clicks)}</td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{fmtCurrency(ad.revenue)}</td>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{ad.ctr.toFixed(2)}%</td>
                        <td className="px-3 py-2.5">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-3 py-2.5 border-t" style={{ borderColor: C.border }}>
                <p className="text-[10px]" style={{ color: C.textDim }}>Showing {((currentPage - 1) * perPage) + 1}&ndash;{Math.min(currentPage * perPage, filteredAds.length)} of {filteredAds.length} ads</p>
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
                  {totalPages > 5 && <span className="text-[10px]" style={{ color: C.textDim }}>&hellip;</span>}
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
          </div>
      )}

      {/* ════════════════════════════════════════════════════
          TIMELINE TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'timeline' && (
          <div className="space-y-4 transition-all duration-200">
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
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
                    const totalSec = i * 600
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
                    <div
                      key={i}
                      className="absolute top-2 bottom-2 rounded-lg flex items-center px-2 overflow-hidden cursor-pointer group transition-all duration-200"
                      style={{
                        left: `${ad.start}%`,
                        width: `${ad.width}%`,
                        background: ad.type === 'video'
                          ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(59,130,246,0.15))'
                          : 'linear-gradient(135deg, rgba(229,9,20,0.3), rgba(229,9,20,0.15))',
                        border: `1px solid ${ad.type === 'video' ? 'rgba(59,130,246,0.3)' : 'rgba(229,9,20,0.3)'}`,
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {ad.type === 'video' ? <FileVideo className="h-3 w-3 flex-shrink-0" style={{ color: '#3b82f6' }} /> : <Image className="h-3 w-3 flex-shrink-0" style={{ color: '#E50914' }} />}
                        <span className="text-[9px] font-medium text-white truncate">{ad.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress marker */}
                <div className="relative mt-1">
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ background: C.accent, width: '35%' }}
                    />
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
                    style={{ background: C.accent, boxShadow: `0 0 10px ${C.accentGlow}`, left: '35%' }}
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
          </div>
      )}

      {/* ════════════════════════════════════════════════════
          SETTINGS TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
          <div className="space-y-4 transition-all duration-200">
            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-3">Ads Settings</h3>
              <div className="space-y-4">
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
                    <div
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200"
                      style={{ left: autoAds ? 22 : 2 }}
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
                    <div
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200"
                      style={{ left: smartPlayback ? 22 : 2 }}
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
          </div>
      )}

      {/* ════════════════════════════════════════════════════
          PRE-ROLL / MID-ROLL / POST-ROLL TABS
          ════════════════════════════════════════════════════ */}
      {(activeTab === 'pre-roll' || activeTab === 'mid-roll' || activeTab === 'post-roll') && (() => {
        const rollType = activeTab === 'pre-roll' ? 'Pre-roll' : activeTab === 'mid-roll' ? 'Mid-roll' : 'Post-roll'
        const rollColor = activeTab === 'pre-roll' ? C.info : activeTab === 'mid-roll' ? C.warning : C.purple
        const placementMap: Record<string, string> = { 'pre-roll': 'Pre-roll', 'mid-roll': 'Mid-roll', 'post-roll': 'Post-roll' }
        const filteredRollAds = ads.filter(a => a.placement === placementMap[activeTab])

        return (
          <div className="space-y-4 transition-all duration-200">
              {/* Header Card */}
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${rollColor}15` }}>
                      {activeTab === 'pre-roll' ? <Play className="h-5 w-5" style={{ color: rollColor }} /> : activeTab === 'mid-roll' ? <Film className="h-5 w-5" style={{ color: rollColor }} /> : <SkipForward className="h-5 w-5" style={{ color: rollColor }} />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{rollType} Ads</h3>
                      <p className="text-[11px]" style={{ color: C.textTer }}>
                        {activeTab === 'pre-roll' ? 'Ads displayed before video starts' : activeTab === 'mid-roll' ? 'Ads inserted during video playback' : 'Ads shown after video ends'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-110"
                    style={{ background: rollColor }}
                  >
                    <Plus className="h-4 w-4" /> Add {rollType} Ad
                  </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Total Ads', value: filteredRollAds.length, color: rollColor },
                    { label: 'Active', value: filteredRollAds.filter(a => a.status === 'Active').length, color: C.success },
                    { label: 'Total Impressions', value: fmtNum(filteredRollAds.reduce((s, a) => s + a.impressions, 0)), color: C.warning },
                    { label: 'Total Revenue', value: fmtCurrency(filteredRollAds.reduce((s, a) => s + a.revenue, 0)), color: C.accent },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                      <p className="text-[10px]" style={{ color: C.textDim }}>{s.label}</p>
                      <p className="text-base font-bold text-white mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Ads List */}
              {filteredRollAds.length > 0 ? (
                <GlassCard style={{ padding: 0 }}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-[11px]">
                      <thead>
                        <tr className="border-b" style={{ borderColor: C.border }}>
                          {['Ad Name', 'Status', 'Duration', 'Impressions', 'Clicks', 'Revenue', 'CTR', 'Actions'].map(h => (
                            <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRollAds.map(ad => (
                          <tr key={ad.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${rollColor}15` }}>
                                  <FileVideo className="h-4 w-4" style={{ color: rollColor }} />
                                </div>
                                <span className="font-medium text-white">{ad.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{
                                background: ad.status === 'Active' ? C.successDim : ad.status === 'Paused' ? 'rgba(234,179,8,0.12)' : 'rgba(255,255,255,0.06)',
                                color: ad.status === 'Active' ? C.success : ad.status === 'Paused' ? C.warning : C.textDim,
                              }}>
                                {ad.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono" style={{ color: C.textSec }}>{ad.duration}</td>
                            <td className="px-3 py-2.5 font-medium text-white">{fmtNum(ad.impressions)}</td>
                            <td className="px-3 py-2.5 font-medium text-white">{fmtNum(ad.clicks)}</td>
                            <td className="px-3 py-2.5 font-medium text-white">{fmtCurrency(ad.revenue)}</td>
                            <td className="px-3 py-2.5 font-medium text-white">{ad.ctr.toFixed(2)}%</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1">
                                <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }}><Edit3 className="h-3.5 w-3.5" /></button>
                                <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-500/10" style={{ color: C.accent }}><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="!py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: `${rollColor}10` }}>
                      {activeTab === 'pre-roll' ? <Play className="h-7 w-7" style={{ color: rollColor }} /> : activeTab === 'mid-roll' ? <Film className="h-7 w-7" style={{ color: rollColor }} /> : <SkipForward className="h-7 w-7" style={{ color: rollColor }} />}
                    </div>
                    <p className="text-sm font-medium text-white">No {rollType.toLowerCase()} ads yet</p>
                    <p className="text-[11px]" style={{ color: C.textTer }}>Add your first {rollType.toLowerCase()} ad to get started</p>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white mt-1 transition-all hover:brightness-110" style={{ background: rollColor }}>
                      <Plus className="h-4 w-4" /> Create {rollType} Ad
                    </button>
                  </div>
                </GlassCard>
              )}
            </div>
        )
      })()}

      {/* ════════════════════════════════════════════════════
          CREATE AD MODAL
          ════════════════════════════════════════════════════ */}
      {showCreateModal && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-200"
            onClick={() => setShowCreateModal(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div
              className="relative w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl"
              style={{
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <h3 className="text-lg font-bold text-white">Create New Ad</h3>
                <button onClick={() => setShowCreateModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: C.textTer }}>Ad Title</label>
                  <input 
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50" 
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }} 
                    placeholder="Enter ad title..." 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: C.textTer }}>Ad Type</label>
                    <select 
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-3 text-sm text-white focus:outline-none" 
                      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <option value="video">Video</option>
                      <option value="banner">Banner</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: C.textTer }}>Placement</label>
                    <select 
                      value={form.placement}
                      onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-3 text-sm text-white focus:outline-none" 
                      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <option value="pre-roll">Pre-Roll</option>
                      <option value="mid-roll">Mid-Roll</option>
                      <option value="post-roll">Post-Roll</option>
                      <option value="overlay">Overlay</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: C.textTer }}>Media URL</label>
                  <div className="flex gap-2">
                    <input 
                      value={form.mediaUrl}
                      onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))}
                      className="flex-1 rounded-xl border px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50" 
                      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }} 
                      placeholder="Enter direct URL or upload..." 
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border px-4 flex items-center justify-center transition-all hover:bg-white/5"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', color: C.textSec }}
                      title="Upload File"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Local Upload Status in Modal */}
                  {uploads.length > 0 && uploads[0].status === 'uploading' && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px]" style={{ color: C.textTer }}>
                        <span>Uploading...</span>
                        <span>{uploads[0].progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-red-500 transition-all" style={{ width: `${uploads[0].progress}%` }} />
                      </div>
                    </div>
                  )}
                  {uploads.length > 0 && uploads[0].status === 'complete' && (
                    <p className="mt-1 text-[10px] text-green-500 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Upload complete! URL set.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 justify-end pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="px-6 py-2.5 text-xs font-semibold rounded-xl border transition-all hover:bg-white/5" 
                  style={{ color: C.textSec, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateAd}
                  disabled={saving || !form.title}
                  className="px-8 py-2.5 text-xs font-bold rounded-xl text-white transition-all hover:brightness-110 disabled:opacity-50" 
                  style={{ background: C.accent, boxShadow: '0 4px 15px rgba(229,9,20,0.3)' }}
                >
                  {saving ? 'Creating...' : 'Create Ad'}
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  )
}
