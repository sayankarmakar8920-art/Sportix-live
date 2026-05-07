'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Eye, MousePointerClick, DollarSign, TrendingUp, Target,
  Download, Upload, CloudUpload, X, Search, Filter,
  ChevronDown, ChevronLeft, ChevronRight, Calendar, Plus, Image,
  Edit3, Trash2, MoreHorizontal, Info, Zap, Megaphone,
  BarChart3, ArrowUpRight, ArrowDownRight, Star, Copy,
  Rocket, FileText, Monitor, Smartphone, Layout, FolderOpen,
  Check, RefreshCw, type LucideIcon,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#0a0a0a',
  card: '#141414',
  border: 'rgba(255,255,255,0.07)',
  accent: '#E63946',
  accentDim: 'rgba(230,57,70,0.12)',
  accentGlow: 'rgba(230,57,70,0.35)',
  success: '#4CAF50',
  successDim: 'rgba(76,175,80,0.12)',
  warning: '#FF9800',
  info: '#2196F3',
  purple: '#9C27B0',
  teal: '#009688',
  text: '#ffffff',
  textSec: '#888888',
  textTer: '#666666',
  textDim: '#444444',
}

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface AdItem {
  id: string
  name: string
  type: 'Video' | 'Banner' | 'Image'
  placement: string
  status: 'Active' | 'Paused' | 'Draft'
  impressions: number
  clicks: number
  ctr: number
  revenue: number
  cpc: number
  thumbnail?: string
}

type PerfMetric = 'revenue' | 'impressions' | 'clicks' | 'ctr' | 'cpc'

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */
const MOCK_ADS: AdItem[] = [
  { id: '1', name: 'Summer Sale Video', type: 'Video', placement: 'Homepage', status: 'Active', impressions: 4500, clicks: 538, ctr: 11.96, revenue: 1319.10, cpc: 2.45 },
  { id: '2', name: 'Gaming Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 3800, clicks: 453, ctr: 11.92, revenue: 1109.85, cpc: 2.45 },
  { id: '3', name: 'Tech Promo Video', type: 'Video', placement: 'Sidebar', status: 'Active', impressions: 3200, clicks: 382, ctr: 11.94, revenue: 935.90, cpc: 2.45 },
  { id: '4', name: 'App Install Banner', type: 'Banner', placement: 'Footer', status: 'Paused', impressions: 2800, clicks: 334, ctr: 11.93, revenue: 818.30, cpc: 2.45 },
  { id: '5', name: 'New Collection Video', type: 'Video', placement: 'Homepage', status: 'Active', impressions: 2200, clicks: 263, ctr: 11.95, revenue: 644.35, cpc: 2.45 },
  { id: '6', name: 'Premium Plan Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 4100, clicks: 490, ctr: 11.95, revenue: 1200.50, cpc: 2.45 },
  { id: '7', name: 'Sports Highlight Video', type: 'Video', placement: 'Sidebar', status: 'Active', impressions: 2900, clicks: 346, ctr: 11.93, revenue: 847.70, cpc: 2.45 },
  { id: '8', name: 'Music Stream Ad', type: 'Image', placement: 'Footer', status: 'Draft', impressions: 1500, clicks: 179, ctr: 11.93, revenue: 438.55, cpc: 2.45 },
  { id: '9', name: 'Food Delivery Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 3600, clicks: 430, ctr: 11.94, revenue: 1053.50, cpc: 2.45 },
  { id: '10', name: 'Fitness App Video', type: 'Video', placement: 'Homepage', status: 'Paused', impressions: 1900, clicks: 227, ctr: 11.95, revenue: 556.15, cpc: 2.45 },
  { id: '11', name: 'Travel Deals Banner', type: 'Banner', placement: 'Sidebar', status: 'Active', impressions: 2700, clicks: 322, ctr: 11.93, revenue: 788.90, cpc: 2.45 },
  { id: '12', name: 'Education Promo Video', type: 'Video', placement: 'Homepage', status: 'Active', impressions: 3400, clicks: 406, ctr: 11.94, revenue: 994.70, cpc: 2.45 },
  { id: '13', name: 'Fashion Week Banner', type: 'Banner', placement: 'Footer', status: 'Active', impressions: 2100, clicks: 250, ctr: 11.90, revenue: 612.50, cpc: 2.45 },
  { id: '14', name: 'Auto Show Video', type: 'Video', placement: 'Sidebar', status: 'Active', impressions: 2600, clicks: 310, ctr: 11.92, revenue: 759.50, cpc: 2.45 },
  { id: '15', name: 'Gaming Console Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 3300, clicks: 394, ctr: 11.94, revenue: 965.30, cpc: 2.45 },
  { id: '16', name: 'Movie Premiere Video', type: 'Video', placement: 'Homepage', status: 'Paused', impressions: 1800, clicks: 215, ctr: 11.94, revenue: 526.75, cpc: 2.45 },
  { id: '17', name: 'Cloud Storage Banner', type: 'Banner', placement: 'Sidebar', status: 'Active', impressions: 2500, clicks: 298, ctr: 11.92, revenue: 730.10, cpc: 2.45 },
  { id: '18', name: 'Dating App Video', type: 'Video', placement: 'Footer', status: 'Active', impressions: 2000, clicks: 239, ctr: 11.95, revenue: 585.55, cpc: 2.45 },
  { id: '19', name: 'Insurance Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 3100, clicks: 370, ctr: 11.94, revenue: 906.50, cpc: 2.45 },
  { id: '20', name: 'Pet Care Video', type: 'Video', placement: 'Sidebar', status: 'Active', impressions: 1700, clicks: 203, ctr: 11.94, revenue: 497.35, cpc: 2.45 },
  { id: '21', name: 'Smart Home Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 2400, clicks: 286, ctr: 11.92, revenue: 700.70, cpc: 2.45 },
  { id: '22', name: 'Crypto Trading Video', type: 'Video', placement: 'Homepage', status: 'Active', impressions: 3000, clicks: 358, ctr: 11.93, revenue: 877.10, cpc: 2.45 },
  { id: '23', name: 'Job Portal Banner', type: 'Banner', placement: 'Footer', status: 'Paused', impressions: 1600, clicks: 191, ctr: 11.94, revenue: 467.95, cpc: 2.45 },
  { id: '24', name: 'Social Media Video', type: 'Video', placement: 'Sidebar', status: 'Active', impressions: 2300, clicks: 274, ctr: 11.91, revenue: 671.30, cpc: 2.45 },
  { id: '25', name: 'Real Estate Banner', type: 'Banner', placement: 'Homepage', status: 'Active', impressions: 2800, clicks: 334, ctr: 11.93, revenue: 818.30, cpc: 2.45 },
]

const PERF_DATA = Array.from({ length: 7 }, (_, i) => {
  const d = new Date('2026-05-03')
  d.setDate(d.getDate() + i)
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: [18.72, 22.45, 19.80, 26.68, 24.30, 21.15, 28.90][i],
    impressions: [3200, 3800, 3500, 4200, 3900, 3600, 4500][i],
    clicks: [380, 450, 420, 510, 470, 430, 538][i],
    ctr: [11.8, 11.8, 12.0, 12.1, 12.0, 11.9, 12.0][i],
    cpc: [2.48, 2.42, 2.50, 2.40, 2.45, 2.43, 2.38][i],
  }
})

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}
function fmtCur(n: number): string {
  return '$' + n.toFixed(2)
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [d, setD] = useState(0)
  useEffect(() => {
    const t0 = performance.now()
    const dur = 1000
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      setD(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  const f = d >= 100 ? fmtNum(Math.round(d)) : d.toFixed(2)
  return <span>{prefix}{f}{suffix}</span>
}

/* ═══════════════════════════════════════════════════════════════
   SPARKLINE
   ═══════════════════════════════════════════════════════════════ */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80
  const h = 28
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#spark-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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
   CHART TOOLTIP
   ═══════════════════════════════════════════════════════════════ */
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: ${p.value}</p>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function AdsManagerUI() {
  const [ads] = useState<AdItem[]>(MOCK_ADS)
  const [loading] = useState(false)
  const [search, setSearch] = useState('')
  const [perfMetric, setPerfMetric] = useState<PerfMetric>('revenue')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const perPage = 10

  // KPIs
  const totalRevenue = ads.reduce((s, a) => s + a.revenue, 0)
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0)
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0)
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgCPC = totalClicks > 0 ? totalRevenue / totalClicks : 0

  const kpis = [
    { label: 'Total Revenue', value: totalRevenue, prefix: '$', suffix: '', change: '+12.5%', positive: true, icon: DollarSign, color: C.accent, bg: 'rgba(230,57,70,0.12)', spark: [18, 22, 20, 28, 24, 30, 28] },
    { label: 'Impressions', value: totalImpressions, prefix: '', suffix: '', change: '+8.3%', positive: true, icon: Eye, color: C.purple, bg: 'rgba(156,39,176,0.12)', spark: [30, 35, 32, 40, 38, 42, 45] },
    { label: 'Clicks', value: totalClicks, prefix: '', suffix: '', change: '+14.3%', positive: true, icon: MousePointerClick, color: C.warning, bg: 'rgba(255,152,0,0.12)', spark: [12, 15, 14, 18, 16, 20, 22] },
    { label: 'CTR', value: avgCTR, prefix: '', suffix: '%', change: '+6.7%', positive: true, icon: Target, color: '#E91E63', bg: 'rgba(233,30,99,0.12)', spark: [5, 6, 5.5, 7, 6.5, 7.5, 7] },
    { label: 'Avg. CPC', value: avgCPC, prefix: '$', suffix: '', change: '-4.2%', positive: false, icon: DollarSign, color: '#FFC107', bg: 'rgba(255,193,7,0.12)', spark: [2.6, 2.5, 2.55, 2.4, 2.48, 2.42, 2.38] },
  ]

  // Top ads
  const topAds = useMemo(() => [...ads].filter(a => a.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5), [ads])

  // Budget
  const budget = 10000
  const spent = 7500
  const budgetPct = (spent / budget) * 100

  // Filtered & paged
  const filtered = useMemo(() => {
    if (!search) return ads
    return ads.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
  }, [ads, search])
  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Chart data
  const metricKey = perfMetric
  const metricColor = perfMetric === 'revenue' ? C.accent : perfMetric === 'impressions' ? C.purple : perfMetric === 'clicks' ? C.warning : perfMetric === 'ctr' ? '#E91E63' : '#FFC107'

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-red-500" /></div>
  }

  return (
    <div className="space-y-5 min-w-0">
      {/* ═══ HEADER ═══ */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${C.accent}15` }}>
            <Megaphone className="h-5 w-5" style={{ color: C.accent }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AdManager</h1>
            <p className="text-xs" style={{ color: C.textSec }}>Track, manage and optimize your ad campaigns</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]" style={{ borderColor: C.border, color: C.textSec }}>
            <Calendar className="h-3.5 w-3.5" /> May 3, 2026 - May 9, 2026 <ChevronDown className="h-3 w-3" />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-110" style={{ background: C.accent, boxShadow: `0 4px 20px ${C.accentGlow}` }}>
            <Plus className="h-4 w-4" /> Create New Ad
          </button>
        </div>
      </motion.div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-4 relative overflow-hidden cursor-default"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-15 blur-2xl" style={{ background: kpi.color }} />
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                </div>
                <Sparkline data={kpi.spark} color={kpi.color} />
              </div>
              <p className="text-lg font-bold text-white leading-tight"><AnimatedCounter value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} /></p>
              <p className="text-[10px] mt-0.5" style={{ color: C.textTer }}>{kpi.label}</p>
              <div className="flex items-center gap-0.5 mt-1">
                {kpi.positive ? <ArrowUpRight className="h-3 w-3" style={{ color: C.success }} /> : <ArrowDownRight className="h-3 w-3" style={{ color: C.accent }} />}
                <span className="text-[9px] font-semibold" style={{ color: kpi.positive ? C.success : C.accent }}>{kpi.change} vs last 7 days</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Overview - spans 2 cols */}
        <GlassCard className="lg:col-span-2" style={{ padding: 0 }}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Performance Overview</h3>
              <span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold" style={{ background: `${C.accent}20`, color: C.accent }}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> Live
              </span>
            </div>
          </div>
          {/* Metric Tabs */}
          <div className="flex items-center gap-1 px-5 pb-3">
            {(['revenue', 'impressions', 'clicks', 'ctr', 'cpc'] as const).map(m => (
              <button key={m} onClick={() => setPerfMetric(m)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-medium capitalize transition-all"
                style={{ background: perfMetric === m ? `${C.accent}18` : 'transparent', color: perfMetric === m ? C.accent : C.textTer, border: `1px solid ${perfMetric === m ? 'rgba(230,57,70,0.25)' : 'transparent'}` }}>
                {m}
              </button>
            ))}
          </div>
          <div className="px-3 pb-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERF_DATA} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={metricColor} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={metricColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey={metricKey} stroke={metricColor} fill="url(#perfGrad)" strokeWidth={2.5} name={metricKey.charAt(0).toUpperCase() + metricKey.slice(1)} dot={{ fill: metricColor, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: metricColor, stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Campaign Budget */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-4">Campaign Budget</h3>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={[{ value: spent }, { value: budget - spent }]} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" stroke="none" startAngle={90}>
                      <Cell fill={C.accent} />
                      <Cell fill="rgba(255,255,255,0.06)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold text-white">{Math.round(budgetPct)}%</span>
                  <span className="text-[9px]" style={{ color: C.textDim }}>of ${budget.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: C.textTer }}>Spent</span>
                <span className="text-xs font-bold" style={{ color: C.accent }}>${spent.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: C.textTer }}>Remaining</span>
                <span className="text-xs font-bold text-white">${(budget - spent).toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${budgetPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${C.accent}, #ff6b6b)` }} />
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Create New Ad', desc: 'Launch a new ad campaign', icon: Plus, color: C.accent, bg: 'rgba(230,57,70,0.1)' },
                { label: 'Duplicate Ad', desc: 'Copy of existing ad', icon: Copy, color: C.purple, bg: 'rgba(156,39,176,0.1)' },
                { label: 'Edit Ad', desc: 'Make changes to your ad', icon: Edit3, color: C.warning, bg: 'rgba(255,152,0,0.1)' },
                { label: 'View Reports', desc: 'Detailed performance analytics', icon: FileText, color: C.info, bg: 'rgba(33,150,243,0.1)' },
              ].map(a => {
                const Icon = a.icon
                return (
                  <button key={a.label} className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all hover:bg-white/[0.04]"
                    style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: a.bg }}>
                      <Icon className="h-4 w-4" style={{ color: a.color }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-white">{a.label}</p>
                      <p className="text-[8px]" style={{ color: C.textDim }}>{a.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </GlassCard>

          {/* Recommendations */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Recommendations</h3>
              <button className="text-[10px] font-medium" style={{ color: C.accent }}>View All</button>
            </div>
            <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}15` }}>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${C.accent}15` }}>
                <Rocket className="h-4 w-4" style={{ color: C.accent }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white">Increase budget for top ads</p>
                <p className="text-[10px] mt-0.5" style={{ color: C.textTer }}>Top performing ads are getting more engagement.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ═══ TOP PERFORMING ADS ═══ */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Top Performing Ads</h3>
          <button className="text-[10px] font-medium" style={{ color: C.accent }}>View All</button>
        </div>
        <div className="space-y-2.5">
          {topAds.map((ad, i) => (
            <motion.div key={ad.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-white/[0.02]"
              style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: i === 0 ? 'rgba(234,179,8,0.12)' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#eab308' : C.textDim }}>
                {i + 1}
              </span>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: ad.type === 'Video' ? `${C.accent}15` : `${C.info}15` }}>
                {ad.type === 'Video' ? <Zap className="h-4 w-4" style={{ color: C.accent }} /> : <Image className="h-4 w-4" style={{ color: C.info }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{ad.name}</p>
                <p className="text-[10px]" style={{ color: C.textTer }}>{ad.type} • {ad.placement}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold" style={{ color: C.accent }}>${ad.revenue.toFixed(2)}</p>
                <p className="text-[10px]" style={{ color: C.textTer }}>{ad.clicks} clicks</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* ═══ ALL ADS TABLE ═══ */}
      <GlassCard style={{ padding: 0 }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">All Ads</h3>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: `${C.accent}15`, color: C.accent }}>{ads.length} Total</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium" style={{ borderColor: C.border, color: C.textSec }}>
              Columns <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium" style={{ borderColor: C.border, color: C.textSec }}>
              Export <Download className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
            <Search className="h-4 w-4" style={{ color: C.textDim }} />
            <input type="text" placeholder="Search ads..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/15 focus:outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['AD INFO', 'TYPE / SLOT', 'STATUS', 'IMPRESSIONS', 'CLICKS', 'CTR', 'REVENUE', 'ACTIONS'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider" style={{ color: C.textTer }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((ad, i) => (
                <motion.tr key={ad.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-t transition-colors hover:bg-white/[0.015]" style={{ borderColor: C.border }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-14 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: ad.type === 'Video' ? `${C.accent}12` : ad.type === 'Banner' ? `${C.info}12` : 'rgba(156,39,176,0.1)' }}>
                        {ad.type === 'Video' ? <Zap className="h-4 w-4" style={{ color: C.accent }} /> : ad.type === 'Banner' ? <Layout className="h-4 w-4" style={{ color: C.info }} /> : <Image className="h-4 w-4" style={{ color: C.purple }} />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{ad.name}</p>
                        <p className="text-[9px] font-mono" style={{ color: C.textDim }}>#{ad.id.padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: ad.type === 'Video' ? 'rgba(230,57,70,0.1)' : ad.type === 'Banner' ? 'rgba(33,150,243,0.1)' : 'rgba(156,39,176,0.1)', color: ad.type === 'Video' ? C.accent : ad.type === 'Banner' ? C.info : C.purple }}>
                      {ad.type}
                    </span>
                    <p className="text-[9px] mt-1" style={{ color: C.textDim }}>{ad.placement}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{
                      background: ad.status === 'Active' ? C.successDim : ad.status === 'Paused' ? 'rgba(255,152,0,0.12)' : 'rgba(255,255,255,0.05)',
                      color: ad.status === 'Active' ? C.success : ad.status === 'Paused' ? C.warning : C.textDim,
                    }}>
                      {ad.status === 'Active' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-white">{fmtNum(ad.impressions)}</td>
                  <td className="px-5 py-3 font-medium text-white">{fmtNum(ad.clicks)}</td>
                  <td className="px-5 py-3 font-semibold" style={{ color: C.success }}>{ad.ctr.toFixed(2)}%</td>
                  <td className="px-5 py-3 font-bold" style={{ color: C.accent }}>${ad.revenue.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-0.5">
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }} title="View"><Eye className="h-3.5 w-3.5" /></button>
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }} title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }} title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-500/10" style={{ color: C.accent }} title="More"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
          <p className="text-[10px]" style={{ color: C.textDim }}>Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} results</p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] disabled:opacity-30" style={{ color: C.textSec, border: `1px solid ${C.border}` }}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all"
                style={{ background: currentPage === i + 1 ? C.accent : 'transparent', color: currentPage === i + 1 ? '#fff' : C.textTer }}>
                {i + 1}
              </button>
            ))}
            {totalPages > 5 && <span className="text-[10px]" style={{ color: C.textDim }}>…</span>}
            {totalPages > 5 && (
              <button onClick={() => setCurrentPage(totalPages)} className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all"
                style={{ background: currentPage === totalPages ? C.accent : 'transparent', color: currentPage === totalPages ? '#fff' : C.textTer }}>
                {totalPages}
              </button>
            )}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] disabled:opacity-30" style={{ color: C.textSec, border: `1px solid ${C.border}` }}>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <select className="ml-2 rounded-lg border px-2 py-1 text-[10px] text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}>
              <option>10 / page</option>
              <option>25 / page</option>
              <option>50 / page</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* ═══ CREATE MODAL ═══ */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl p-6 space-y-5" style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Create New Ad</h3>
                <button onClick={() => setShowCreateModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }}><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Ad Name</label><input className="w-full rounded-xl border px-3.5 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }} placeholder="Enter ad name..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Type</label><select className="w-full rounded-xl border px-3.5 py-2.5 text-sm text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}><option>Video</option><option>Banner</option><option>Image</option></select></div>
                  <div><label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Placement</label><select className="w-full rounded-xl border px-3.5 py-2.5 text-sm text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}><option>Homepage</option><option>Sidebar</option><option>Footer</option></select></div>
                </div>
                <div><label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textTer }}>Ad File</label>
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-red-500/40" style={{ borderColor: C.borderLight }}>
                    <CloudUpload className="h-6 w-6" style={{ color: C.accent }} /><p className="text-xs" style={{ color: C.textTer }}>Click to upload</p><p className="text-[10px]" style={{ color: C.textDim }}>MP4, MOV, JPG, PNG (max 10MB)</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end pt-2">
                <button onClick={() => setShowCreateModal(false)} className="rounded-xl px-4 py-2.5 text-xs font-medium hover:bg-white/[0.04]" style={{ color: C.textSec, border: `1px solid ${C.border}` }}>Cancel</button>
                <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white hover:brightness-110" style={{ background: C.accent }}><Plus className="h-4 w-4" /> Create Ad</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
