'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { io as socketIo } from 'socket.io-client'
import { uploadFile, getUploadStatusMessage, type UploadProgress } from '@/lib/upload-utils'
import {
  LayoutDashboard,
  Activity,
  Users,
  Radio,
  Video,
  AlertTriangle,
  FolderOpen,
  CalendarClock,
  MessageSquare,
  BarChart3,
  TrendingUp,
  DollarSign,
  Settings,
  ClipboardList,
  Bell,
  ShieldCheck,
  Menu,
  X,
  Clock,
  LogOut,
  Eye,
  Search,
  Upload,
  Trash2,
  Copy,
  Check,
  Server,
  Cpu,
  HardDrive,
  ChevronRight,
  SlidersHorizontal,
  ImageIcon,
  FileText,
  Calendar,
  Play,
  Pause,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Monitor,
  Wifi,
  Target,
  Download,
  Zap,
  Globe,
  Camera,
  Mic,
  ChevronDown,
  ChevronUp,
  Info,
  Timer,
  CloudUpload,
  Square,
  Film,
  Megaphone,
  CheckCircle,
  XCircle,
  Plus,
  Heart,
  Share2,
  Bookmark,
  MousePointer,
  Smartphone,
  Tablet,
  Pencil,
  LayoutGrid,
  List,
  Link2,
  Shield,
  GripVertical,
  ImageIcon as ImageIconLucide,
} from 'lucide-react'

const AdsManagerUI = lazy(() => import('./AdsManagerUI').catch(() => ({ default: () => <AdsManagerFallback /> })))
const OnlineUsersPage = lazy(() => import('./OnlineUsersPage'))
const DashboardPage = lazy(() => import('./DashboardPage'))
const VideosPage = lazy(() => import('./VideosPage'))
const VideoAdsManager = lazy(() => import('./VideoAdsManager'))
const CategoriesPage = lazy(() => import('./CategoriesPage'))
const MatchSchedule = lazy(() => import('./MatchSchedule'))
const ReplaysPage = lazy(() => import('./ReplaysPage'))
const ReportsPage = lazy(() => import('./ReportsPage'))
const HeroFooterAdsManager = lazy(() => import('./HeroFooterAdsManager'))
const VideoAdsAnalyticsPage = lazy(() => import('./VideoAdsAnalyticsPage'))
import { Suspense } from 'react'
import AdminAnalytics from './AdminAnalytics'
import VideoUploadUI from './VideoUploadUI'

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */

const C = {
  bg: '#141414',
  sidebar: '#181818',
  card: '#1a1a1a',
  cardHover: '#222222',
  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(255,255,255,0.12)',
  accent: '#E50914',
  accentDim: 'rgba(229,9,20,0.15)',
  accentGlow: 'rgba(229,9,20,0.30)',
  success: '#46d369',
  warning: '#f5c518',
  info: '#0071eb',
  purple: '#9b59b6',
  text: '#ffffff',
  textSec: '#b3b3b3',
  textTer: '#808080',
  textDim: '#555555',
}

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type AdminPage =
  | 'dashboard'
  | 'live-control'
  | 'live-monitor'
  | 'users'
  | 'videos'
  | 'highlights'
  | 'reports'
  | 'categories'
  | 'schedules'
  | 'comments'
  | 'banners'
  | 'analytics'
  | 'engagement'
  | 'revenue'
  | 'settings'
  | 'activity-logs'
  | 'notifications'
  | 'admins'
  | 'replays'
  | 'ads-manager'
  | 'create-ad'
  | 'hero-ads'
  | 'video-ads'
  | 'video-ads-analytics'
  | 'rtmp-config'

interface MenuSection {
  label: string | null
  items: { id: AdminPage; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; badge?: string }[]
}

const menuSections: MenuSection[] = [
  { label: null, items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-control', label: 'Live Control', icon: Radio, badge: 'LIVE' },
  ] },
  {
    label: 'MONITORING',
    items: [
      { id: 'live-monitor', label: 'Live Monitor', icon: Activity },
      { id: 'users', label: 'Online Users', icon: Users, badge: 'TRACK' },
      { id: 'videos', label: 'Videos', icon: Video },
      { id: 'highlights', label: 'Video Upload', icon: Zap },
      { id: 'reports', label: 'Reports', icon: FileText, badge: '12' },
      { id: 'replays', label: 'Replays', icon: Film, badge: 'VOD' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { id: 'categories', label: 'Categories', icon: FolderOpen },
      { id: 'schedules', label: 'Schedules', icon: CalendarClock },
      { id: 'comments', label: 'Comments', icon: MessageSquare },
      { id: 'banners', label: 'Banners', icon: ImageIcon },
      { id: 'ads-manager', label: 'Ads Manager', icon: Megaphone, badge: 'AD' },
      { id: 'video-ads', label: 'Video Ads', icon: Film, badge: 'NEW' },
      { id: 'create-ad', label: 'Create Ad', icon: Plus },
      { id: 'hero-ads', label: 'Hero/Footer Ads', icon: Film, badge: 'NEW' },
      { id: 'video-ads-analytics', label: 'Video Ads Analytics', icon: BarChart3, badge: 'NEW' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'engagement', label: 'Engagement', icon: TrendingUp },
      { id: 'revenue', label: 'Revenue', icon: DollarSign },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'activity-logs', label: 'Activity Logs', icon: ClipboardList },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'admins', label: 'Admins', icon: ShieldCheck },
      { id: 'rtmp-config', label: 'RTMP Config', icon: Radio, badge: 'RTMP' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Card({ children, className = '', style, ...props }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; [key: string]: any }) {
  return (
    <div className={`rounded-2xl border p-3 sm:p-4 transition-all duration-200 ${className}`} style={{ background: C.card, borderColor: C.border, ...style }} {...props}>
      {children}
    </div>
  )
}

function CardHeader({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      {children}
    </div>
  )
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div className="flex h-8 items-end gap-[2px]">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ height: `${(v / max) * 100}%`, background: `${color}40` }} />
      ))}
    </div>
  )
}

function StatusBadge({ text, color }: { text: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: `${color}15`, color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {text}
    </span>
  )
}

/* DashboardPage component is in ./DashboardPage.tsx */

/* ── Ads Manager Fallback (lazy load with error recovery) ── */
function AdsManagerFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 fade-in-up">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E50914]/20 border-t-[#E50914]" />
      <p className="text-xs mt-3" style={{ color: C.textTer }}>Loading Ads Manager...</p>
    </div>
  )
}

function AdsManagerWrapper() {
  return (
    <Suspense fallback={<AdsManagerFallback />}>
      <AdsManagerUI />
    </Suspense>
  )
}

/* ═══════════════════════════════════════════════════════════════
   GENERIC PAGE (for all other menu items)
   ═══════════════════════════════════════════════════════════════ */

function GenericPage({ title, subtitle, icon, accent }: { title: string; subtitle: string; icon: React.ReactNode; accent?: string }) {
  const color = accent || C.accent

  const sampleData = Array.from({ length: 8 }, (_, i) => ({
    id: `#${1000 + i}`,
    title: `${title} Item ${i + 1}`,
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'inactive',
    date: `${i + 1} hours ago`,
    views: Math.floor(Math.random() * 50000),
  }))

  return (
    <div className="space-y-4 fade-in-up">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}15` }}>
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs" style={{ color: C.textTer }}>{subtitle}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
            <Search className="h-4 w-4" style={{ color: C.textDim }} />
            <input type="text" placeholder={`Search ${title.toLowerCase()}...`} className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}>
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
          <button className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90" style={{ background: color }}>
            <Upload className="h-3.5 w-3.5" /> Add New
          </button>
        </div>
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['ID', 'Title', 'Status', 'Views', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.map((item) => (
                <tr key={item.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-5 py-3 text-[11px] font-mono" style={{ color: C.textTer }}>{item.id}</td>
                  <td className="px-5 py-3 text-[12px] font-medium text-white">{item.title}</td>
                  <td className="px-5 py-3">
                    <StatusBadge text={item.status} color={item.status === 'active' ? C.success : item.status === 'pending' ? C.warning : C.textTer} />
                  </td>
                  <td className="px-5 py-3 text-[12px]" style={{ color: C.textSec }}>{fmt(item.views)}</td>
                  <td className="px-5 py-3 text-[11px]" style={{ color: C.textTer }}>{item.date}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Eye className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Copy className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.accent }}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
          <span className="text-[11px]" style={{ color: C.textTer }}>Showing 1-8 of 248 results</span>
          <div className="flex items-center gap-1">
            <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/[0.04]" style={{ color: C.textTer }}>Previous</button>
            {[1, 2, 3, '...', 31].map((p, i) => (
              <button key={i} className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-medium transition-colors" style={{ background: p === 1 ? C.accent : 'transparent', color: p === 1 ? '#fff' : C.textTer }}>
                {p}
              </button>
            ))}
            <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/[0.04]" style={{ color: C.textTer }}>Next</button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LIVE MONITOR PAGE
   ═══════════════════════════════════════════════════════════════ */

function LiveMonitorPage() {
  const liveStreams = [
    { id: 1, title: 'India vs Australia - 3rd T20I', viewers: '24.5K', peak: '31.2K', duration: '2h 15m', health: 'Excellent', category: 'Cricket' },
    { id: 2, title: 'Arsenal vs Chelsea - EPL', viewers: '18.3K', peak: '22.1K', duration: '1h 45m', health: 'Good', category: 'Football' },
    { id: 3, title: 'Lakers vs Celtics - NBA', viewers: '12.8K', peak: '15.6K', duration: '0h 55m', health: 'Excellent', category: 'Basketball' },
    { id: 4, title: 'F1 Monaco Grand Prix', viewers: '9.2K', peak: '11.4K', duration: '3h 10m', health: 'Good', category: 'Racing' },
  ]

  return (
    <div className="space-y-4 fade-in-up">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.accent}15` }}>
          <Activity className="h-5 w-5" style={{ color: C.accent }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Live Monitor</h2>
            <span className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: C.accent }}>
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          </div>
          <p className="text-xs" style={{ color: C.textTer }}>{liveStreams.length} active streams</p>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Active Streams', value: String(liveStreams.length), icon: Radio, color: C.accent },
          { label: 'Total Viewers', value: '64.8K', icon: Eye, color: C.success },
          { label: 'Peak Today', value: '31.2K', icon: TrendingUp, color: C.warning },
          { label: 'Avg Health', value: '96%', icon: Activity, color: C.info },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{s.label}</span>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Live Streams Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <h3 className="text-sm font-semibold text-white">Active Streams</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium border transition-colors hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}>
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Stream', 'Category', 'Viewers', 'Peak', 'Duration', 'Health', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveStreams.map((s) => (
                <tr key={s.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[12px] font-medium text-white">{s.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[11px]" style={{ color: C.textSec }}>{s.category}</td>
                  <td className="px-5 py-3 text-[12px] font-semibold" style={{ color: C.success }}>{s.viewers}</td>
                  <td className="px-5 py-3 text-[12px]" style={{ color: C.textSec }}>{s.peak}</td>
                  <td className="px-5 py-3 text-[11px] font-mono" style={{ color: C.textTer }}>{s.duration}</td>
                  <td className="px-5 py-3"><StatusBadge text={s.health} color={s.health === 'Excellent' ? C.success : C.warning} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg px-2.5 py-1 text-[10px] font-medium border transition-colors hover:bg-white/[0.04]" style={{ borderColor: `${C.accent}30`, color: C.accent }}>End</button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PAGE HEADER SHARED COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function PageHeader({ title, subtitle, icon, extra }: { title: string; subtitle: string; icon: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.accent}15` }}>
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs" style={{ color: C.textTer }}>{subtitle}</p>
        </div>
      </div>
      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </div>
  )
}

function MetricCard({ label, value, change, positive, icon: Icon, color, sparkline }: { label: string; value: string; change: string; positive?: boolean; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; sparkline?: number[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: C.textTer }}>{label}</span>
        {Icon && <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color}15` }}><Icon className="h-4 w-4" style={{ color }} /></div>}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] font-medium" style={{ color: positive !== false ? C.success : C.accent }}>
          {positive !== false ? <ArrowUpRight className="inline h-3 w-3 mr-0.5" /> : <ArrowDownRight className="inline h-3 w-3 mr-0.5" />}
          {change}
        </span>
        {sparkline && <MiniSparkline data={sparkline} color={color} />}
      </div>
    </Card>
  )
}

function DonutChart({ segments, size = 140, strokeWidth = 18, center }: { segments: { value: number; color: string; label: string; pct: string }[]; size?: number; strokeWidth?: number; center?: string }) {
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
          {segments.map((s, i) => {
            const len = (s.value / total) * circ
            const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={strokeWidth} strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offsets[i]} strokeLinecap="round" />
            return el
          })}
        </svg>
        {center && <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-white">{center}</span></div>}
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-[10px]" style={{ color: C.textSec }}>{s.label} <span className="font-semibold text-white">{s.pct}</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LineChart({ data, color, height = 200, labels }: { data: number[]; color: string; height?: number; labels?: string[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 100
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 20) - 10}`)
  const areaPoints = `0,${height} ${points.join(' ')} ${w},${height}`
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
        <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * w} cy={height - ((v - min) / range) * (height - 20) - 10} r="2" fill={color} />
        ))}
      </svg>
      {labels && (
        <div className="flex justify-between mt-2">
          {labels.map((l, i) => <span key={i} className="text-[9px]" style={{ color: C.textDim }}>{l}</span>)}
        </div>
      )}
    </div>
  )
}

function BarChart({ data, color, labels, height = 180 }: { data: number[]; color: string; labels?: string[]; height?: number }) {
  const max = Math.max(...data)
  return (
    <div className="flex h-[200px] items-end gap-2">
      {data.map((v, i) => {
        const h = (v / max) * (height || 180)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative group cursor-pointer">
              <div className="w-full rounded-t-md transition-all duration-300 hover:opacity-80" style={{ height: `${h}%`, background: `linear-gradient(180deg, ${color}90, ${color}20)`, minHeight: 6 }} />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block rounded px-1.5 py-0.5 text-[9px] font-semibold text-white whitespace-nowrap" style={{ background: C.sidebar }}>{typeof v === 'number' && v > 1000 ? `${(v / 1000).toFixed(1)}K` : v}</div>
            </div>
            {labels && <span className="text-[9px]" style={{ color: C.textDim }}>{labels[i]}</span>}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS PAGE (Ad Performance Overview - Screenshot 4)
   ═══════════════════════════════════════════════════════════════ */

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('Revenue')
  const perfData = [320000, 410000, 380000, 520000, 460000, 580000, 490000]
  const convData = [1200, 1800, 1500, 2800, 2200, 3800, 2600]
  const tabs = ['Revenue', 'Impressions', 'Clicks', 'CTR', 'CPC']

  const campaigns = [
    { name: 'Summer Sale', revenue: '₹8.52M', impressions: '4.2M', clicks: '3.8L', ctr: '9.0%', conv: '45.2K', cost: '₹18.72', roas: '4.5x' },
    { name: 'Gaming Promo', revenue: '₹6.23M', impressions: '3.1M', clicks: '2.6L', ctr: '8.4%', conv: '32.1K', cost: '₹19.41', roas: '3.2x' },
    { name: 'Tech Launch', revenue: '₹4.75M', impressions: '2.8M', clicks: '2.1L', ctr: '7.5%', conv: '24.5K', cost: '₹19.39', roas: '2.8x' },
    { name: 'App Install', revenue: '₹3.92M', impressions: '2.4M', clicks: '1.9L', ctr: '7.9%', conv: '18.3K', cost: '₹21.42', roas: '2.1x' },
    { name: 'Brand Aware', revenue: '₹3.26M', impressions: '1.9M', clicks: '1.4L', ctr: '7.4%', conv: '12.8K', cost: '₹25.47', roas: '1.5x' },
  ]

  const demographics = [
    { age: '18-24', pct: 18.2, color: C.purple },
    { age: '25-34', pct: 37.5, color: C.accent },
    { age: '35-44', pct: 24.3, color: C.info },
    { age: '45-54', pct: 14.6, color: C.warning },
    { age: '55+', pct: 5.4, color: C.success },
  ]

  return (
    <div className="space-y-4 fade-in-up">
      <PageHeader title="Ad Performance Overview" subtitle="Get insights into your advertising performance" icon={<BarChart3 className="h-5 w-5" style={{ color: C.accent }} />} extra={
        <>
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}><Filter className="h-3.5 w-3.5" /> Filter</button>
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}><RefreshCw className="h-3.5 w-3.5" /> Export</button>
        </>
      } />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Revenue" value="₹26.68M" change="+12.5%" icon={DollarSign} color={C.accent} sparkline={[28, 32, 30, 38, 36, 42, 40]} />
        <MetricCard label="Impressions" value="24.58L" change="+8.3%" icon={Eye} color={C.purple} sparkline={[18, 22, 20, 26, 24, 30, 28]} />
        <MetricCard label="Clicks" value="7.35L" change="+14.3%" icon={TrendingUp} color={C.info} sparkline={[12, 16, 14, 20, 18, 24, 22]} />
        <MetricCard label="CTR" value="6.78%" change="+6.7%" icon={Activity} color="#e6a817" sparkline={[5, 6, 5.5, 7, 6.5, 7.5, 6.8]} />
        <MetricCard label="Conversions" value="2.45L" change="+10.2%" icon={CheckCircle} color={C.success} sparkline={[8, 10, 9, 14, 12, 16, 14]} />
        <MetricCard label="CPR" value="₹18.72" change="-4.2%" positive={false} icon={ArrowDownRight} color={C.warning} sparkline={[22, 20, 21, 19, 18, 17, 18.7]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader title="Performance Trend">
            <div className="flex items-center gap-1">
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)} className="px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all" style={{ background: activeTab === t ? C.accent : 'transparent', color: activeTab === t ? '#fff' : C.textTer }}>{t}</button>
              ))}
            </div>
          </CardHeader>
          <div className="relative">
            <LineChart data={perfData} color={C.accent} height={200} labels={['May 3', 'May 4', 'May 5', 'May 6', 'May 7', 'May 8', 'May 9']} />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-lg px-2.5 py-1.5 flex items-center gap-2" style={{ background: C.sidebar, border: `1px solid ${C.border}` }}>
              <span className="h-2 w-2 rounded-full" style={{ background: C.accent }} />
              <span className="text-[10px] font-semibold text-white">₹18.72L</span>
              <span className="text-[9px]" style={{ color: C.textTer }}>May 6, 2026</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Conversions Over Time" />
          <BarChart data={convData} color={C.accent} labels={['May 3', 'May 4', 'May 5', 'May 6', 'May 7', 'May 8', 'May 9']} height={180} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader title="Device Performance"><button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button></CardHeader>
          <DonutChart segments={[
            { value: 59.6, color: C.accent, label: 'Mobile', pct: '59.6%' },
            { value: 28.4, color: C.purple, label: 'Desktop', pct: '28.4%' },
            { value: 8.7, color: C.info, label: 'Tablet', pct: '8.7%' },
            { value: 3.3, color: C.warning, label: 'Others', pct: '3.3%' },
          ]} size={160} center="100%" />
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Top Campaigns by Performance"><button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead><tr className="border-b" style={{ borderColor: C.border }}>
                {['Campaign', 'Revenue', 'Impressions', 'Clicks', 'CTR', 'Conv.', 'Cost/Conv.', 'ROAS'].map(h => <th key={h} className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>)}
              </tr></thead>
              <tbody>{campaigns.map((c, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="py-2.5 text-[12px] font-medium text-white">{c.name}</td>
                  <td className="py-2.5 text-[12px] font-semibold" style={{ color: C.success }}>{c.revenue}</td>
                  <td className="py-2.5 text-[11px]" style={{ color: C.textSec }}>{c.impressions}</td>
                  <td className="py-2.5 text-[11px]" style={{ color: C.textSec }}>{c.clicks}</td>
                  <td className="py-2.5 text-[11px] font-semibold" style={{ color: C.accent }}>{c.ctr}</td>
                  <td className="py-2.5 text-[11px]">{c.conv}</td>
                  <td className="py-2.5 text-[11px]">{c.cost}</td>
                  <td className="py-2.5"><StatusBadge text={c.roas} color={parseFloat(c.roas) >= 3 ? C.success : parseFloat(c.roas) >= 2 ? C.warning : C.accent} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader title="Audience Demographics" />
          <div className="space-y-3 mb-5">
            {demographics.map(d => (
              <div key={d.age}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px]" style={{ color: C.textTer }}>{d.age} Years</span>
                  <span className="text-[11px] font-semibold text-white">{d.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Gender Distribution" />
          <div className="flex items-center justify-center gap-8">
            <DonutChart segments={[
              { value: 64.3, color: C.accent, label: 'Male', pct: '64.3%' },
              { value: 35.7, color: C.purple, label: 'Female', pct: '35.7%' },
            ]} size={140} center="64.3%" />
            <div className="space-y-3">
              <div className="rounded-xl p-3 border" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textDim }}>Top Locations</p>
                {['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'London, UK', 'New York, US'].map((loc, i) => (
                  <div key={i} className="flex items-center justify-between py-1"><span className="text-[11px]" style={{ color: C.textSec }}>{loc}</span><span className="text-[10px]" style={{ color: C.textDim }}>{[32, 24, 18, 12, 8][i]}%</span></div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ENGAGEMENT PAGE (Screenshot 3)
   ═══════════════════════════════════════════════════════════════ */

function EngagementPage() {
  const engData = [180000, 220000, 195000, 280000, 240000, 310000, 265000]
  const likeData = [85000, 105000, 92000, 130000, 115000, 150000, 128000]
  const shareData = [12000, 15000, 13000, 18000, 16000, 21000, 18000]

  const platformSegments = [
    { value: 35.6, color: '#FF0000', label: 'YouTube', pct: '35.6%' },
    { value: 24.8, color: '#E1306C', label: 'Instagram', pct: '24.8%' },
    { value: 20.1, color: '#1877F2', label: 'Facebook', pct: '20.1%' },
    { value: 12.4, color: '#000000', label: 'TikTok', pct: '12.4%' },
    { value: 7.1, color: C.textDim, label: 'Others', pct: '7.1%' },
  ]

  const audienceData = [
    { age: '18-24', pct: 30.8, color: C.accent },
    { age: '25-34', pct: 37.1, color: C.purple },
    { age: '35-44', pct: 21.0, color: C.info },
    { age: '45-54', pct: 8.2, color: C.warning },
    { age: '55+', pct: 2.9, color: C.success },
  ]

  const topAds = [
    { name: 'Summer Sale Video', campaign: 'Summer Campaign', eng: '2.4L', er: '8.2%', likes: '1.2L', comments: '45.2K', shares: '18.3K', saves: '12.1K' },
    { name: 'Gaming Trailer', campaign: 'Gaming Campaign', eng: '1.8L', er: '7.5%', likes: '92K', comments: '38.1K', shares: '15.2K', saves: '9.8K' },
    { name: 'App Demo Reel', campaign: 'App Install Campaign', eng: '1.2L', er: '6.8%', likes: '65K', comments: '22.5K', shares: '10.4K', saves: '7.2K' },
    { name: 'Brand Story', campaign: 'Brand Awareness', eng: '95K', er: '5.4%', likes: '48K', comments: '18.7K', shares: '8.1K', saves: '5.5K' },
    { name: 'Tech Review', campaign: 'Tech Launch', eng: '78K', er: '4.9%', likes: '38K', comments: '15.2K', shares: '6.8K', saves: '4.2K' },
  ]

  return (
    <div className="space-y-4 fade-in-up">
      <PageHeader title="Engagement Overview" subtitle="Monitor interactions and engagement metrics" icon={<TrendingUp className="h-5 w-5" style={{ color: C.accent }} />} extra={
        <>
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}><Filter className="h-3.5 w-3.5" /> Filter</button>
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}><RefreshCw className="h-3.5 w-3.5" /> Export</button>
        </>
      } />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Engagements" value="24.58L" change="+18.6%" icon={Activity} color={C.accent} sparkline={[18, 22, 20, 28, 24, 31, 27]} />
        <MetricCard label="Likes" value="12.45L" change="+15.2%" icon={Heart} color={C.purple} sparkline={[12, 14, 13, 17, 15, 19, 16]} />
        <MetricCard label="Comments" value="2.34L" change="+12.7%" icon={MessageSquare} color={C.info} sparkline={[8, 10, 9, 12, 11, 14, 12]} />
        <MetricCard label="Shares" value="1.25L" change="+20.4%" icon={Share2} color={C.success} sparkline={[6, 8, 7, 10, 9, 12, 10]} />
        <MetricCard label="Saves" value="85,113" change="+17.3%" icon={Bookmark} color={C.warning} sparkline={[5, 7, 6, 9, 8, 10, 9]} />
        <MetricCard label="Click Throughs" value="4.68L" change="+14.8%" icon={MousePointer} color="#e6a817" sparkline={[10, 13, 12, 16, 14, 18, 16]} />
      </div>

      <Card>
        <CardHeader title="Engagement Trend" />
        <div className="relative">
          <LineChart data={engData} color={C.accent} height={220} labels={['May 3', 'May 4', 'May 5', 'May 6', 'May 7', 'May 8', 'May 9']} />
        </div>
        <div className="flex items-center gap-5 mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
          {[{ l: 'Likes', c: C.purple }, { l: 'Comments', c: C.info }, { l: 'Shares', c: C.success }, { l: 'Saves', c: C.warning }, { l: 'Clicks', c: '#e6a817' }].map(x => (
            <div key={x.l} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: x.c }} /><span className="text-[10px]" style={{ color: C.textTer }}>{x.l}</span></div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader title="Engagement by Platform" />
          <DonutChart segments={platformSegments} size={160} center="35.6%" />
        </Card>
        <Card>
          <CardHeader title="Engagement Rate"><StatusBadge text="6.78% avg" color={C.success} /></CardHeader>
          <div className="space-y-4">
            <div className="rounded-xl p-3 border" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textDim }}>Best Performing</p>
              <p className="text-sm font-semibold text-white">Summer Sale Video</p>
              <p className="text-[11px]" style={{ color: C.success }}>ER: 8.2% (+2.4% vs avg)</p>
            </div>
            <div className="rounded-xl p-3 border" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textDim }}>Worst Performing</p>
              <p className="text-sm font-semibold text-white">Tech Review</p>
              <p className="text-[11px]" style={{ color: C.accent }}>ER: 4.9% (-1.9% vs avg)</p>
            </div>
            <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: `${C.info}10`, border: `1px solid ${C.info}20` }}>
              <Info className="h-4 w-4 flex-shrink-0" style={{ color: C.info }} />
              <p className="text-[10px] leading-relaxed" style={{ color: C.textSec }}>Engagement rate is higher than 78% of advertisers in your category</p>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Engagement by Audience" />
          <div className="space-y-3">
            {audienceData.map(d => (
              <div key={d.age}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px]" style={{ color: C.textTer }}>{d.age} Years</span>
                  <span className="text-[11px] font-semibold text-white">{d.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.pct / 37.1) * 100}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <h3 className="text-sm font-semibold text-white">Top Engaging Ads</h3>
          <button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead><tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              {['Ad Preview', 'Campaign', 'Engagements', 'ER %', 'Likes', 'Comments', 'Shares', 'Saves', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>)}
            </tr></thead>
            <tbody>{topAds.map((a, i) => (
              <tr key={i} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-9 w-14 rounded-lg flex items-center justify-center text-[9px] font-bold text-white" style={{ background: `${C.accent}30` }}>AD</div><span className="text-[12px] font-medium text-white">{a.name}</span></div></td>
                <td className="px-4 py-3 text-[11px]" style={{ color: C.textSec }}>{a.campaign}</td>
                <td className="px-4 py-3 text-[12px] font-semibold" style={{ color: C.accent }}>{a.eng}</td>
                <td className="px-4 py-3 text-[11px] font-semibold" style={{ color: C.success }}>{a.er}</td>
                <td className="px-4 py-3 text-[11px]">{a.likes}</td>
                <td className="px-4 py-3 text-[11px]">{a.comments}</td>
                <td className="px-4 py-3 text-[11px]">{a.shares}</td>
                <td className="px-4 py-3 text-[11px]">{a.saves}</td>
                <td className="px-4 py-3"><button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><MoreHorizontal className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   REVENUE PAGE (Screenshot 2)
   ═══════════════════════════════════════════════════════════════ */

function RevenuePage() {
  const revData = [3200000, 4100000, 3800000, 5200000, 4600000, 5800000, 4900000]
  const topSources = [
    { name: 'Summer Sale Campaign', revenue: '₹8.52M', pct: '32%', color: C.accent },
    { name: 'Gaming Campaign', revenue: '₹6.23M', pct: '23%', color: C.purple },
    { name: 'Tech Promo Campaign', revenue: '₹4.75M', pct: '18%', color: C.info },
    { name: 'App Install Campaign', revenue: '₹3.92M', pct: '15%', color: C.warning },
    { name: 'Brand Awareness', revenue: '₹3.26M', pct: '12%', color: C.success },
  ]

  const campaigns = [
    { name: 'Summer Sale', revenue: '₹8.52M', adRev: '₹7.82M', sub: '₹45.2K', other: '₹65.2K', refunds: '₹12.3K', change: '+15.2%', trend: [20, 25, 22, 30, 28, 35, 32] },
    { name: 'Gaming Promo', revenue: '₹6.23M', adRev: '₹5.65M', sub: '₹32.1K', other: '₹54.8K', refunds: '₹8.5K', change: '+12.8%', trend: [16, 20, 18, 24, 22, 26, 24] },
    { name: 'Tech Launch', revenue: '₹4.75M', adRev: '₹4.32M', sub: '₹22.4K', other: '₹40.6K', refunds: '₹6.2K', change: '+10.5%', trend: [12, 15, 14, 18, 17, 20, 18] },
    { name: 'App Install', revenue: '₹3.92M', adRev: '₹3.58M', sub: '₹18.3K', other: '₹31.5K', refunds: '₹5.1K', change: '+8.2%', trend: [10, 12, 11, 15, 14, 16, 15] },
    { name: 'Brand Aware', revenue: '₹3.26M', adRev: '₹2.98M', sub: '₹14.4K', other: '₹28.1K', refunds: '₹4.2K', change: '+6.4%', trend: [8, 10, 9, 12, 11, 13, 12] },
  ]

  return (
    <div className="space-y-4 fade-in-up">
      <PageHeader title="Revenue Overview" subtitle="Track your revenue performance in real-time" icon={<DollarSign className="h-5 w-5" style={{ color: C.success }} />} extra={
        <>
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}><Filter className="h-3.5 w-3.5" /> Filter</button>
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}><RefreshCw className="h-3.5 w-3.5" /> Export</button>
        </>
      } />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="Total Revenue" value="₹26.68M" change="+12.5%" icon={DollarSign} color={C.success} sparkline={[28, 32, 30, 38, 36, 42, 40]} />
        <MetricCard label="Ad Revenue" value="₹24.15M" change="+10.8%" icon={Megaphone} color={C.accent} sparkline={[24, 28, 26, 34, 32, 38, 36]} />
        <MetricCard label="Subscription" value="₹1.32M" change="+15.3%" icon={Users} color={C.purple} sparkline={[6, 8, 7, 10, 9, 12, 11]} />
        <MetricCard label="Other Revenue" value="₹1.20M" change="+8.6%" icon={TrendingUp} color={C.info} sparkline={[5, 7, 6, 8, 7, 9, 8]} />
        <MetricCard label="Refunds" value="₹99,214" change="-4.3%" positive={false} icon={ArrowDownRight} color={C.warning} sparkline={[8, 7, 8, 6, 7, 6, 7]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader title="Revenue Trend" />
          <div className="relative">
            <LineChart data={revData} color={C.accent} height={220} labels={['May 3', 'May 4', 'May 5', 'May 6', 'May 7', 'May 8', 'May 9']} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Revenue Breakdown" />
          <DonutChart segments={[
            { value: 90.5, color: C.accent, label: 'Ad Revenue', pct: '90.5%' },
            { value: 5.0, color: C.purple, label: 'Subscription', pct: '5.0%' },
            { value: 4.5, color: C.info, label: 'Other', pct: '4.5%' },
          ]} size={160} center="₹26.68M" />
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'This Week', value: '₹26.68M', change: '+12.5%', positive: true },
          { label: 'Last Week', value: '₹23.71M', change: '', positive: true },
          { label: 'This Month', value: '₹1.02Cr', change: '+18.6%', positive: true },
          { label: 'Last Month', value: '₹86.45L', change: '', positive: false },
        ].map(s => (
          <Card key={s.label}>
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{s.label}</span>
            <p className="text-xl font-bold text-white mt-2">{s.value}</p>
            {s.change && <span className="text-[11px] font-medium" style={{ color: s.positive ? C.success : C.accent }}>{s.change}</span>}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader title="Average Revenue" />
          <div className="space-y-4">
            {[
              { label: 'Per Day', value: '₹3.81M', change: '+12.5%', pct: 72 },
              { label: 'Per Campaign', value: '₹18,542', change: '+9.3%', pct: 58 },
              { label: 'Per Ad Set', value: '₹3,245', change: '+7.8%', pct: 35 },
            ].map(m => (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px]" style={{ color: C.textTer }}>{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-white">{m.value}</span>
                    <span className="text-[10px] font-medium" style={{ color: C.success }}>{m.change}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.pct}%`, background: C.success }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue by Campaign"><button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead><tr className="border-b" style={{ borderColor: C.border }}>
                {['Campaign', 'Revenue', 'Ad Revenue', 'Sub', 'Other', 'Refunds', 'Change', 'Trend'].map(h => <th key={h} className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>)}
              </tr></thead>
              <tbody>{campaigns.map((c, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="py-2.5 text-[12px] font-medium text-white">{c.name}</td>
                  <td className="py-2.5 text-[12px] font-semibold" style={{ color: C.success }}>{c.revenue}</td>
                  <td className="py-2.5 text-[11px]" style={{ color: C.textSec }}>{c.adRev}</td>
                  <td className="py-2.5 text-[11px]">{c.sub}</td>
                  <td className="py-2.5 text-[11px]">{c.other}</td>
                  <td className="py-2.5 text-[11px]" style={{ color: C.accent }}>{c.refunds}</td>
                  <td className="py-2.5 text-[11px] font-medium" style={{ color: C.success }}>{c.change}</td>
                  <td className="py-2.5"><MiniSparkline data={c.trend} color={C.success} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Top Revenue Sources" />
        <div className="space-y-3">
          {topSources.map((s, i) => (
            <div key={i} className="flex items-center gap-3 md:gap-4">
              <span className="text-[10px] font-bold w-4" style={{ color: C.textDim }}>#{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-white">{s.name}</span>
                  <span className="text-[12px] font-semibold text-white">{s.revenue} ({s.pct})</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${parseInt(s.pct)}%`, background: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   HERO / FOOTER ADS MANAGEMENT PAGE
   ═══════════════════════════════════════════════════════════════ */

function HeroFooterAdsPage() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formTab, setFormTab] = useState<'hero' | 'footer'>('hero')
  const [form, setForm] = useState({ title: '', mediaUrl: '', targetUrl: '', type: 'image', category: '', deviceTarget: 'all' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imgPreview, setImgPreview] = useState('')

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/ads?active=true')
      if (res.ok) {
        const data = await res.json()
        const adList = Array.isArray(data) ? data : data.ads || []
        setAds(adList.filter((a: any) => a.position === 'hero' || a.position === 'footer'))
      }
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAds() }, [fetchAds])

  const handleSubmit = async () => {
    if (!form.title || !form.mediaUrl) return
    try {
      setUploading(true)
      const endpoint = formTab === 'hero' ? '/api/ads/hero' : '/api/ads/footer'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(editingId ? `/api/ads/${editingId}` : endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          type: form.type || 'banner',
          position: formTab,
          priority: form.deviceTarget === 'desktop-only' ? 10 : form.deviceTarget === 'mobile-only' ? 5 : 0,
        }),
      })
      if (res.ok) {
        setForm({ title: '', mediaUrl: '', targetUrl: '', type: 'image', category: '', deviceTarget: 'all' })
        setEditingId(null)
        setShowForm(false)
        fetchAds()
      }
    } catch { /* silent */ } finally { setUploading(false) }
  }

  const toggleActive = async (ad: any) => {
    try {
      await fetch(`/api/ads/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ad.isActive }),
      })
      fetchAds()
    } catch { /* silent */ }
  }

  const deleteAd = async (id: string) => {
    try {
      await fetch(`/api/ads/${id}`, { method: 'DELETE' })
      fetchAds()
    } catch { /* silent */ }
  }

  const heroAds = ads.filter((a: any) => a.position === 'hero')
  const footerAds = ads.filter((a: any) => a.position === 'footer')

  return (
    <div className="space-y-4 fade-in-up">
      <PageHeader title="Hero / Footer Ads" subtitle={`${ads.length} banner ads configured`} icon={<Film className="h-5 w-5" style={{ color: C.accent }} />} extra={
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: '', mediaUrl: '', targetUrl: '', type: 'image', category: '', deviceTarget: 'all' }) }} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90" style={{ background: C.accent }}>
          <Upload className="h-3.5 w-3.5" /> New Ad
        </button>
      } />

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader title={editingId ? 'Edit Banner Ad' : 'Create Banner Ad'}>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="rounded-lg p-1 hover:bg-white/[0.05]" style={{ color: C.textTer }}><X className="h-4 w-4" /></button>
          </CardHeader>
          <div className="space-y-4">
            {/* Position Tab */}
            <div className="flex gap-2">
              {(['hero', 'footer'] as const).map(tab => (
                <button key={tab} onClick={() => setFormTab(tab)} className={`px-4 py-2 rounded-xl text-[12px] font-medium transition-all ${formTab === tab ? 'text-white' : 'text-white/40 hover:text-white/60'}`} style={{ background: formTab === tab ? C.accent : 'rgba(255,255,255,0.05)' }}>
                  {tab === 'hero' ? '🎬 Hero Banner' : '📢 Footer Banner'}
                </button>
              ))}
            </div>
            {/* Title */}
            <div>
              <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.textSec }}>Ad Title</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Summer Sports Promo" className="w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1" style={{ borderColor: C.border } as any} />
            </div>
            {/* Media URL */}
            <div>
              <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.textSec }}>Media URL (image or video)</label>
              <input type="text" value={form.mediaUrl} onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))} placeholder="https://example.com/banner.jpg" className="w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1" style={{ borderColor: C.border } as any} />
              {form.mediaUrl && (form.mediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
                <p className="mt-1 text-[10px]" style={{ color: C.info }}>📹 Video detected — will autoplay muted</p>
              ) : (
                <p className="mt-1 text-[10px]" style={{ color: C.success }}>🖼️ Image detected — will display as banner</p>
              ))}
            </div>
            {/* Target URL */}
            <div>
              <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.textSec }}>Target URL (optional)</label>
              <input type="text" value={form.targetUrl} onChange={e => setForm(f => ({ ...f, targetUrl: e.target.value }))} placeholder="https://example.com/offer" className="w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1" style={{ borderColor: C.border } as any} />
            </div>
            {/* Type + Device Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.textSec }}>Media Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:outline-none" style={{ borderColor: C.border }}>
                  <option value="image">Image Banner</option>
                  <option value="video">Video Ad</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.textSec }}>Device Target</label>
                <select value={form.deviceTarget} onChange={e => setForm(f => ({ ...f, deviceTarget: e.target.value }))} className="w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:outline-none" style={{ borderColor: C.border }}>
                  <option value="all">All Devices</option>
                  <option value="desktop-only">Desktop Only</option>
                  <option value="mobile-only">Mobile Only</option>
                </select>
              </div>
            </div>
            {/* Preview */}
            {form.mediaUrl && (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-[10px] font-medium px-3 pt-3" style={{ color: C.textDim }}>PREVIEW</p>
                <div className="p-3">
                  {form.mediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
                    <video src={form.mediaUrl} muted autoPlay loop playsInline className="w-full rounded-lg object-cover" style={{ maxHeight: 200 }} />
                  ) : (
                    <img src={form.mediaUrl} alt="Preview" className="w-full rounded-lg object-cover" style={{ maxHeight: 200 }} onError={() => {}} loading="lazy" />
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={handleSubmit} disabled={uploading || !form.title || !form.mediaUrl} className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40" style={{ background: C.accent }}>
                {uploading ? 'Saving...' : editingId ? 'Update Ad' : 'Create Ad'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null) }} className="rounded-xl border px-4 py-2.5 text-[12px] font-medium transition-all hover:bg-white/[0.05]" style={{ borderColor: C.border, color: C.textSec }}>Cancel</button>
            </div>
          </div>
        </Card>
      )}

      {/* Hero Ads Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold text-white">🎬 Hero Banner Ads</h3>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: `${C.accent}40` }}>{heroAds.length}</span>
          </div>
          <button onClick={() => { setFormTab('hero'); setShowForm(true); setEditingId(null) }} className="text-[11px] font-medium" style={{ color: C.accent }}>+ Add</button>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}</div>
        ) : heroAds.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-10 text-center">
            <Film className="h-10 w-10 mb-2" style={{ color: C.textDim }} />
            <p className="text-sm font-medium text-white/30">No hero ads yet</p>
            <p className="text-xs text-white/15 mt-1">Create one above to show in the hero banner</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {heroAds.map((ad: any) => (
              <Card key={ad.id} className="!p-0 overflow-hidden group">
                <div className="relative aspect-[21/9] overflow-hidden">
                  {ad.mediaUrl?.match(/\.(mp4|webm|mov)$/i) ? (
                    <video src={ad.mediaUrl} muted className="h-full w-full object-cover" />
                  ) : (
                    <img src={ad.mediaUrl} alt={ad.title} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: `${C.accent}90` }}>HERO</span>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button onClick={() => toggleActive(ad)} className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm transition-all" style={{ background: ad.isActive ? 'rgba(0,200,100,0.7)' : 'rgba(255,100,100,0.7)' }}>{ad.isActive ? 'Active' : 'Off'}</button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs font-semibold text-white truncate">{ad.title}</p>
                    <p className="text-[10px] text-white/50">{ad.type === 'video' ? '📹' : '🖼️'} • {ad.impressions || 0} impressions</p>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {ad.category && <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px]" style={{ color: C.textTer }}>{ad.category}</span>}
                    {ad.priority > 0 && <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px]" style={{ color: C.textTer }}>Priority: {ad.priority}</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(ad.id); setForm({ title: ad.title, mediaUrl: ad.mediaUrl, targetUrl: ad.targetUrl || '', type: ad.type || 'image', category: ad.category || '', deviceTarget: 'all' }); setShowForm(true); setFormTab('hero') }} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteAd(ad.id)} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.accent }}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer Ads Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold text-white">📢 Footer Banner Ads</h3>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: `${C.purple}40` }}>{footerAds.length}</span>
          </div>
          <button onClick={() => { setFormTab('footer'); setShowForm(true); setEditingId(null) }} className="text-[11px] font-medium" style={{ color: C.purple }}>+ Add</button>
        </div>
        {loading ? (
          <div className="space-y-3">{[1].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}</div>
        ) : footerAds.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-8 text-center">
            <Megaphone className="h-8 w-8 mb-2" style={{ color: C.textDim }} />
            <p className="text-sm font-medium text-white/30">No footer ads yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {footerAds.map((ad: any) => (
              <Card key={ad.id} className="!p-0 overflow-hidden">
                <div className="flex items-stretch">
                  <div className="relative w-48 sm:w-64 flex-shrink-0 overflow-hidden">
                    {ad.mediaUrl?.match(/\.(mp4|webm|mov)$/i) ? (
                      <video src={ad.mediaUrl} muted className="h-full w-full object-cover" style={{ maxHeight: 120 }} />
                    ) : (
                      <img src={ad.mediaUrl} alt={ad.title} className="h-full w-full object-cover" loading="lazy" style={{ maxHeight: 120 }} />
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm" style={{ background: `${C.purple}90` }}>FOOTER</span>
                    </div>
                  </div>
                  <div className="flex-1 p-3 flex items-center justify-between min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{ad.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: C.textTer }}>{ad.type === 'video' ? '📹' : '🖼️'} • {ad.impressions || 0} imp • {ad.clicks || 0} clicks</p>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button onClick={() => toggleActive(ad)} className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white transition-all" style={{ background: ad.isActive ? 'rgba(0,200,100,0.7)' : 'rgba(255,100,100,0.7)' }}>{ad.isActive ? 'Active' : 'Off'}</button>
                      <button onClick={() => { setEditingId(ad.id); setForm({ title: ad.title, mediaUrl: ad.mediaUrl, targetUrl: ad.targetUrl || '', type: ad.type || 'image', category: ad.category || '', deviceTarget: 'all' }); setShowForm(true); setFormTab('footer') }} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteAd(ad.id)} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.accent }}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BANNER ANALYTICS PAGE (Screenshot 5)
   ═══════════════════════════════════════════════════════════════ */

function BannerAnalyticsPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const bannerTabs = ['All Banners', 'Active', 'Paused', 'Draft', 'Archived']
  const impData = [35000, 42000, 38000, 48000, 42560, 45000, 40000]
  const clickData = [800, 1100, 950, 1350, 1250, 1150, 1050]

  const topBanners = [
    { name: 'Summer Sale Banner', impressions: '4,25,600', clicks: '15,420', ctr: '3.62%', revenue: '₹1,25,430.50' },
    { name: 'Gaming Promo Banner', impressions: '3,12,480', clicks: '9,850', ctr: '3.15%', revenue: '₹89,250.20' },
    { name: 'App Install Banner', impressions: '2,85,640', clicks: '7,860', ctr: '2.75%', revenue: '₹65,430.80' },
    { name: 'New Collection Banner', impressions: '2,10,350', clicks: '6,240', ctr: '2.97%', revenue: '₹58,320.10' },
    { name: 'Brand Awareness Banner', impressions: '1,95,820', clicks: '5,120', ctr: '2.62%', revenue: '₹42,180.40' },
  ]

  const allBanners = [
    { name: 'Summer Sale Banner', placement: 'Top', status: 'Active', impressions: '4,25,600', clicks: '15,420', ctr: '3.62%', cpc: '₹3.21', revenue: '₹1,25,430', conv: '2,450' },
    { name: 'Gaming Promo Banner', placement: 'Middle', status: 'Active', impressions: '3,12,480', clicks: '9,850', ctr: '3.15%', cpc: '₹3.12', revenue: '₹89,250', conv: '1,620' },
    { name: 'App Install Banner', placement: 'Bottom', status: 'Active', impressions: '2,85,640', clicks: '7,860', ctr: '2.75%', cpc: '₹2.87', revenue: '₹65,430', conv: '1,230' },
    { name: 'New Collection Banner', placement: 'Top', status: 'Paused', impressions: '2,10,350', clicks: '6,240', ctr: '2.97%', cpc: '₹3.05', revenue: '₹58,320', conv: '980' },
    { name: 'Brand Awareness Banner', placement: 'Sidebar', status: 'Active', impressions: '1,95,820', clicks: '5,120', ctr: '2.62%', cpc: '₹2.91', revenue: '₹42,180', conv: '750' },
  ]

  return (
    <div className="space-y-4 fade-in-up">
      <PageHeader title="Banner Analytics" subtitle="Track detailed performance metrics for all banner advertisements" icon={<ImageIcon className="h-5 w-5" style={{ color: C.warning }} />} extra={
        <>
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}><Filter className="h-3.5 w-3.5" /> Filter</button>
          <button className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-white" style={{ background: C.accent }}><RefreshCw className="h-3.5 w-3.5" /> Export Report</button>
        </>
      } />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Impressions" value="24.58L" change="+18.6%" icon={Eye} color={C.accent} sparkline={[18, 22, 20, 28, 24, 30, 28]} />
        <MetricCard label="Total Clicks" value="73,842" change="+14.3%" icon={MousePointer} color={C.purple} sparkline={[12, 16, 14, 20, 18, 22, 20]} />
        <MetricCard label="CTR (Avg.)" value="2.99%" change="+6.7%" icon={Activity} color={C.info} sparkline={[5, 6, 5.5, 7, 6.5, 7.5, 6.8]} />
        <MetricCard label="Total Revenue" value="₹26.68M" change="+12.5%" icon={DollarSign} color={C.success} sparkline={[28, 32, 30, 38, 36, 42, 40]} />
        <MetricCard label="Avg. CPC" value="₹3.62" change="-4.2%" positive={false} icon={ArrowDownRight} color={C.warning} sparkline={[22, 20, 21, 19, 18, 17, 18.7]} />
        <MetricCard label="Total Conversions" value="12,450" change="+10.2%" icon={CheckCircle} color="#e6a817" sparkline={[8, 10, 9, 14, 12, 16, 14]} />
      </div>

      <Card>
        <CardHeader title="Performance Overview" />
        <div className="relative">
          <LineChart data={impData} color={C.accent} height={200} labels={['May 3', 'May 4', 'May 5', 'May 6', 'May 7', 'May 8', 'May 9']} />
        </div>
        <div className="flex items-center gap-5 mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
          {[{ l: 'Impressions', c: C.accent }, { l: 'Clicks', c: C.purple }, { l: 'CTR', c: C.info }].map(x => (
            <div key={x.l} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: x.c }} /><span className="text-[10px]" style={{ color: C.textTer }}>{x.l}</span></div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader title="Top Performing Banners"><button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead><tr className="border-b" style={{ borderColor: C.border }}>
                {['#', 'Banner', 'Impressions', 'Clicks', 'CTR', 'Revenue'].map(h => <th key={h} className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>)}
              </tr></thead>
              <tbody>{topBanners.map((b, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="py-2.5 text-[11px]" style={{ color: C.textDim }}>{i + 1}</td>
                  <td className="py-2.5 text-[12px] font-medium text-white">{b.name}</td>
                  <td className="py-2.5 text-[11px]" style={{ color: C.textSec }}>{b.impressions}</td>
                  <td className="py-2.5 text-[11px]">{b.clicks}</td>
                  <td className="py-2.5 text-[11px] font-semibold" style={{ color: C.success }}>{b.ctr}</td>
                  <td className="py-2.5 text-[11px] font-semibold" style={{ color: C.accent }}>{b.revenue}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.border }}>
            <h3 className="text-sm font-semibold text-white">Banner Performance Table</h3>
            <div className="flex gap-2"><button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><RefreshCw className="h-3.5 w-3.5" /></button></div>
          </div>
          <div className="flex gap-1 px-5 pt-3">
            {bannerTabs.map(t => (
              <button key={t} onClick={() => setActiveFilter(t.toLowerCase().split(' ')[0])} className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all" style={{ background: activeFilter === t.toLowerCase().split(' ')[0] ? C.accent : 'transparent', color: activeFilter === t.toLowerCase().split(' ')[0] ? '#fff' : C.textTer }}>{t}</button>
            ))}
          </div>
          <div className="overflow-x-auto mt-3">
            <table className="w-full min-w-[1000px]">
              <thead><tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Banner Info', 'Placement', 'Status', 'Impressions', 'Clicks', 'CTR', 'CPC', 'Revenue', 'Conv.', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>)}
              </tr></thead>
              <tbody>{allBanners.map((b, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-4 py-3 text-[12px] font-medium text-white">{b.name}</td>
                  <td className="px-4 py-3 text-[11px]" style={{ color: C.textSec }}>{b.placement}</td>
                  <td className="px-4 py-3"><StatusBadge text={b.status} color={b.status === 'Active' ? C.success : C.warning} /></td>
                  <td className="px-4 py-3 text-[11px]">{b.impressions}</td>
                  <td className="px-4 py-3 text-[11px]">{b.clicks}</td>
                  <td className="px-4 py-3 text-[11px] font-semibold" style={{ color: C.success }}>{b.ctr}</td>
                  <td className="px-4 py-3 text-[11px]">{b.cpc}</td>
                  <td className="px-4 py-3 text-[11px] font-semibold" style={{ color: C.accent }}>{b.revenue}</td>
                  <td className="px-4 py-3 text-[11px]">{b.conv}</td>
                  <td className="px-4 py-3"><div className="flex gap-1"><button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Eye className="h-3.5 w-3.5" /></button><button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><MoreHorizontal className="h-3.5 w-3.5" /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
            <span className="text-[11px]" style={{ color: C.textTer }}>Showing 1 to 5 of 25</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(p => (
                <button key={p} className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-medium transition-colors" style={{ background: p === 1 ? C.accent : 'transparent', color: p === 1 ? '#fff' : C.textTer }}>{p}</button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader title="CTR by Placement"><button className="text-[11px] font-medium" style={{ color: C.accent }}>View Full Report</button></CardHeader>
          <DonutChart segments={[
            { value: 3.62, color: C.accent, label: 'Top', pct: '3.62%' },
            { value: 3.15, color: C.purple, label: 'Middle', pct: '3.15%' },
            { value: 2.75, color: C.info, label: 'Bottom', pct: '2.75%' },
            { value: 2.62, color: C.warning, label: 'Sidebar', pct: '2.62%' },
            { value: 2.10, color: C.success, label: 'Others', pct: '2.10%' },
          ]} size={150} center="2.99%" />
        </Card>
        <Card>
          <CardHeader title="Device Performance"><button className="text-[11px] font-medium" style={{ color: C.accent }}>View Full Report</button></CardHeader>
          <DonutChart segments={[
            { value: 65.2, color: C.accent, label: 'Mobile', pct: '65.2%' },
            { value: 28.6, color: C.purple, label: 'Desktop', pct: '28.6%' },
            { value: 6.2, color: C.info, label: 'Tablet', pct: '6.2%' },
          ]} size={150} center="65.2%" />
          <p className="text-[9px] text-center mt-2" style={{ color: C.textDim }}>Data based on impressions</p>
        </Card>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════════════════════════ */

function SettingsPage() {
  return (
    <div className="space-y-4 fade-in-up">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Settings className="h-5 w-5" style={{ color: C.textSec }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <p className="text-xs" style={{ color: C.textTer }}>Platform configuration</p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { group: 'General', items: ['Site Name', 'Site URL', 'Timezone', 'Language', 'Maintenance Mode'] },
          { group: 'Streaming', items: ['Default Quality', 'Max Concurrent Streams', 'DVR Support', 'Auto-Record', 'Low Latency Mode'] },
          { group: 'Security', items: ['Two-Factor Auth', 'Rate Limiting', 'CORS Origins', 'API Keys'] },
          { group: 'Notifications', items: ['Email Notifications', 'Push Notifications', 'Stream Alerts', 'New User Alerts'] },
        ].map((g) => (
          <Card key={g.group}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textDim }}>{g.group}</h3>
            <div className="space-y-4">
              {g.items.map((item) => (
                <div key={item} className="flex items-center justify-between py-1">
                  <span className="text-[13px]" style={{ color: C.textSec }}>{item}</span>
                  <div
                    className="relative h-6 w-11 rounded-full transition-colors cursor-pointer"
                    style={{ background: Math.random() > 0.3 ? C.success : 'rgba(255,255,255,0.08)' }}
                    onClick={(e) => {
                      const el = e.currentTarget
                      const isOn = el.style.background === C.success
                      el.style.background = isOn ? 'rgba(255,255,255,0.08)' : C.success
                      el.querySelector('span')!.style.transform = isOn ? 'translateX(2px)' : 'translateX(22px)'
                    }}
                  >
                    <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform" style={{ transform: Math.random() > 0.3 ? 'translateX(22px)' : 'translateX(2px)' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LIVE CONTROL PAGE
   ═══════════════════════════════════════════════════════════════ */

function LiveControlPage() {
  const [category, setCategory] = useState<'cricket' | 'football'>('cricket')
  const [showStreamKey, setShowStreamKey] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [matchTitle, setMatchTitle] = useState('The Ashes Day 3: England vs Australia')
  const [description, setDescription] = useState("Live coverage of The Ashes Day 3 from Lord's Cricket Ground.")
  const [isGoingLive, setIsGoingLive] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [liveStreamId, setLiveStreamId] = useState<string | null>(null)
  const [liveDuration, setLiveDuration] = useState(0)
  const [liveViewers, setLiveViewers] = useState(0)

  // Live timer
  useEffect(() => {
    if (!isLive) return
    const timer = setInterval(() => setLiveDuration(d => d + 1), 1000)
    return () => clearInterval(timer)
  }, [isLive])

  function formatDuration(sec: number): string {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleGoLive = async () => {
    setIsGoingLive(true)
    try {
      const homeTeam = matchTitle.split(' vs ')[0]?.replace(/^.*?\s/, '') || 'Team A'
      const awayTeam = matchTitle.split(' vs ')[1]?.split(' -')[0]?.trim() || 'Team B'

      // 1. Create stream in DB via API
      const res = await fetch('/api/admin/go-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: matchTitle,
          description: description,
          category: category,
          homeTeam,
          awayTeam,
        }),
      })
      const stream = await res.json()

      // 2. Emit socket event so users see it in real-time
      const socket = socketIo('/?XTransformPort=3005', { transports: ['websocket', 'polling'] })
      socket.emit('admin-go-live', {
        streamId: stream.id,
        title: matchTitle,
        category: category,
        homeTeam,
        awayTeam,
      })

      setLiveStreamId(stream.id)
      setIsLive(true)

      // Listen for viewer updates
      socket.on('viewer-update', (data: any) => {
        if (data.streamId === stream.id) {
          setLiveViewers(data.count)
        }
      })

      // Join the stream room
      socket.emit('join-stream', stream.id)
    } catch (err) {
      console.error('Failed to go live:', err)
    } finally {
      setIsGoingLive(false)
    }
  }

  const handleStopLive = async () => {
    if (!liveStreamId) return
    try {
      await fetch('/api/admin/stop-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: liveStreamId }),
      })
      const socket = socketIo('/?XTransformPort=3005', { transports: ['websocket', 'polling'] })
      socket.emit('admin-stop-live', { streamId: liveStreamId })
      socket.emit('leave-stream', liveStreamId)
      setIsLive(false)
      setLiveStreamId(null)
      setLiveDuration(0)
      setLiveViewers(0)
    } catch (err) {
      console.error('Failed to stop live:', err)
    }
  }

  const handleCopy = (text: string, type: 'url' | 'key') => {
    navigator.clipboard.writeText(text)
    if (type === 'url') { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000) }
    else { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000) }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    borderColor: C.border,
    borderRadius: 12,
  }

  return (
    <div className="space-y-4 fade-in-up">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.accent}15` }}>
          <Radio className="h-5 w-5" style={{ color: C.accent }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Live Stream Control Room</h2>
          <p className="text-xs" style={{ color: C.textTer }}>Manage and control your live stream, settings and broadcast</p>
        </div>
      </div>

      {/* ── 3-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-4">
          {/* 1. Stream Preview Card */}
          <Card>
            <CardHeader title="Stream Preview">
              <button className="rounded-lg p-1 transition-colors hover:bg-white/[0.05]">
                <MoreHorizontal className="h-4 w-4" style={{ color: C.textTer }} />
              </button>
            </CardHeader>
            <div className="relative rounded-xl overflow-hidden" style={{ background: C.sidebar }}>
              <img src="/sportix/stadium-preview.png" alt="Stream preview" className="w-full h-40 object-cover opacity-60" draggable={false} />
              {/* Live/Offline badge */}
              <div className="absolute top-3 left-3">
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${isLive ? 'animate-pulse' : ''}`} style={{ background: isLive ? 'rgba(46,204,113,0.90)' : 'rgba(230,57,70,0.90)' }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {isLive ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110 cursor-pointer">
                  <Play className="h-5 w-5 text-white ml-0.5" />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-semibold text-white">{isLive ? 'Stream is live now' : 'Stream is currently offline'}</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.textTer }}>{isLive ? `Live for ${formatDuration(liveDuration)}` : 'Start streaming to go live'}</p>
            </div>
            {/* Tabs row */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: 'Category', value: 'Cricket' },
                { label: 'Resolution', value: '-' },
                { label: 'Bitrate', value: '-' },
                { label: 'FPS', value: '-' },
                { label: 'Audio', value: '-' },
              ].map((tab) => (
                <span key={tab.label} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <span style={{ color: C.textTer }}>{tab.label}:</span>
                  <span className="font-medium text-white">{tab.value}</span>
                </span>
              ))}
            </div>
          </Card>

          {/* 2. Stream Connection Card */}
          <Card>
            <CardHeader title={
              <span className="flex items-center gap-2">
                <Wifi className="h-4 w-4" style={{ color: C.textSec }} />
                Stream Connection
              </span>
            }>
              <StatusBadge text="Ready" color={C.success} />
            </CardHeader>

            {/* Server URL */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Server URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="rtmp://live.sportixlive.com/live"
                    className="flex-1 border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => handleCopy('rtmp://live.sportixlive.com/live', 'url')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-white/[0.05]"
                    style={{ borderColor: C.border }}
                  >
                    {copiedUrl ? <Check className="h-4 w-4" style={{ color: C.success }} /> : <Copy className="h-4 w-4" style={{ color: C.textTer }} />}
                  </button>
                </div>
              </div>

              {/* Stream Key */}
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Stream Key</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showStreamKey ? 'text' : 'password'}
                      readOnly
                      value="sk-live-xxxx-xxxx-xxxx"
                      className="w-full border px-3 py-2.5 pr-10 text-sm text-white bg-transparent focus:outline-none"
                      style={inputStyle}
                    />
                    <button
                      onClick={() => setShowStreamKey(!showStreamKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 transition-colors hover:bg-white/[0.05] rounded"
                    >
                      <Eye className="h-4 w-4" style={{ color: C.textTer }} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleCopy('sk-live-xxxx-xxxx-xxxx', 'key')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-white/[0.05]"
                    style={{ borderColor: C.border }}
                  >
                    {copiedKey ? <Check className="h-4 w-4" style={{ color: C.success }} /> : <Copy className="h-4 w-4" style={{ color: C.textTer }} />}
                  </button>
                </div>
              </div>

              {/* OBS Guide */}
              <div className="rounded-xl p-3 mt-2" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" style={{ color: C.info }} />
                  <span className="text-xs font-semibold text-white">How to connect OBS?</span>
                </div>
                <ol className="space-y-1.5 pl-1">
                  {[
                    'Open OBS Studio and go to Settings → Stream',
                    'Select "Custom" as Service',
                    'Paste the Server URL above',
                    'Paste the Stream Key above',
                    'Click "Apply" and then "OK"',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color: C.textTer }}>
                      <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white mt-0.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <button className="flex items-center gap-1.5 mt-3 rounded-xl px-4 py-2 text-[11px] font-medium transition-colors hover:bg-white/[0.05] border" style={{ borderColor: C.border, color: C.textSec }}>
                  <Play className="h-3.5 w-3.5" /> Watch Guide
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* ═══ MIDDLE COLUMN ═══ */}
        <div className="space-y-4">
          {/* 3. Start Live Stream Card */}
          <Card>
            <CardHeader title="Start Live Stream" />

            {/* Category Selection */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCategory('cricket')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-semibold text-white transition-all"
                style={{ background: category === 'cricket' ? C.accent : 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-base">🏏</span> Cricket
              </button>
              <button
                onClick={() => setCategory('football')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-semibold text-white transition-all"
                style={{ background: category === 'football' ? C.accent : 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-base">⚽</span> Football
              </button>
            </div>

            {/* Match Title */}
            <div className="mb-4">
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Match Title</label>
              <input
                type="text"
                value={matchTitle}
                onChange={(e) => setMatchTitle(e.target.value)}
                maxLength={100}
                className="w-full border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
                style={inputStyle}
              />
              <div className="text-right mt-1">
                <span className="text-[10px]" style={{ color: C.textDim }}>{matchTitle.length}/100</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>
                Description <span className="text-[10px]" style={{ color: C.textDim }}>(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                rows={3}
                className="w-full border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors resize-none"
                style={inputStyle}
              />
              <div className="text-right mt-1">
                <span className="text-[10px]" style={{ color: C.textDim }}>{description.length}/300</span>
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="mb-5">
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>
                Thumbnail <span className="text-[10px]" style={{ color: C.textDim }}>(Optional)</span>
              </label>
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors hover:border-white/10 cursor-pointer" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.01)' }}>
                <CloudUpload className="h-8 w-8 mb-2" style={{ color: C.textDim }} />
                <p className="text-xs font-medium text-white">Drag & drop thumbnail here</p>
                <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>JPG, PNG up to 5MB</p>
                <button className="mt-3 rounded-xl border px-4 py-2 text-[11px] font-medium transition-colors hover:bg-white/[0.05]" style={{ borderColor: C.border, color: C.textSec }}>
                  Choose File
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleGoLive}
                disabled={isGoingLive || isLive}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: isLive ? C.success : C.accent }}
              >
                {isGoingLive ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : isLive ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Radio className="h-4 w-4" />
                )}
                {isLive ? 'Live Now' : 'Go Live Now'}
              </button>
              {isLive && (
                <button
                  onClick={handleStopLive}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: `${C.accent}30`, color: C.accent, border: `1px solid ${C.accent}40` }}
                >
                  <Square className="h-4 w-4" />
                  End Stream
                </button>
              )}
              <button className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-medium transition-all hover:bg-white/[0.08]" style={{ background: 'rgba(255,255,255,0.05)', color: C.textSec }}>
                <Monitor className="h-4 w-4" /> Test Stream
              </button>
            </div>
          </Card>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="space-y-4">
          {/* 4. Stream Status Card */}
          <Card>
            <CardHeader title="Stream Status">
              <StatusBadge text={isLive ? 'LIVE' : 'OFFLINE'} color={isLive ? C.success : C.accent} />
            </CardHeader>
            <div className="flex flex-col items-center py-4">
              <div className="relative flex items-center justify-center">
                <span className={`absolute h-12 w-12 rounded-full ${isLive ? 'animate-ping' : ''}`} style={{ background: `${isLive ? C.success : C.accent}20` }} />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full" style={{ background: `${isLive ? C.success : C.accent}20` }}>
                  <span className="h-6 w-6 rounded-full" style={{ background: isLive ? C.success : C.accent }} />
                </span>
              </div>
              <p className="mt-3 text-sm font-bold" style={{ color: isLive ? C.success : C.accent }}>{isLive ? 'LIVE' : 'OFFLINE'}</p>
            </div>
          </Card>

          {/* 5. Stream Health Card */}
          <Card>
            <CardHeader title={
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4" style={{ color: C.textSec }} />
                Stream Health
              </span>
            } />
            <div className="space-y-0">
              {[
                { label: 'Video Resolution', value: '-' },
                { label: 'Video Bitrate', value: '-' },
                { label: 'Audio Bitrate', value: '-' },
                { label: 'FPS', value: '-' },
                { label: 'Dropped Frames', value: '-' },
                { label: 'Status', value: 'Offline', valueColor: C.accent },
              ].map((m, i) => (
                <div key={m.label} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: C.border, background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                  <span className="text-[11px]" style={{ color: C.textTer }}>{m.label}</span>
                  <span className="text-[11px] font-medium" style={{ color: (m as { valueColor?: string }).valueColor || C.textSec }}>{m.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <MiniSparkline data={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]} color={C.textDim} />
            </div>
          </Card>

          {/* 6. Live Statistics Card */}
          <Card>
            <CardHeader title={
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" style={{ color: C.textSec }} />
                Live Statistics
              </span>
            } />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Duration', value: isLive ? formatDuration(liveDuration) : '00:00:00', icon: Timer },
                { label: 'Viewers', value: isLive ? String(liveViewers) : '0', icon: Users },
                { label: 'Peak Viewers', value: isLive ? String(Math.max(liveViewers, 0)) : '0', icon: TrendingUp },
                { label: 'Data Used', value: isLive ? `${(liveDuration * 0.003).toFixed(2)} GB` : '0.00 GB', icon: HardDrive },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
                    <Icon className="h-4 w-4 mx-auto mb-1.5" style={{ color: isLive ? C.success : C.textDim }} />
                    <p className="text-sm font-bold text-white">{s.value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>{s.label}</p>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* 7. Recent Live Streams Card */}
          <Card>
            <CardHeader title="Recent Live Streams">
              <button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button>
            </CardHeader>
            <div className="flex gap-3 rounded-xl p-2 transition-all cursor-pointer hover:bg-white/[0.03]">
              <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg" style={{ background: C.sidebar }}>
                <img src="/sportix/stadium-preview.png" alt="" className="h-full w-full object-cover opacity-60" draggable={false} />
                <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-mono text-white">2:15:30</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white line-clamp-1">IND vs PAK - T20 World Cup</p>
                <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Jun 12, 2024 • 02:15:30</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px]" style={{ color: C.textTer }}>12.4K Views</span>
                  <button className="rounded-lg px-2 py-0.5 text-[10px] font-medium" style={{ background: `${C.success}15`, color: C.success }}>Replay</button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── BOTTOM ROW: Streaming Checklist ── */}
      <Card>
        <CardHeader title="Streaming Checklist" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: Camera, label: 'Encoder Connected', status: isLive ? 'Connected' : 'Not Connected', color: isLive ? C.success : C.accent },
            { icon: Clock, label: 'Stream Key Valid', status: isLive ? 'Valid' : 'Pending', color: isLive ? C.success : C.warning },
            { icon: Camera, label: 'Video Input', status: isLive ? 'Active' : 'No Signal', color: isLive ? C.success : C.accent },
            { icon: Mic, label: 'Audio Input', status: isLive ? 'Active' : 'No Signal', color: isLive ? C.success : C.accent },
            { icon: Wifi, label: 'Internet', status: 'Good', color: C.success },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex flex-col items-center gap-2 rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${item.color}15` }}>
                  <Icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <p className="text-[11px] font-medium text-white">{item.label}</p>
                <p className="text-[10px] font-medium" style={{ color: item.color }}>{item.status}</p>
              </div>
            )
          })}
        </div>
        <div className="flex justify-end mt-4">
          <button className="flex items-center gap-2 rounded-xl border px-4 py-2 text-[12px] font-medium transition-colors hover:bg-white/[0.05]" style={{ borderColor: C.border, color: C.textSec }}>
            <RefreshCw className="h-3.5 w-3.5" /> Run Test
          </button>
        </div>
      </Card>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   ═══════════════════════════════════════════════════════════════ */

interface AdItem {
  id: string
  title: string
  type: string
  mediaUrl: string
  targetUrl: string
  category: string
  duration: number
  position: string
  priority: number
  impressions: number
  clicks: number
  status: string
  createdAt: string
}

interface AdAnalytics {
  totalAds: number
  activeAds: number
  totalImpressions: number
  totalClicks: number
  ctr: number
}

function AdsManagerPage() {
  const [ads, setAds] = useState<AdItem[]>([])
  const [analytics, setAnalytics] = useState<AdAnalytics>({ totalAds: 0, activeAds: 0, totalImpressions: 0, totalClicks: 0, ctr: 0 })
  const [loading, setLoading] = useState(true)

  const fetchAds = useCallback(async () => {
    try {
      const [adsRes, analyticsRes] = await Promise.all([
        fetch('/api/ads'),
        fetch('/api/ads/analytics'),
      ])
      if (adsRes.ok) {
        const adsData = await adsRes.json()
        const adsList = Array.isArray(adsData) ? adsData : adsData.ads || []
        setAds(adsList.map((a: any) => ({ ...a, status: a.isActive ? 'active' : 'inactive' })))
      }
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        const activeAds = Array.isArray(analyticsData.ads) ? analyticsData.ads.filter((a: any) => a.isActive).length : 0
        setAnalytics({
          totalAds: analyticsData.ads?.length || 0,
          activeAds,
          totalImpressions: analyticsData.totalImpressions || 0,
          totalClicks: analyticsData.totalClicks || 0,
          ctr: parseFloat(String(analyticsData.ctr || 0)),
        })
      }
    } catch {
      setAnalytics({ totalAds: 0, activeAds: 0, totalImpressions: 0, totalClicks: 0, ctr: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAds() }, [fetchAds])



  const handleDeleteAd = async (id: string) => {
    try {
      await fetch('/api/ads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      fetchAds()
    } catch {
      // ignore
    }
  }

  const handleToggleStatus = async (ad: AdItem) => {
    try {
      const newActive = ad.status === 'active'
      await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, isActive: newActive }),
      })
      fetchAds()
    } catch {
      // ignore
    }
  }



  const getCtr = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0.00'
    return ((clicks / impressions) * 100).toFixed(2)
  }

  if (loading) {
    return (
      <div className="space-y-4 fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.warning}15` }}>
            <Megaphone className="h-5 w-5 animate-pulse" style={{ color: C.warning }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Ads Manager</h2>
            <p className="text-xs" style={{ color: C.textTer }}>Loading ads data...</p>
          </div>
        </div>
        <Card>
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#f39c12]" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 fade-in-up">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.warning}15` }}>
          <Megaphone className="h-5 w-5" style={{ color: C.warning }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Ads Manager</h2>
          <p className="text-xs" style={{ color: C.textTer }}>Manage advertisements and monetization</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {[
          { label: 'Total Ads', value: String(analytics.totalAds || ads.length), icon: Megaphone, color: C.warning },
          { label: 'Active Ads', value: String(analytics.activeAds || ads.filter(a => a.status === 'active').length), icon: CheckCircle, color: C.success },
          { label: 'Total Impressions', value: fmt(analytics.totalImpressions || ads.reduce((s, a) => s + (a.impressions || 0), 0)), icon: Eye, color: C.info },
          { label: 'Total Clicks', value: fmt(analytics.totalClicks || ads.reduce((s, a) => s + (a.clicks || 0), 0)), icon: ArrowUpRight, color: C.purple },
          { label: 'CTR', value: `${analytics.ctr || (analytics.totalClicks && analytics.totalImpressions ? ((analytics.totalClicks / analytics.totalImpressions) * 100).toFixed(2) : getCtr(ads.reduce((s, a) => s + (a.impressions || 0), 0), ads.reduce((s, a) => s + (a.clicks || 0), 0)))}%`, icon: TrendingUp, color: C.accent },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{s.label}</span>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
            <Search className="h-4 w-4" style={{ color: C.textDim }} />
            <input type="text" placeholder="Search ads..." className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none" />
          </div>
        </div>
        <button
          onClick={fetchAds}
          className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]"
          style={{ borderColor: C.border, color: C.textSec }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>



      {/* Ads Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Title', 'Type', 'Category', 'Impressions', 'Clicks', 'CTR', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Megaphone className="h-8 w-8 mx-auto mb-2" style={{ color: C.textDim }} />
                    <p className="text-sm" style={{ color: C.textTer }}>No ads created yet</p>
                    <p className="text-[11px] mt-1" style={{ color: C.textDim }}>Click "Create Ad" to get started</p>
                  </td>
                </tr>
              )}
              {ads.map((ad) => (
                <tr key={ad.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {ad.mediaUrl && (
                        <div className="h-8 w-12 rounded-md overflow-hidden flex-shrink-0" style={{ background: C.sidebar }}>
                          <img src={ad.mediaUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <span className="text-[12px] font-medium text-white truncate max-w-[120px]">{ad.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge text={ad.type} color={ad.type === 'banner' ? C.info : ad.type === 'pre-roll' ? C.accent : ad.type === 'mid-roll' ? C.warning : C.purple} />
                  </td>
                  <td className="px-5 py-3 text-[11px] capitalize" style={{ color: C.textSec }}>{ad.category}</td>
                  <td className="px-5 py-3 text-[12px]" style={{ color: C.textSec }}>{fmt(ad.impressions || 0)}</td>
                  <td className="px-5 py-3 text-[12px]" style={{ color: C.textSec }}>{fmt(ad.clicks || 0)}</td>
                  <td className="px-5 py-3 text-[12px] font-semibold" style={{ color: C.success }}>{getCtr(ad.impressions || 0, ad.clicks || 0)}%</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleStatus(ad)}
                      className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer`}
                      style={{ background: ad.status === 'active' ? C.success : 'rgba(255,255,255,0.08)' }}
                    >
                      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform" style={{ transform: ad.status === 'active' ? 'translateX(22px)' : 'translateX(2px)' }} />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }} title="Edit">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteAd(ad.id)} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.accent }} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CREATE NEW AD SECTION COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function CreateNewAdSection() {
  const [showPreview, setShowPreview] = useState(false)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: 'Summer Sale 2024',
    type: 'banner',
    placement: 'homepage',
    mediaUrl: 'https://yourdomain.com/ads/summer-sale-banner.jpg',
    redirectUrl: 'https://yoursite.com/summer-sale',
    vastTag: '<script async src="https://youradnetwork.com/tag.js"></script>\n<!-- or VAST XML -->',
    devices: { desktop: true, mobile: false, tablet: false },
    countries: 'IN, US, GB',
    category: '',
    startDate: '2026-05-03',
    endDate: '',
    cpm: 100,
    cpc: 2,
    abGroup: '',
  })

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    borderColor: C.border,
    borderRadius: 12,
  }

  const sectionHeaderStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${C.purple}20, ${C.purple}08)`,
    border: `1px solid ${C.purple}25`,
    borderRadius: 12,
  }

  const handleCreate = async () => {
    if (!form.title) return
    setCreating(true)
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          mediaUrl: form.mediaUrl,
          targetUrl: form.redirectUrl,
          category: form.category || 'football',
          duration: 30,
          position: 'pre',
          priority: 1,
        }),
      })
      if (res.ok) {
        setForm({
          title: '', type: 'banner', placement: 'homepage', mediaUrl: '', redirectUrl: '',
          vastTag: '', devices: { desktop: true, mobile: false, tablet: false },
          countries: '', category: '', startDate: '', endDate: '', cpm: 100, cpc: 2, abGroup: '',
        })
      }
    } catch { /* ignore */ }
    finally { setCreating(false) }
  }

  const [adUploadProgress, setAdUploadProgress] = useState<UploadProgress | null>(null)
  const adUploadCancelRef = useRef<(() => void) | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setAdUploadProgress({ percent: 0, loaded: 0, total: file.size, speed: 0, eta: 0, status: 'uploading' })
    try {
      const { promise, cancel } = uploadFile(file, setAdUploadProgress, { type: 'ad' })
      adUploadCancelRef.current = cancel
      const result = await promise
      if (result.success) {
        setForm(prev => ({ ...prev, mediaUrl: result.url || result.fileUrl || '' }))
      }
    } catch { /* ignore */ }
    finally { setUploading(false); adUploadCancelRef.current = null }
  }

  // Estimated calculations
  const estImpressions = form.cpm > 0 ? Math.floor((25000 * form.cpm) / 100) : 0
  const estClicks = Math.floor(estImpressions * 0.03)
  const estRevenue = (estClicks * form.cpc) + (estImpressions * form.cpm / 1000)

  const selectedDevices = Object.entries(form.devices).filter(([, v]) => v).length

  return (
    <div className="space-y-4 fade-in-up">
      {/* ── Header Bar ── */}
      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.purple}15` }}>
              <Plus className="h-5 w-5" style={{ color: C.purple }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Ad</h3>
              <p className="text-[11px]" style={{ color: C.textTer }}>Fill in the details to create a new advertisement</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]"
              style={{ borderColor: C.border, color: C.textSec }}
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
            <button
              onClick={() => setForm({
                title: '', type: 'banner', placement: 'homepage', mediaUrl: '', redirectUrl: '',
                vastTag: '', devices: { desktop: true, mobile: false, tablet: false },
                countries: '', category: '', startDate: '', endDate: '', cpm: 100, cpc: 2, abGroup: '',
              })}
              className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]"
              style={{ borderColor: C.border, color: C.textSec }}
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !form.title}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: C.success }}
            >
              {creating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {creating ? 'Saving...' : 'Save Ad'}
            </button>
          </div>
        </div>
      </Card>

      {/* ── Two Column: Ad Details + Targeting ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* LEFT COLUMN — AD DETAILS */}
        <Card>
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 mb-5" style={sectionHeaderStyle}>
            <FileText className="h-4 w-4" style={{ color: C.purple }} />
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: C.purple }}>AD DETAILS</span>
          </div>

          <div className="space-y-4">
            {/* Ad Title */}
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>Ad Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border px-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
                style={inputStyle}
                placeholder="Enter ad title..."
              />
            </div>

            {/* Ad Type + Placement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>Ad Type</label>
                <div className="relative">
                  <select
                    value={form.type}
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border px-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none appearance-none cursor-pointer"
                    style={{ ...inputStyle, background: `linear-gradient(135deg, ${C.purple}10, rgba(255,255,255,0.03))` }}
                  >
                    <option value="banner" style={{ background: '#1e1e1e' }}>Banner</option>
                    <option value="pre-roll" style={{ background: '#1e1e1e' }}>Pre-Roll</option>
                    <option value="mid-roll" style={{ background: '#1e1e1e' }}>Mid-Roll</option>
                    <option value="overlay" style={{ background: '#1e1e1e' }}>Overlay</option>
                    <option value="native" style={{ background: '#1e1e1e' }}>Native</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: C.purple }} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>Placement</label>
                <div className="relative">
                  <select
                    value={form.placement}
                    onChange={(e) => setForm(prev => ({ ...prev, placement: e.target.value }))}
                    className="w-full border px-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none appearance-none cursor-pointer"
                    style={{ ...inputStyle, background: `linear-gradient(135deg, ${C.purple}10, rgba(255,255,255,0.03))` }}
                  >
                    <option value="homepage" style={{ background: '#1e1e1e' }}>Homepage</option>
                    <option value="player" style={{ background: '#1e1e1e' }}>Player</option>
                    <option value="sidebar" style={{ background: '#1e1e1e' }}>Sidebar</option>
                    <option value="footer" style={{ background: '#1e1e1e' }}>Footer</option>
                    <option value="header" style={{ background: '#1e1e1e' }}>Header</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: C.purple }} />
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>Media (Image / Video)</label>
              {form.mediaUrl ? (
                <div className="relative rounded-xl border-2 overflow-hidden" style={{ borderColor: `${C.success}30`, background: 'rgba(255,255,255,0.02)' }}>
                  <div className="h-40 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.success}08, rgba(255,255,255,0.01))` }}>
                    {form.mediaUrl.match(/\.(mp4|webm|mov)/i) ? (
                      <div className="flex flex-col items-center gap-2">
                        <Play className="h-10 w-10" style={{ color: C.success }} />
                        <span className="text-[11px]" style={{ color: C.textTer }}>Video loaded</span>
                      </div>
                    ) : (
                      <img src={form.mediaUrl} alt="Ad preview" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 border-t" style={{ borderColor: C.border }}>
                    <span className="text-[10px] truncate max-w-[200px]" style={{ color: C.textTer }}>{form.mediaUrl}</span>
                    <button onClick={() => setForm(prev => ({ ...prev, mediaUrl: '' }))} className="rounded-lg p-1 transition-colors hover:bg-white/[0.05]" style={{ color: C.accent }}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors hover:border-white/10 cursor-pointer" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.01)' }}>
                  {uploading && adUploadProgress ? (
                    <div className="flex flex-col items-center gap-2 w-full max-w-[280px]">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#2ecc71]" />
                      <p className="text-[12px] font-medium text-white">{adUploadProgress.percent}% Uploading</p>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${adUploadProgress.percent}%`, background: '#2ecc71' }} />
                      </div>
                      <p className="text-[10px] text-center" style={{ color: C.textTer }}>
                        {getUploadStatusMessage(adUploadProgress)}
                      </p>
                      <button type="button" onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); adUploadCancelRef.current?.() }} className="text-[10px] font-medium mt-1 px-3 py-1 rounded-lg transition-colors hover:bg-white/[0.06]" style={{ color: C.accent }}>
                        Cancel Upload
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-2" style={{ background: `${C.success}10` }}>
                        <CloudUpload className="h-6 w-6" style={{ color: C.success }} />
                      </div>
                      <p className="text-[12px] font-medium text-white">Drag & drop your file here or click to browse</p>
                      <p className="text-[10px] mt-1" style={{ color: C.textDim }}>JPG, PNG, GIF, MP4, WEBM (max 5GB)</p>
                    </>
                  )}
                  <input type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Media URL */}
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>Media URL</label>
              <input
                type="text"
                value={form.mediaUrl}
                onChange={(e) => setForm(prev => ({ ...prev, mediaUrl: e.target.value }))}
                className="w-full border px-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
                style={inputStyle}
                placeholder="https://yourdomain.com/ads/banner.jpg"
              />
            </div>

            {/* Redirect URL */}
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>Redirect URL</label>
              <input
                type="text"
                value={form.redirectUrl}
                onChange={(e) => setForm(prev => ({ ...prev, redirectUrl: e.target.value }))}
                className="w-full border px-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
                style={inputStyle}
                placeholder="https://yoursite.com/landing"
              />
            </div>

            {/* VAST Tag */}
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>External HTML / VAST Tag (Optional)</label>
              <textarea
                value={form.vastTag}
                onChange={(e) => setForm(prev => ({ ...prev, vastTag: e.target.value }))}
                rows={3}
                className="w-full border px-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors resize-none font-mono"
                style={{ ...inputStyle, fontSize: '11px' }}
                placeholder='<script async src="..."></script>'
              />
            </div>
          </div>
        </Card>

        {/* RIGHT COLUMN — TARGETING & SETTINGS */}
        <Card>
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 mb-5" style={sectionHeaderStyle}>
            <SlidersHorizontal className="h-4 w-4" style={{ color: C.purple }} />
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: C.purple }}>TARGETING & SETTINGS</span>
          </div>

          <div className="space-y-4">
            {/* Target Devices */}
            <div>
              <label className="block text-[11px] font-medium mb-2" style={{ color: C.textSec }}>Target Devices</label>
              <div className="flex gap-2">
                {([
                  { key: 'desktop' as const, label: 'Desktop', icon: Monitor },
                  { key: 'mobile' as const, label: 'Mobile', icon: Smartphone },
                  { key: 'tablet' as const, label: 'Tablet', icon: Tablet },
                ]).map((d) => {
                  const isActive = form.devices[d.key]
                  const Icon = d.icon
                  return (
                    <button
                      key={d.key}
                      onClick={() => setForm(prev => ({ ...prev, devices: { ...prev.devices, [d.key]: !prev.devices[d.key] } }))}
                      className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-medium border transition-all"
                      style={{
                        borderColor: isActive ? `${C.success}40` : C.border,
                        background: isActive ? `${C.success}10` : 'rgba(255,255,255,0.02)',
                        color: isActive ? C.success : C.textTer,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>Country (Codes, comma separated)</label>
              <input
                type="text"
                value={form.countries}
                onChange={(e) => setForm(prev => ({ ...prev, countries: e.target.value }))}
                className="w-full border px-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
                style={inputStyle}
                placeholder="IN, US, GB"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>Category Filter (Optional)</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border px-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
                style={inputStyle}
                placeholder="e.g. Gaming, Entertainment"
              />
            </div>

            {/* Start / End Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: C.textDim }} />
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border pl-9 pr-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: C.textDim }} />
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border pl-9 pr-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
                    style={inputStyle}
                    placeholder="mm/dd/yyyy"
                  />
                </div>
              </div>
            </div>

            {/* CPM Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-medium" style={{ color: C.textSec }}>CPM / ( ₹ / 1000 Views )</label>
                <span className="text-[13px] font-bold" style={{ color: C.success }}>{form.cpm}</span>
              </div>
              <input
                type="range"
                min={1}
                max={500}
                value={form.cpm}
                onChange={(e) => setForm(prev => ({ ...prev, cpm: Number(e.target.value) }))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${C.success} ${((form.cpm - 1) / 499) * 100}%, rgba(255,255,255,0.06) ${((form.cpm - 1) / 499) * 100}%)` }}
              />
            </div>

            {/* CPC Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-medium" style={{ color: C.textSec }}>CPC / ( ₹ / Click )</label>
                <span className="text-[13px] font-bold" style={{ color: C.success }}>{form.cpc}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={form.cpc}
                onChange={(e) => setForm(prev => ({ ...prev, cpc: Number(e.target.value) }))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${C.success} ${((form.cpc - 1) / 49) * 100}%, rgba(255,255,255,0.06) ${((form.cpc - 1) / 49) * 100}%)` }}
              />
            </div>

            {/* A/B Test Group */}
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textSec }}>A/B Test Group Name (Optional)</label>
              <input
                type="text"
                value={form.abGroup}
                onChange={(e) => setForm(prev => ({ ...prev, abGroup: e.target.value }))}
                className="w-full border px-3.5 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20 transition-colors"
                style={inputStyle}
                placeholder="e.g. Header-Promo"
              />
              <p className="text-[9px] mt-1.5 flex items-center gap-1" style={{ color: C.textDim }}>
                <Info className="h-3 w-3" />
                Ads with the same group name will be shown 50/50 in the same slot for A/B testing
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Bottom Row: Ad Preview + Estimated Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* AD PREVIEW */}
        <Card>
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 mb-4" style={sectionHeaderStyle}>
            <Eye className="h-4 w-4" style={{ color: C.purple }} />
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: C.purple }}>AD PREVIEW</span>
          </div>
          <p className="text-[10px] mb-3" style={{ color: C.textDim }}>This is how your ad will look like</p>
          {showPreview ? (
            <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: `${C.success}20` }}>
              <div className="relative h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.success}15, ${C.success}05)` }}>
                {form.mediaUrl ? (
                  <img src={form.mediaUrl} alt="Ad Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: `${C.success}15` }}>
                      <ImageIcon className="h-8 w-8" style={{ color: C.success }} />
                    </div>
                    <p className="text-sm font-semibold text-white">{form.title || 'Your Ad Title'}</p>
                    <p className="text-[11px]" style={{ color: C.textTer }}>Ad preview will appear here</p>
                  </div>
                )}
                {/* Overlay badge */}
                <div className="absolute bottom-2 right-2 rounded-lg px-2 py-1 text-[9px] font-medium text-white" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                  {form.type.toUpperCase()} • {form.placement.toUpperCase()}
                </div>
              </div>
              <div className="p-3 flex items-center justify-between border-t" style={{ borderColor: C.border }}>
                <span className="text-[11px] font-medium text-white">{form.title || 'Untitled Ad'}</span>
                <button className="rounded-lg px-3 py-1 text-[10px] font-semibold text-white" style={{ background: C.success }}>SHOP NOW</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center" style={{ borderColor: C.border }}>
              <ImageIcon className="h-10 w-10 mb-2" style={{ color: C.textDim }} />
              <p className="text-sm font-medium text-white">Click &quot;Preview&quot; to see your ad</p>
              <p className="text-[10px] mt-1" style={{ color: C.textDim }}>Preview may not be exact on all devices</p>
            </div>
          )}
        </Card>

        {/* ESTIMATED SUMMARY */}
        <Card>
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 mb-4" style={sectionHeaderStyle}>
            <TrendingUp className="h-4 w-4" style={{ color: C.purple }} />
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: C.purple }}>ESTIMATED SUMMARY</span>
          </div>
          <p className="text-[10px] mb-4" style={{ color: C.textDim }}>Estimated impressions in next 30 days</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {/* Est. Impressions */}
            <div className="flex flex-col items-center gap-2 rounded-xl p-3 text-center border" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.success}15` }}>
                <Eye className="h-5 w-5" style={{ color: C.success }} />
              </div>
              <p className="text-lg font-bold text-white">{fmt(estImpressions)}</p>
              <span className="text-[9px]" style={{ color: C.textDim }}>/ 30 days</span>
              <span className="text-[9px] font-medium" style={{ color: C.textTer }}>Est. Impressions</span>
            </div>

            {/* Est. Clicks */}
            <div className="flex flex-col items-center gap-2 rounded-xl p-3 text-center border" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.purple}15` }}>
                <MousePointer className="h-5 w-5" style={{ color: C.purple }} />
              </div>
              <p className="text-lg font-bold text-white">{fmt(estClicks)}</p>
              <span className="text-[9px]" style={{ color: C.textDim }}>/ 30 days</span>
              <span className="text-[9px] font-medium" style={{ color: C.textTer }}>Est. Clicks</span>
            </div>

            {/* Est. Revenue */}
            <div className="flex flex-col items-center gap-2 rounded-xl p-3 text-center border" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.success}15` }}>
                <DollarSign className="h-5 w-5" style={{ color: C.success }} />
              </div>
              <p className="text-lg font-bold text-white">₹{estRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <span className="text-[9px]" style={{ color: C.textDim }}>/ 30 days</span>
              <span className="text-[9px] font-medium" style={{ color: C.textTer }}>Est. Revenue</span>
            </div>
          </div>

          {/* Quick Summary Bar */}
          <div className="rounded-xl border p-3" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3.5 w-3.5 flex-shrink-0" style={{ color: C.warning }} />
              <span className="text-[9px] font-medium" style={{ color: C.textTer }}>Estimates are based on your CPM, CPC and Historical data</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="flex justify-between">
                <span style={{ color: C.textDim }}>Targeting</span>
                <span style={{ color: C.textSec }}>{selectedDevices} device{selectedDevices !== 1 ? 's' : ''} • {form.countries || 'All'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: C.textDim }}>Type</span>
                <span style={{ color: C.textSec }} className="capitalize">{form.type} • {form.placement}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   RTMP CONFIG PAGE
   ═══════════════════════════════════════════════════════════════ */

function RTMPConfigPage() {
  const [streamKey] = useState(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'sk-'
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')
  const [testing, setTesting] = useState(false)
  const [autoRecord, setAutoRecord] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const rtmpUrl = 'rtmp://localhost:1935/live'
  const hlsUrl = `http://localhost:8000/live/${streamKey}.m3u8`

  const testConnection = async () => {
    setTesting(true)
    try {
      const res = await fetch('http://localhost:8001/health')
      if (res.ok) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
      }
    } catch {
      setConnectionStatus('disconnected')
    } finally {
      setTesting(false)
    }
  }

  // Auto-test on mount
  useEffect(() => {
    testConnection()
  }, [])

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    borderColor: C.border,
    borderRadius: 12,
  }

  return (
    <div className="space-y-4 fade-in-up">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.purple}15` }}>
          <Radio className="h-5 w-5" style={{ color: C.purple }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">RTMP Configuration</h2>
          <p className="text-xs" style={{ color: C.textTer }}>OBS streaming server setup and configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Left Column - Config */}
        <div className="space-y-4">
          {/* Connection Status */}
          <Card>
            <CardHeader title="Connection Status">
              <button onClick={testConnection} disabled={testing} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium border transition-colors hover:bg-white/[0.04]" style={{ borderColor: C.border, color: C.textSec }}>
                {testing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3" />}
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </CardHeader>
            <div className="flex items-center gap-4 py-3">
              <div className="relative flex items-center justify-center">
                <span className={`absolute h-14 w-14 rounded-full ${connectionStatus === 'connected' ? 'animate-ping' : ''}`} style={{ background: `${connectionStatus === 'connected' ? C.success : connectionStatus === 'disconnected' ? C.accent : C.textDim}20` }} />
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full" style={{ background: `${connectionStatus === 'connected' ? C.success : connectionStatus === 'disconnected' ? C.accent : C.textDim}20` }}>
                  {connectionStatus === 'connected' ? (
                    <CheckCircle className="h-7 w-7" style={{ color: C.success }} />
                  ) : connectionStatus === 'disconnected' ? (
                    <XCircle className="h-7 w-7" style={{ color: C.accent }} />
                  ) : (
                    <Server className="h-7 w-7" style={{ color: C.textDim }} />
                  )}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: connectionStatus === 'connected' ? C.success : connectionStatus === 'disconnected' ? C.accent : C.textTer }}>
                  {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: C.textTer }}>
                  {connectionStatus === 'connected' ? 'RTMP server is reachable and healthy' : connectionStatus === 'disconnected' ? 'Could not reach the RTMP server' : 'Testing server connection...'}
                </p>
              </div>
            </div>
          </Card>

          {/* Server Configuration */}
          <Card>
            <CardHeader title="Server Configuration" />
            <div className="space-y-4">
              {/* Server URL */}
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Server URL</label>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={rtmpUrl} className="flex-1 border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none" style={inputStyle} />
                  <button onClick={() => handleCopy(rtmpUrl, 'url')} className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-white/[0.05]" style={{ borderColor: C.border }}>
                    {copiedField === 'url' ? <Check className="h-4 w-4" style={{ color: C.success }} /> : <Copy className="h-4 w-4" style={{ color: C.textTer }} />}
                  </button>
                </div>
              </div>

              {/* Stream Key */}
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Stream Key (Auto-Generated)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input type={showKey ? 'text' : 'password'} readOnly value={streamKey} className="w-full border px-3 py-2.5 pr-10 text-sm text-white bg-transparent focus:outline-none" style={inputStyle} />
                    <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 transition-colors hover:bg-white/[0.05] rounded">
                      <Eye className="h-4 w-4" style={{ color: C.textTer }} />
                    </button>
                  </div>
                  <button onClick={() => handleCopy(streamKey, 'key')} className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-white/[0.05]" style={{ borderColor: C.border }}>
                    {copiedField === 'key' ? <Check className="h-4 w-4" style={{ color: C.success }} /> : <Copy className="h-4 w-4" style={{ color: C.textTer }} />}
                  </button>
                </div>
              </div>

              {/* HLS URL */}
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>HLS Playback URL</label>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={hlsUrl} className="flex-1 border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none" style={inputStyle} />
                  <button onClick={() => handleCopy(hlsUrl, 'hls')} className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-white/[0.05]" style={{ borderColor: C.border }}>
                    {copiedField === 'hls' ? <Check className="h-4 w-4" style={{ color: C.success }} /> : <Copy className="h-4 w-4" style={{ color: C.textTer }} />}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Auto Record Toggle */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${C.accent}15` }}>
                  <Film className="h-4 w-4" style={{ color: C.accent }} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">Auto-Record Streams</p>
                  <p className="text-[11px]" style={{ color: C.textTer }}>Automatically save live streams as recordings</p>
                </div>
              </div>
              <button
                onClick={() => setAutoRecord(!autoRecord)}
                className="relative h-6 w-11 rounded-full transition-colors cursor-pointer"
                style={{ background: autoRecord ? C.success : 'rgba(255,255,255,0.08)' }}
              >
                <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform" style={{ transform: autoRecord ? 'translateX(22px)' : 'translateX(2px)' }} />
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column - OBS Setup */}
        <div className="space-y-4">
          {/* OBS Setup Instructions */}
          <Card>
            <CardHeader title="OBS Setup Instructions">
              <StatusBadge text={connectionStatus === 'connected' ? 'Ready' : 'Not Ready'} color={connectionStatus === 'connected' ? C.success : C.warning} />
            </CardHeader>
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="h-4 w-4" style={{ color: C.info }} />
                <span className="text-xs font-semibold text-white">Step-by-step OBS Configuration</span>
              </div>
              <ol className="space-y-3">
                {[
                  { step: 1, text: 'Open OBS Studio' },
                  { step: 2, text: 'Go to Settings > Stream' },
                  { step: 3, text: 'Service: Select "Custom"' },
                  { step: 4, text: `Server: ${rtmpUrl}` },
                  { step: 5, text: `Stream Key: ${streamKey}` },
                  { step: 6, text: 'Click "Start Streaming"' },
                ].map((item) => (
                  <li key={item.step} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5" style={{ background: `${C.accent}30` }}>
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px]" style={{ color: C.textSec }}>{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                <button
                  onClick={() => { handleCopy(rtmpUrl, 'url'); handleCopy(streamKey, 'key') }}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-medium transition-colors hover:bg-white/[0.05] border"
                  style={{ borderColor: C.border, color: C.textSec }}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy All Config
                </button>
                <span className="text-[10px]" style={{ color: C.textDim }}>
                  {connectionStatus === 'connected' ? (
                    <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" style={{ color: C.success }} /> Server is ready</span>
                  ) : (
                    <span className="flex items-center gap-1"><XCircle className="h-3 w-3" style={{ color: C.accent }} /> Server is not reachable</span>
                  )}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Info Cards */}
          <Card>
            <CardHeader title="Stream URLs Summary" />
            <div className="space-y-3">
              {[
                { label: 'RTMP Server', value: rtmpUrl, color: C.purple },
                { label: 'HLS Stream', value: hlsUrl, color: C.info },
                { label: 'API Health', value: 'http://localhost:8001/health', color: C.success },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{item.label}</span>
                    <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  </div>
                  <p className="text-[11px] font-mono break-all" style={{ color: C.textSec }}>{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Important Notice */}
          <Card style={{ borderColor: `${C.warning}30` }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: C.warning }} />
              <div>
                <p className="text-[13px] font-semibold text-white">Important Notice</p>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.textTer }}>
                  Keep your stream key secret. Do not share it publicly. If compromised, regenerate a new key immediately.
                  The RTMP server must be running and accessible for streaming to work properly.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VIDEO UPLOAD PAGE — Exact match to reference screenshot
   ═══════════════════════════════════════════════════════════════ */

function VideoUploadPage() {
  const [activeTab, setActiveTab] = useState<'video' | 'thumbnail'>('video')
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedThumb, setSelectedThumb] = useState(0)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Travel & Nature',
    quality: '1080p',
    duration: '',
    featured: false,
    trending: false,
    live: false,
  })

  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch('/api/videos')
      if (res.ok) {
        const data = await res.json()
        setVideos(Array.isArray(data) ? data : data.videos || [])
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchVideos() }, [fetchVideos])

  const [videoUploadProgress, setVideoUploadProgress] = useState<UploadProgress | null>(null)
  const videoUploadCancelRef = useRef<(() => void) | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setVideoUploadProgress({ percent: 0, loaded: 0, total: file.size, speed: 0, eta: 0, status: 'uploading' })
    try {
      const { promise, cancel } = uploadFile(file, setVideoUploadProgress, { type: 'video' })
      videoUploadCancelRef.current = cancel
      const result = await promise
      if (result.success) {
        setVideoUrl(result.url || result.fileUrl || '')
        setUploadedFile(file)
      }
    } catch { /* ignore */ }
    finally { setUploading(false); videoUploadCancelRef.current = null }
  }

  const handleVideoSubmit = async () => {
    if (!form.title || !videoUrl) return
    setCreating(true)
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          thumbnail: '',
          duration: form.duration || '00:00',
          videoUrl,
          isFeatured: form.featured,
        }),
      })
      if (res.ok) {
        setForm({ title: '', description: '', category: 'Travel & Nature', quality: '1080p', duration: '', featured: false, trending: false, live: false })
        setVideoUrl('')
        setUploadedFile(null)
        fetchVideos()
      }
    } catch { /* ignore */ }
    finally { setCreating(false) }
  }

  const handleDeleteVideo = async (id: string) => {
    try {
      await fetch('/api/videos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      fetchVideos()
    } catch { /* ignore */ }
  }

  const sampleThumbs = [
    '/sportix/stadium-preview.png',
    '/sportix/cricket-stadium.png',
    '/sportix/stadium-preview.png',
    '/sportix/cricket-stadium.png',
  ]

  const fieldStyle: React.CSSProperties = {
    background: '#2d2d2d',
    borderColor: '#4a5568',
    borderRadius: 8,
  }

  return (
    <div className="space-y-0 fade-in-up">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: '#333' }}>
        <div>
          <h2 className="text-[20px] font-semibold text-white">Upload Video</h2>
          <p className="text-[13px] mt-1" style={{ color: '#9ca3af' }}>Upload your video — preview is auto-generated</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b" style={{ borderColor: '#333' }}>
        <button
          className="flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition-all"
          style={{
            color: activeTab === 'video' ? '#ef4444' : '#6b7280',
            borderColor: activeTab === 'video' ? '#ef4444' : 'transparent',
            background: 'transparent',
          }}
        >
          <Video className="h-4 w-4" /> Video
        </button>
        <button
          className="flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition-all"
          style={{
            color: activeTab === 'thumbnail' ? '#ef4444' : '#6b7280',
            borderColor: activeTab === 'thumbnail' ? '#ef4444' : 'transparent',
            background: 'transparent',
          }}
        >
          <ImageIcon className="h-4 w-4" /> Thumbnail
        </button>
      </div>

      {/* ── Two Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 pt-6">
        {/* LEFT — Upload Video */}
        <div className="space-y-6">
          <div className="rounded-lg p-5 md:p-6" style={{ background: '#1f2937' }}>
            {/* Section 1 Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: '#ef4444' }}>1</span>
                <h3 className="text-[16px] font-semibold text-white">Upload Video</h3>
              </div>
              {uploadedFile && videoUrl && (
                <div className="flex items-center gap-3">
                  <button onClick={() => setUploadedFile(null)} className="text-[13px] font-medium" style={{ color: '#ef4444' }}>Change File</button>
                  <button onClick={() => { setUploadedFile(null); setVideoUrl('') }}>
                    <Trash2 className="h-4 w-4" style={{ color: '#9ca3af' }} />
                  </button>
                </div>
              )}
            </div>

            {/* File Info (shown after upload) */}
            {uploadedFile && videoUrl && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-14 rounded overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: '#4a5568' }}>
                    <Play className="h-4 w-4 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">{uploadedFile.name}</p>
                    <p className="text-[12px]" style={{ color: '#9ca3af' }}>
                      1920 × 1080 • {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB • 00:01:28
                    </p>
                  </div>
                  <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: '#22c55e' }}>
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>

                {/* Video Player */}
                <div className="rounded-lg overflow-hidden" style={{ background: '#111827' }}>
                  <video src={videoUrl} controls className="w-full aspect-video object-cover" />
                </div>
              </div>
            )}

            {/* Upload Area (shown when no file) */}
            {!uploadedFile && !videoUrl && (
              <div className="space-y-4">
                {uploading && videoUploadProgress ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10" style={{ borderColor: '#4a5568' }}>
                    <div className="h-8 w-8 animate-spin rounded-full border-2 mb-3" style={{ borderColor: '#4a5568', borderTopColor: '#ef4444' }} />
                    <p className="text-[13px] text-white mb-2">{videoUploadProgress.percent}% Uploading</p>
                    <div className="w-full max-w-[300px] h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${videoUploadProgress.percent}%`, background: '#ef4444' }} />
                    </div>
                    <p className="text-[11px] mt-2 text-center" style={{ color: '#9ca3af' }}>
                      {getUploadStatusMessage(videoUploadProgress)}
                    </p>
                    <button type="button" onClick={() => videoUploadCancelRef.current?.()} className="text-[11px] font-medium mt-2 px-3 py-1 rounded-lg transition-colors hover:bg-gray-700" style={{ color: '#ef4444' }}>
                      Cancel Upload
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 cursor-pointer transition-all hover:border-gray-500" style={{ borderColor: '#4a5568' }}>
                    <CloudUpload className="h-8 w-8 mb-2" style={{ color: '#ef4444' }} />
                    <p className="text-[14px] text-white mb-1">Drag & drop your video here</p>
                    <p className="text-[13px]" style={{ color: '#ef4444' }}>or click to browse files</p>
                    <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}

                {/* OR */}
                <div className="text-center">
                  <p className="text-[13px] mb-4" style={{ color: '#9ca3af' }}>OR</p>
                  <div className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2 cursor-pointer transition-colors hover:bg-gray-700" style={{ borderColor: '#4a5568' }}>
                    <Link2 className="h-4 w-4" style={{ color: '#d1d5db' }} />
                    <span className="text-[13px]" style={{ color: '#d1d5db' }}>Paste video URL</span>
                  </div>
                </div>
              </div>
            )}

            {/* Thumbnail Section */}
            <div className="mt-6 pt-5 border-t" style={{ borderColor: '#374151' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[14px] font-medium text-white">Thumbnail</h4>
                <label className="text-[13px] font-medium cursor-pointer" style={{ color: '#ef4444' }}>
                  Upload Manually
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
              <div className="flex gap-3 mb-3">
                {sampleThumbs.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedThumb(i)}
                    className="relative h-12 w-20 rounded overflow-hidden border-2 transition-all"
                    style={{
                      borderColor: selectedThumb === i ? '#ef4444' : '#4a5568',
                    }}
                  >
                    <img src={thumb} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5" style={{ color: '#9ca3af' }} />
                <p className="text-[12px]" style={{ color: '#9ca3af' }}>Video thumbnail and duration are auto-generated after upload.</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg p-4" style={{ background: '#1f2937' }}>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded flex-shrink-0 mt-0.5" style={{ background: '#ef4444' }}>
                <Info className="h-3 w-3 text-white" />
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: '#d1d5db' }}>
                By uploading, you confirm that you own the rights to this content and agree to our{' '}
                <span className="font-medium cursor-pointer" style={{ color: '#ef4444' }}>Terms of Service</span> and{' '}
                <span className="font-medium cursor-pointer" style={{ color: '#ef4444' }}>Community Guidelines</span>.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — Video Details */}
        <div>
          <div className="rounded-lg p-5 md:p-6" style={{ background: '#1f2937' }}>
            {/* Section 2 Header */}
            <div className="flex items-center gap-2 mb-6">
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: '#ef4444' }}>2</span>
              <h3 className="text-[16px] font-semibold text-white">Video Details</h3>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-[13px] mb-2" style={{ color: '#d1d5db' }}>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value.slice(0, 100) }))}
                  className="w-full border px-3 py-2 text-[13px] text-white focus:outline-none transition-colors"
                  style={fieldStyle}
                  placeholder="Enter video title..."
                />
                <div className="text-right text-[12px] mt-1" style={{ color: '#9ca3af' }}>{form.title.length}/100</div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] mb-2" style={{ color: '#d1d5db' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value.slice(0, 500) }))}
                  className="w-full border px-3 py-2 text-[13px] text-white focus:outline-none transition-colors resize-none"
                  style={{ ...fieldStyle, minHeight: 90 }}
                  placeholder="Describe your video..."
                  rows={4}
                />
                <div className="text-right text-[12px] mt-1" style={{ color: '#9ca3af' }}>{form.description.length}/500</div>
              </div>

              {/* Category + Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[13px] mb-2" style={{ color: '#d1d5db' }}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border px-3 py-2 text-[13px] text-white focus:outline-none cursor-pointer"
                    style={fieldStyle}
                  >
                    <option value="Travel & Nature" style={{ background: '#2d2d2d' }}>Travel & Nature</option>
                    <option value="Football" style={{ background: '#2d2d2d' }}>Football</option>
                    <option value="Basketball" style={{ background: '#2d2d2d' }}>Basketball</option>
                    <option value="Cricket" style={{ background: '#2d2d2d' }}>Cricket</option>
                    <option value="Tennis" style={{ background: '#2d2d2d' }}>Tennis</option>
                    <option value="Racing" style={{ background: '#2d2d2d' }}>Racing</option>
                    <option value="MMA" style={{ background: '#2d2d2d' }}>MMA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] mb-2" style={{ color: '#d1d5db' }}>Quality</label>
                  <select
                    value={form.quality}
                    onChange={(e) => setForm(prev => ({ ...prev, quality: e.target.value }))}
                    className="w-full border px-3 py-2 text-[13px] text-white focus:outline-none cursor-pointer"
                    style={fieldStyle}
                  >
                    <option value="4K" style={{ background: '#2d2d2d' }}>4K</option>
                    <option value="1080p" style={{ background: '#2d2d2d' }}>1080p</option>
                    <option value="720p" style={{ background: '#2d2d2d' }}>720p</option>
                    <option value="480p" style={{ background: '#2d2d2d' }}>480p</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[13px] mb-2" style={{ color: '#d1d5db' }}>Duration</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="flex-1 border px-3 py-2 text-[13px] text-white focus:outline-none transition-colors"
                    style={fieldStyle}
                    placeholder="00:00"
                  />
                  <div className="p-2 rounded-lg" style={{ background: '#2d2d2d', border: '1px solid #4a5568' }}>
                    <Clock className="h-4 w-4" style={{ color: '#9ca3af' }} />
                  </div>
                </div>
              </div>

              {/* Checkboxes — EXACTLY like screenshot */}
              <div className="flex items-center gap-6 pt-1">
                {[
                  { key: 'featured' as const, label: 'Featured' },
                  { key: 'trending' as const, label: 'Trending' },
                  { key: 'live' as const, label: 'Live' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="h-4 w-4 rounded focus:ring-red-500 accent-red-500"
                      style={{ background: '#374151', borderColor: '#4a5568' }}
                    />
                    <span className="text-[13px]" style={{ color: '#d1d5db' }}>{label}</span>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setForm({ title: '', description: '', category: 'Travel & Nature', quality: '1080p', duration: '', featured: false, trending: false, live: false })}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:opacity-90"
                  style={{ background: '#374151' }}
                >
                  <RefreshCw className="h-4 w-4" /> Clear
                </button>
                <button
                  onClick={handleVideoSubmit}
                  disabled={creating || !form.title || !videoUrl}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#ef4444' }}
                >
                  {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {creating ? 'Uploading...' : 'Upload Video'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recently Uploaded Videos ── */}
      <div className="mt-6 rounded-lg overflow-hidden" style={{ background: '#1f2937' }}>
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-[15px] font-semibold text-white">Recently Uploaded</h3>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>{videos.length} videos</span>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b" style={{ borderColor: '#374151', background: 'rgba(255,255,255,0.03)' }}>
                {['Title', 'Category', 'Duration', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {videos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Video className="h-8 w-8 mx-auto mb-2" style={{ color: '#4b5563' }} />
                    <p className="text-[13px]" style={{ color: '#9ca3af' }}>No videos uploaded yet</p>
                    <p className="text-[12px] mt-1" style={{ color: '#6b7280' }}>Upload your first video above</p>
                  </td>
                </tr>
              )}
              {videos.slice(0, 10).map((v) => (
                <tr key={v.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: '#374151' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {v.thumbnail && (
                        <div className="h-8 w-12 rounded-md overflow-hidden flex-shrink-0" style={{ background: '#374151' }}>
                          <img src={v.thumbnail} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <span className="text-[12px] font-medium text-white truncate max-w-[150px]">{v.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>{v.category || 'N/A'}</span>
                  </td>
                  <td className="px-5 py-3 text-[12px]" style={{ color: '#d1d5db' }}>{v.duration ? `${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}` : '—'}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: v.isFeatured ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)', color: v.isFeatured ? '#fbbf24' : '#4ade80' }}>
                      {v.isFeatured ? 'Featured' : 'Published'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDeleteVideo(v.id)} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: '#ef4444' }} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
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

/* ═══════════════════════════════════════════════════════════════
   CATEGORIES PAGE
   ═══════════════════════════════════════════════════════════════ */




/* ═══════════════════════════════════════════════════════════════
   VIDEO ADS ANALYTICS PAGE
   ═══════════════════════════════════════════════════════════════ */

type AnalyticsTab = 'overview' | 'timeline' | 'revenue' | 'performance' | 'creative' | 'creative-manager' | 'settings'

/* ── Upload Types ── */
type UploadStatus = 'idle' | 'uploading' | 'paused' | 'complete' | 'error' | 'cancelled'

interface UploadFile {
  id: string
  file: File
  status: UploadStatus
  progress: number        // 0-100
  uploadId?: string
  uploadedChunks: number
  totalChunks: number
  speed: number           // bytes per second
  uploadedBytes: number
  totalBytes: number
  url?: string           // final URL after upload
  error?: string
  startTime: number
  pausedAt?: number
  abortController?: AbortController
}
type AdFormat = 'video' | 'image' | 'overlay' | 'banner'
interface ManualAdEntry { id: string; position: number; format: AdFormat; enabled: boolean; label: string; duration: number; skipAfter: number }
interface TimelineAdEntry { position: number; format: AdFormat; label?: string; enabled?: boolean }
type AutoFrequency = 'off' | '5min' | '10min' | '15min' | 'custom'

const UPLOAD_LIMITS = {
  video: { maxSize: 5 * 1024 * 1024 * 1024, formats: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'], extensions: '.mp4,.webm,.mov,.ogg', label: '5 GB' },
  image: { maxSize: 10 * 1024 * 1024, formats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], extensions: '.jpg,.jpeg,.png,.webp,.gif', label: '10 MB' },
} as const

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatSpeed(bytesPerSec: number): string {
  return `${formatBytes(bytesPerSec)}/s`
}

function getUploadId(): string {
  return `ul_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const UNLIMITED_AD_RULES = [
  { range: 'Any Duration', ads: '∞', color: C.success, desc: '3 sec to 5+ hours' },
  { range: 'Manual Placement', ads: '∞', color: C.accent, desc: 'Click timeline or set time' },
  { range: 'Auto Frequency', ads: '∞', color: C.warning, desc: 'Every 5 / 10 / 15 min' },
  { range: '4 Ad Types', ads: '∞', color: C.info, desc: 'Video · Image · Overlay · Banner' },
  { range: 'No Min Gap', ads: '—', color: C.purple, desc: 'Full admin control' },
] as const

function getSmartAdSlots(totalMinutes: number, frequencyMin: number = 10): number[] {
  const totalSeconds = totalMinutes * 60
  if (totalSeconds < 3) return []
  const frequencySec = frequencyMin * 60
  let count: number
  if (totalSeconds < frequencySec) {
    count = 1
  } else {
    count = Math.floor(totalSeconds / frequencySec)
  }
  const interval = totalSeconds / (count + 1)
  return Array.from({ length: count }, (_, i) => Math.round(interval * (i + 1)))
}

const AD_FORMAT_CONFIG: Record<AdFormat, { emoji: string; label: string; color: string; icon: string }> = {
  video: { emoji: '🎬', label: 'Video', color: C.accent, icon: '▶' },
  image: { emoji: '🖼', label: 'Image', color: C.info, icon: '◼' },
  overlay: { emoji: '📢', label: 'Overlay', color: C.warning, icon: '◈' },
  banner: { emoji: '🎯', label: 'Banner', color: C.purple, icon: '◉' },
}

function formatSeconds(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function genId() { return Math.random().toString(36).slice(2, 9) }

/* ── Lazy-loaded sub-components to prevent full rerender ── */

function KPIStatsRow({ stats }: { stats: { label: string; value: string; change: string; positive: boolean; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; sparkline: number[] }[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map(s => {
        const Icon = s.icon
        return (
          <Card key={s.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{s.label}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${s.color}12` }}>
                <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] font-medium" style={{ color: s.positive ? C.success : C.accent }}>
                {s.positive ? <ArrowUpRight className="inline h-3 w-3 mr-0.5" /> : <ArrowDownRight className="inline h-3 w-3 mr-0.5" />}
                {s.change}
              </span>
              <MiniSparkline data={s.sparkline} color={s.color} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function TimelineVisualizer({ duration, adPositions, ads: adEntries, onTimelineClick, addableFormat }: { duration: number; adPositions: number[]; ads?: TimelineAdEntry[]; onTimelineClick?: (sec: number) => void; addableFormat?: AdFormat }) {
  const totalSec = duration * 60
  const getEntry = (pos: number) => adEntries?.find(e => e.position === pos)
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onTimelineClick) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onTimelineClick(Math.round(pct * totalSec))
  }
  return (
    <div>
      {/* Add Ad Marker Button */}
      {onTimelineClick && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {(['video', 'image', 'overlay', 'banner'] as AdFormat[]).map(fmt => (
              <button key={fmt} onClick={() => onTimelineClick(Math.round(totalSec / 2))}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all hover:scale-[1.03]"
                style={{ background: `${AD_FORMAT_CONFIG[fmt].color}10`, border: `1px solid ${AD_FORMAT_CONFIG[fmt].color}25`, color: AD_FORMAT_CONFIG[fmt].color }}>
                <span>{AD_FORMAT_CONFIG[fmt].emoji}</span> {AD_FORMAT_CONFIG[fmt].label}
              </button>
            ))}
          </div>
          <span className="text-[9px]" style={{ color: C.textDim }}>Click timeline to add · Or use buttons</span>
        </div>
      )}
      {/* Visual timeline bar — clickable */}
      <div
        className={`relative h-4 rounded-full overflow-visible mb-4 cursor-pointer group ${onTimelineClick ? 'hover:brightness-125' : ''}`}
        style={{ background: 'rgba(255,255,255,0.06)' }}
        onClick={handleClick}
        role={onTimelineClick ? 'button' : undefined}
        tabIndex={onTimelineClick ? 0 : undefined}
        aria-label={onTimelineClick ? 'Click to add ad marker' : undefined}
      >
        <div className="absolute inset-0 rounded-full transition-all" style={{ background: 'linear-gradient(90deg, rgba(229,9,20,0.15), rgba(229,9,20,0.05))' }} />
        {/* Click position indicator on hover */}
        {onTimelineClick && (
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: 'rgba(255,255,255,0.05)' }} />
        )}
        {adPositions.map((pos, i) => {
          const pct = Math.min((pos / totalSec) * 100, 98)
          const entry = getEntry(pos)
          const fmt = entry?.format || (addableFormat || (Math.random() > 0.4 ? 'video' : 'image'))
          const cfg = AD_FORMAT_CONFIG[fmt as AdFormat] || AD_FORMAT_CONFIG.video
          const isDisabled = entry?.enabled === false
          return (
            <div key={`${pos}-${i}`} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group/dot" style={{ left: `${pct}%` }}>
              <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-transform hover:scale-150 ${isDisabled ? 'opacity-40' : 'cursor-pointer'}`} style={{ background: cfg.color, boxShadow: `0 0 10px ${cfg.color}50` }}>
                <span className="text-[7px] leading-none">{cfg.icon}</span>
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/dot:block z-20">
                <div className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-white whitespace-nowrap" style={{ background: C.sidebar, border: `1px solid ${cfg.color}40` }}>
                  {cfg.emoji} {entry?.label || `Ad #${i + 1}`} · {formatSeconds(pos)}
                  {isDisabled && <span className="ml-1 text-white/40">(disabled)</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* Time markers */}
      <div className="flex justify-between mb-1">
        <span className="text-[9px] font-mono" style={{ color: C.textDim }}>0:00</span>
        <span className="text-[9px] font-mono" style={{ color: C.textDim }}>{formatSeconds(totalSec / 4)}</span>
        <span className="text-[9px] font-mono" style={{ color: C.textDim }}>{formatSeconds(totalSec / 2)}</span>
        <span className="text-[9px] font-mono" style={{ color: C.textDim }}>{formatSeconds(totalSec * 3 / 4)}</span>
        <span className="text-[9px] font-mono" style={{ color: C.textDim }}>{formatSeconds(totalSec)}</span>
      </div>
      {/* Ad list with type badges */}
      <div className="flex flex-wrap gap-2 mt-4 max-h-48 overflow-y-auto no-scrollbar">
        {adPositions.map((pos, i) => {
          const entry = getEntry(pos)
          const fmt = entry?.format || 'video'
          const cfg = AD_FORMAT_CONFIG[fmt as AdFormat] || AD_FORMAT_CONFIG.video
          const isDisabled = entry?.enabled === false
          return (
            <div key={`${pos}-${i}`} className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all hover:scale-[1.02] ${isDisabled ? 'opacity-40' : ''}`} style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}20` }}>
              <span className="text-[11px]">{cfg.emoji}</span>
              <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{entry?.label || `Ad #${i + 1}`}</span>
              <span className="text-[10px] text-white/40">@ {formatSeconds(pos)}</span>
              <StatusBadge text={cfg.label} color={cfg.color} />
            </div>
          )
        })}
        {adPositions.length === 0 && onTimelineClick && (
          <div className="flex items-center gap-2 py-2">
            <span className="text-[11px]" style={{ color: C.textDim }}>No ads placed yet —</span>
            <span className="text-[11px] font-medium" style={{ color: C.accent }}>Click timeline or use buttons above to add</span>
          </div>
        )}
        {adPositions.length === 0 && !onTimelineClick && (
          <span className="text-[11px] py-2" style={{ color: C.textDim }}>No ad slots for this duration</span>
        )}
      </div>
    </div>
  )
}

function ManualAdsManager({ adPlacements, onUpdate }: { adPlacements: ManualAdEntry[]; onUpdate: (entries: ManualAdEntry[]) => void }) {
  const [inputVal, setInputVal] = useState('')
  const [inputMode, setInputMode] = useState<'seconds' | 'minutes'>('minutes')
  const [addFormat, setAddFormat] = useState<AdFormat>('video')
  const [showAddForm, setShowAddForm] = useState(false)

  function handleAdd() {
    let sec = Number(inputVal)
    if (!sec || sec <= 0) return
    if (inputMode === 'minutes') sec = sec * 60
    const newEntry: ManualAdEntry = {
      id: genId(),
      position: sec,
      format: addFormat,
      enabled: true,
      label: `Ad #${adPlacements.length + 1}`,
      duration: addFormat === 'video' ? 8 : addFormat === 'image' ? 5 : addFormat === 'overlay' ? 10 : 6,
      skipAfter: addFormat === 'video' ? 5 : 3,
    }
    const sorted = [...adPlacements, newEntry].sort((a, b) => a.position - b.position)
    onUpdate(sorted)
    setInputVal('')
    setShowAddForm(false)
  }

  function handleAddAtPosition(sec: number, format: AdFormat) {
    const newEntry: ManualAdEntry = {
      id: genId(),
      position: sec,
      format,
      enabled: true,
      label: `Ad @ ${formatSeconds(sec)}`,
      duration: format === 'video' ? 8 : format === 'image' ? 5 : format === 'overlay' ? 10 : 6,
      skipAfter: format === 'video' ? 5 : 3,
    }
    const sorted = [...adPlacements, newEntry].sort((a, b) => a.position - b.position)
    onUpdate(sorted)
  }

  function handleRemove(id: string) {
    onUpdate(adPlacements.filter(e => e.id !== id))
  }

  function handleToggle(id: string) {
    onUpdate(adPlacements.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e))
  }

  function handleReorder(id: string, dir: 'up' | 'down') {
    const idx = adPlacements.findIndex(e => e.id === id)
    if (idx < 0) return
    const newIdx = dir === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= adPlacements.length) return
    const entries = [...adPlacements]
    // Swap positions
    const tempPos = entries[idx].position
    entries[idx] = { ...entries[idx], position: entries[newIdx].position }
    entries[newIdx] = { ...entries[newIdx], position: tempPos }
    onUpdate(entries.sort((a, b) => a.position - b.position))
  }

  function handleFormatChange(id: string, format: AdFormat) {
    onUpdate(adPlacements.map(e => e.id === id ? { ...e, format, duration: format === 'video' ? 8 : format === 'image' ? 5 : format === 'overlay' ? 10 : 6 } : e))
  }

  function handleLabelChange(id: string, label: string) {
    onUpdate(adPlacements.map(e => e.id === id ? { ...e, label } : e))
  }

  const enabledCount = adPlacements.filter(e => e.enabled).length
  const videoCount = adPlacements.filter(e => e.format === 'video').length
  const imageCount = adPlacements.filter(e => e.format === 'image').length
  const overlayCount = adPlacements.filter(e => e.format === 'overlay').length
  const bannerCount = adPlacements.filter(e => e.format === 'banner').length

  return (
    <div className="space-y-3">
      {/* Controls Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {!showAddForm ? (
          <button onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: C.accent }}>
            <Plus className="h-3.5 w-3.5" /> Add Ad Marker
          </button>
        ) : (
          <>
            <input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder={inputMode === 'minutes' ? 'e.g. 15' : 'e.g. 900'}
              autoFocus
              className="w-28 rounded-xl border px-3 py-2 text-xs text-white placeholder:text-white/20 bg-transparent focus:outline-none focus:ring-1"
              style={{ borderColor: C.border, background: `${C.sidebar}50` }}
            />
            <select value={inputMode} onChange={e => setInputMode(e.target.value as 'seconds' | 'minutes')}
              className="rounded-xl border px-3 py-2 text-xs text-white bg-transparent focus:outline-none"
              style={{ borderColor: C.border, background: C.sidebar }}>
              <option value="minutes">Min</option>
              <option value="seconds">Sec</option>
            </select>
            <select value={addFormat} onChange={e => setAddFormat(e.target.value as AdFormat)}
              className="rounded-xl border px-3 py-2 text-xs text-white bg-transparent focus:outline-none"
              style={{ borderColor: C.border, background: C.sidebar }}>
              {(['video', 'image', 'overlay', 'banner'] as AdFormat[]).map(f => (
                <option key={f} value={f}>{AD_FORMAT_CONFIG[f].emoji} {AD_FORMAT_CONFIG[f].label}</option>
              ))}
            </select>
            <button onClick={handleAdd}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: C.accent }}>
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
            <button onClick={() => { setShowAddForm(false); setInputVal('') }}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]"
              style={{ color: C.textTer, border: `1px solid ${C.border}` }}>
              Cancel
            </button>
          </>
        )}
        <div className="flex-1" />
        {/* Count badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge text={`${adPlacements.length} total`} color={C.success} />
          <StatusBadge text={`${enabledCount} active`} color={C.info} />
          {videoCount > 0 && <StatusBadge text={`${videoCount} 🎬`} color={C.accent} />}
          {imageCount > 0 && <StatusBadge text={`${imageCount} 🖼`} color={C.info} />}
          {overlayCount > 0 && <StatusBadge text={`${overlayCount} 📢`} color={C.warning} />}
          {bannerCount > 0 && <StatusBadge text={`${bannerCount} 🎯`} color={C.purple} />}
        </div>
      </div>

      {/* Ad Entries List */}
      {adPlacements.length > 0 && (
        <div className="space-y-1.5 max-h-72 overflow-y-auto no-scrollbar">
          {adPlacements.map((entry, i) => {
            const cfg = AD_FORMAT_CONFIG[entry.format]
            return (
              <div key={entry.id}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all group/entry ${entry.enabled ? 'hover:bg-white/[0.02]' : 'opacity-50'}`}
                style={{ background: `${cfg.color}04`, border: `1px solid ${cfg.color}15` }}>
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => handleReorder(entry.id, 'up')} disabled={i === 0}
                    className="p-0.5 rounded transition-colors hover:bg-white/[0.05] disabled:opacity-20" style={{ color: C.textDim }}>
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button onClick={() => handleReorder(entry.id, 'down')} disabled={i === adPlacements.length - 1}
                    className="p-0.5 rounded transition-colors hover:bg-white/[0.05] disabled:opacity-20" style={{ color: C.textDim }}>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                {/* Index */}
                <span className="text-[10px] font-bold w-5 text-center" style={{ color: cfg.color }}>#{i + 1}</span>
                {/* Enable/Disable */}
                <button onClick={() => handleToggle(entry.id)} title={entry.enabled ? 'Disable' : 'Enable'}
                  className="flex-shrink-0">
                  {entry.enabled
                    ? <CheckCircle className="h-4 w-4" style={{ color: C.success }} />
                    : <XCircle className="h-4 w-4" style={{ color: C.textDim }} />
                  }
                </button>
                {/* Format selector */}
                <select value={entry.format} onChange={e => handleFormatChange(entry.id, e.target.value as AdFormat)}
                  className="rounded-lg border px-1.5 py-1 text-[10px] text-white bg-transparent focus:outline-none"
                  style={{ borderColor: `${cfg.color}30`, background: `${cfg.color}08` }}>
                  {(['video', 'image', 'overlay', 'banner'] as AdFormat[]).map(f => (
                    <option key={f} value={f}>{AD_FORMAT_CONFIG[f].emoji} {AD_FORMAT_CONFIG[f].label}</option>
                  ))}
                </select>
                {/* Label (editable) */}
                <input value={entry.label} onChange={e => handleLabelChange(entry.id, e.target.value)}
                  className="flex-1 min-w-[80px] bg-transparent text-[11px] font-medium text-white border-none focus:outline-none placeholder:text-white/20"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                  placeholder="Ad label..." />
                {/* Timestamp */}
                <span className="text-[10px] font-mono text-white/50 whitespace-nowrap">{formatSeconds(entry.position)}</span>
                {/* Duration badge */}
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: `${cfg.color}10`, color: cfg.color }}>
                  {entry.duration}s{entry.skipAfter < entry.duration ? ` / ${entry.skipAfter}s skip` : ''}
                </span>
                {/* Remove */}
                <button onClick={() => handleRemove(entry.id)}
                  className="p-1 rounded-lg transition-colors hover:bg-white/[0.05] text-white/30 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {adPlacements.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: `1px dashed ${C.border}` }}>
          <Plus className="h-4 w-4" style={{ color: C.textDim }} />
          <span className="text-[11px]" style={{ color: C.textDim }}>No ads placed — Click "Add Ad Marker" to start placing unlimited ads</span>
        </div>
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════
   SCHEDULES PAGE
   ═══════════════════════════════════════════════════ */

const schedulesData = [
  { id: 1, title: 'India vs Australia - 3rd T20I', homeTeam: 'India', awayTeam: 'Australia', league: 'T20I', sport: 'Cricket', date: 'Today', time: '8:00 PM', status: 'live', venue: 'Wankhede Stadium', homeScore: 0, awayScore: 0 },
  { id: 2, title: 'Arsenal vs Chelsea - EPL Matchday 34', homeTeam: 'Arsenal', awayTeam: 'Chelsea', league: 'EPL', sport: 'Football', date: 'Today', time: '8:30 PM', status: 'live', venue: 'Emirates Stadium', homeScore: 2, awayScore: 1 },
  { id: 3, title: 'Lakers vs Celtics - Game 5', homeTeam: 'Lakers', awayTeam: 'Celtics', league: 'NBA', sport: 'Basketball', date: 'Today', time: '9:30 PM', status: 'live', venue: 'Crypto.com Arena', homeScore: 0, awayScore: 0 },
  { id: 4, title: 'Real Madrid vs Atlético - La Liga', homeTeam: 'Real Madrid', awayTeam: 'Atlético Madrid', league: 'La Liga', sport: 'Football', date: 'Tomorrow', time: '8:00 PM', status: 'upcoming', venue: 'Santiago Bernabéu', homeScore: 0, awayScore: 0 },
  { id: 5, title: 'Ferrari vs Red Bull - Monaco GP', homeTeam: 'Ferrari', awayTeam: 'Red Bull', league: 'F1', sport: 'Racing', date: 'Tomorrow', time: '2:00 PM', status: 'upcoming', venue: 'Circuit de Monaco', homeScore: 0, awayScore: 0 },
  { id: 6, title: 'Djokovic vs Alcaraz - SF', homeTeam: 'Djokovic', awayTeam: 'Alcaraz', league: 'Wimbledon', sport: 'Tennis', date: 'Tomorrow', time: '10:00 AM', status: 'upcoming', venue: 'Centre Court', homeScore: 0, awayScore: 0 },
  { id: 7, title: 'Man United vs Liverpool - EPL', homeTeam: 'Man United', awayTeam: 'Liverpool', league: 'EPL', sport: 'Football', date: 'Sat, Jun 7', time: '5:30 PM', status: 'upcoming', venue: 'Old Trafford', homeScore: 0, awayScore: 0 },
  { id: 8, title: 'PSG vs AC Milan - UCL SF', homeTeam: 'PSG', awayTeam: 'AC Milan', league: 'UCL', sport: 'Football', date: 'Sun, Jun 8', time: '7:00 PM', status: 'upcoming', venue: 'Parc des Princes', homeScore: 0, awayScore: 0 },
  { id: 9, title: 'Warriors vs Bucks - Game 3', homeTeam: 'Warriors', awayTeam: 'Bucks', league: 'NBA', sport: 'Basketball', date: 'Mon, Jun 9', time: '8:00 PM', status: 'upcoming', venue: 'Chase Center', homeScore: 0, awayScore: 0 },
  { id: 10, title: 'Barcelona vs Bayern Munich - UCL QF', homeTeam: 'Barcelona', awayTeam: 'Bayern Munich', league: 'UCL', sport: 'Football', date: 'Yesterday', time: '8:00 PM', status: 'completed', venue: 'Camp Nou', homeScore: 3, awayScore: 2 },
  { id: 11, title: 'India vs England - T20 WC Final', homeTeam: 'India', awayTeam: 'England', league: 'T20 WC', sport: 'Cricket', date: 'Yesterday', time: '7:30 PM', status: 'completed', venue: 'MCG Melbourne', homeScore: 198, awayScore: 175 },
  { id: 12, title: 'McLaren vs Mercedes - Spanish GP', homeTeam: 'McLaren', awayTeam: 'Mercedes', league: 'F1', sport: 'Racing', date: 'Last Week', time: '2:00 PM', status: 'completed', venue: 'Circuit de Barcelona', homeScore: 0, awayScore: 0 },
  { id: 13, title: 'Rohit Sharma vs Babar Azam', homeTeam: 'India', awayTeam: 'Pakistan', league: 'Asia Cup', sport: 'Cricket', date: 'Last Week', time: '3:00 PM', status: 'cancelled', venue: 'Galle Stadium', homeScore: 0, awayScore: 0 },
  { id: 14, title: 'Makhachev vs Oliveira - UFC 312', homeTeam: 'Makhachev', awayTeam: 'Oliveira', league: 'UFC', sport: 'MMA', date: '2 Days Ago', time: '10:00 PM', status: 'completed', venue: 'T-Mobile Arena', homeScore: 0, awayScore: 0 },
]

function SchedulesPage() {
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed' | 'cancelled'>('all')
  const [sportFilter, setSportFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<typeof schedulesData[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null)
  const [schedules, setSchedules] = useState(schedulesData)

  const sportOptions = ['all', 'Football', 'Cricket', 'Basketball', 'Tennis', 'Racing', 'MMA']

  const filtered = schedules.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false
    if (sportFilter !== 'all' && s.sport !== sportFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return s.homeTeam.toLowerCase().includes(q) || s.awayTeam.toLowerCase().includes(q) || s.league.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
    }
    return true
  })

  const stats = [
    { label: 'Total Matches', value: schedules.length, icon: Calendar, color: C.info },
    { label: 'Live Now', value: schedules.filter(s => s.status === 'live').length, icon: Radio, color: C.accent },
    { label: 'Upcoming', value: schedules.filter(s => s.status === 'upcoming').length, icon: Clock, color: C.warning },
    { label: 'Completed', value: schedules.filter(s => s.status === 'completed').length, icon: CheckCircle, color: C.success },
  ]

  const handleDelete = (id: number) => {
    setSchedules(prev => prev.filter(s => s.id !== id))
    setSelectedSchedule(null)
  }

  const handleToggleStatus = (id: number) => {
    setSchedules(prev => prev.map(s => {
      if (s.id !== id) return s
      const next: Record<string, string> = { upcoming: 'live', live: 'completed', completed: 'upcoming', cancelled: 'upcoming' }
      return { ...s, status: (next[s.status] || 'upcoming') as any }
    }))
  }

  return (
    <div className="space-y-4 fade-in-up">
      {/* Header */}
      <PageHeader title="Schedules" subtitle={`${schedules.length} total matches managed`} icon={<CalendarClock className="h-5 w-5" style={{ color: C.info }} />} extra={
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]" style={{ background: C.info }}>
          <Plus className="h-3.5 w-3.5" /> Add Match
        </button>
      } />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{s.label}</span>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
            <Search className="h-4 w-4" style={{ color: C.textDim }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search teams, leagues..." className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none" />
          </div>

          {/* Status Filter */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(['all', 'live', 'upcoming', 'completed', 'cancelled'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                filter === f ? 'text-white' : 'hover:bg-white/[0.04]'
              }`} style={{ background: filter === f ? C.info + '20' : 'transparent', color: filter === f ? C.info : C.textTer }}>
                {f === 'all' ? 'All' : f === 'live' ? '🔴 Live' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Sport Filter */}
          <select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-[12px] font-medium focus:outline-none" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)', color: C.textSec }}>
            {sportOptions.map(s => <option key={s} value={s} style={{ background: C.card }}>{s === 'all' ? 'All Sports' : s}</option>)}
          </select>

          {/* View Toggle */}
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
            <button onClick={() => setViewMode('table')} className={`px-2.5 py-1.5 text-[11px] transition-all`} style={{ background: viewMode === 'table' ? C.info + '20' : 'transparent', color: viewMode === 'table' ? C.info : C.textDim }}><List className="h-3.5 w-3.5" /></button>
            <button onClick={() => setViewMode('card')} className={`px-2.5 py-1.5 text-[11px] transition-all`} style={{ background: viewMode === 'card' ? C.info + '20' : 'transparent', color: viewMode === 'card' ? C.info : C.textDim }}><LayoutGrid className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </Card>

      {/* Table View */}
      {viewMode === 'table' ? (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                  {['Match', 'League', 'Date & Time', 'Sport', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b transition-colors hover:bg-white/[0.02] cursor-pointer" style={{ borderColor: C.border }} onClick={() => setSelectedSchedule(selectedSchedule === String(s.id) ? null : String(s.id))}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {s.status === 'live' && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
                        <div>
                          <p className="text-[12px] font-semibold text-white">{s.homeTeam} vs {s.awayTeam}</p>
                          <p className="text-[10px]" style={{ color: C.textDim }}>{s.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ background: `${C.info}12`, color: C.info }}>{s.league}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[11px] text-white">{s.date}</p>
                        <p className="text-[10px]" style={{ color: C.textTer }}>{s.time}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px]" style={{ color: C.textSec }}>{s.sport}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge text={s.status} color={s.status === 'live' ? C.accent : s.status === 'upcoming' ? C.warning : s.status === 'completed' ? C.success : C.textDim} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleToggleStatus(s.id)} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" title="Toggle status" style={{ color: C.textTer }}><RefreshCw className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setEditingSchedule(s)} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" title="Edit" style={{ color: C.textTer }}><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(s.id)} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" title="Delete" style={{ color: C.accent }}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-10 w-10 mb-2" style={{ color: C.textDim }} />
              <p className="text-sm" style={{ color: C.textTer }}>No schedules found</p>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: C.border }}>
            <span className="text-[11px]" style={{ color: C.textTer }}>Showing {filtered.length} of {schedules.length} matches</span>
          </div>
        </Card>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(s => (
            <Card key={s.id} className="!cursor-pointer hover:border-white/12" onClick={() => setSelectedSchedule(selectedSchedule === String(s.id) ? null : String(s.id))}>
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <StatusBadge text={s.status} color={s.status === 'live' ? C.accent : s.status === 'upcoming' ? C.warning : s.status === 'completed' ? C.success : C.textDim} />
                <span className="text-[10px]" style={{ color: C.textDim }}>{s.league}</span>
              </div>
              {/* Teams */}
              <div className="flex items-center justify-between rounded-xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-center flex-1">
                  <p className="text-xs font-bold text-white truncate">{s.homeTeam}</p>
                </div>
                <div className="px-3 text-center">
                  {s.status === 'completed' ? (
                    <p className="text-lg font-black text-white">{s.homeScore} <span style={{ color: C.textDim }}>-</span> {s.awayScore}</p>
                  ) : (
                    <span className="text-[10px] font-bold" style={{ color: C.accent }}>VS</span>
                  )}
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs font-bold text-white truncate">{s.awayTeam}</p>
                </div>
              </div>
              {/* Info row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" style={{ color: C.textDim }} />
                  <span className="text-[11px]" style={{ color: C.textTer }}>{s.date} · {s.time}</span>
                </div>
                <span className="text-[10px] rounded-full px-2 py-0.5" style={{ background: 'rgba(255,255,255,0.05)', color: C.textDim }}>{s.sport}</span>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: C.border }} onClick={e => e.stopPropagation()}>
                <button onClick={() => handleToggleStatus(s.id)} className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-medium border transition-all hover:bg-white/[0.04]" style={{ borderColor: C.border, color: C.textSec }}>
                  <RefreshCw className="h-3 w-3" /> Toggle
                </button>
                <button onClick={() => setEditingSchedule(s)} className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-medium border transition-all hover:bg-white/[0.04]" style={{ borderColor: C.border, color: C.textSec }}>
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => handleDelete(s.id)} className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-all hover:opacity-80" style={{ background: `${C.accent}15`, color: C.accent }}>
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <Calendar className="h-10 w-10 mb-2" style={{ color: C.textDim }} />
              <p className="text-sm" style={{ color: C.textTer }}>No schedules found</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Schedule Detail Panel */}
      {selectedSchedule && (
        <Card className="fade-in-up">
          {(() => {
            const s = schedules.find(x => String(x.id) === selectedSchedule)
            if (!s) return null
            return (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.info}15` }}>
                    <Eye className="h-5 w-5" style={{ color: C.info }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{s.homeTeam} vs {s.awayTeam}</p>
                    <p className="text-[11px]" style={{ color: C.textTer }}>{s.league} · {s.sport} · {s.date} at {s.time}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSchedule(null)} className="rounded-lg p-1.5 hover:bg-white/[0.05]" style={{ color: C.textDim }}><X className="h-4 w-4" /></button>
              </div>
            )
          })()}
        </Card>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingSchedule) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowAddModal(false); setEditingSchedule(null) }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl border p-5 fade-in-up" style={{ background: C.card, borderColor: C.border }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">{editingSchedule ? 'Edit Match' : 'Add New Match'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingSchedule(null) }} className="rounded-lg p-1.5 hover:bg-white/[0.05]" style={{ color: C.textDim }}><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textDim }}>Home Team</label>
                  <input type="text" placeholder="e.g. India" className="w-full rounded-xl border px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0071eb]/40" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textDim }}>Away Team</label>
                  <input type="text" placeholder="e.g. Australia" className="w-full rounded-xl border px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0071eb]/40" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textDim }}>League</label>
                  <input type="text" placeholder="e.g. IPL, EPL" className="w-full rounded-xl border px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0071eb]/40" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textDim }}>Sport</label>
                  <select className="w-full rounded-xl border px-3 py-2 text-sm text-white focus:outline-none" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }}>
                    {sportOptions.filter(x => x !== 'all').map(s => <option key={s} value={s} style={{ background: C.card }}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textDim }}>Date</label>
                  <input type="date" className="w-full rounded-xl border px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0071eb]/40" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textDim }}>Time</label>
                  <input type="time" className="w-full rounded-xl border px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0071eb]/40" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textDim }}>Status</label>
                  <select className="w-full rounded-xl border px-3 py-2 text-sm text-white focus:outline-none" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }}>
                    {(['upcoming', 'live', 'completed', 'cancelled'] as const).map(s => <option key={s} value={s} style={{ background: C.card }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: C.textDim }}>Venue</label>
                  <input type="text" placeholder="e.g. Wankhede Stadium" className="w-full rounded-xl border px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0071eb]/40" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.03)' }} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowAddModal(false); setEditingSchedule(null) }} className="flex-1 rounded-xl border py-2.5 text-[12px] font-medium transition-all hover:bg-white/[0.04]" style={{ borderColor: C.border, color: C.textSec }}>
                  Cancel
                </button>
                <button onClick={() => { setShowAddModal(false); setEditingSchedule(null) }} className="flex-1 rounded-xl py-2.5 text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: C.info }}>
                  {editingSchedule ? 'Update Match' : 'Add Match'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   PAGE ROUTER
   ═══════════════════════════════════════════════════ */

function renderPage(page: AdminPage): React.ReactNode {
  if (page === 'dashboard') return <DashboardPage />
  if (page === 'live-monitor') return <LiveMonitorPage />
  if (page === 'analytics') return <AdminAnalytics />
  if (page === 'engagement') return <AdminAnalytics />
  if (page === 'revenue') return <AdminAnalytics />
  if (page === 'settings') return <SettingsPage />
  if (page === 'users') return <OnlineUsersPage /> /* imported */
  if (page === 'live-control') return <LiveControlPage />
  if (page === 'videos') return <VideosPage />
  if (page === 'highlights') return <VideoUploadUI onClose={() => {}} />
  if (page === 'reports') return <ReportsPage />
  if (page === 'categories') return <CategoriesPage />
  if (page === 'schedules') return <MatchSchedule />
  if (page === 'comments') return <GenericPage title="Comments" subtitle="User comments" icon={<MessageSquare className="h-5 w-5" style={{ color: C.success }} />} accent={C.success} />
  if (page === 'banners') return <BannerAnalyticsPage />
  if (page === 'activity-logs') return <GenericPage title="Activity Logs" subtitle="System activity" icon={<ClipboardList className="h-5 w-5" style={{ color: C.textSec }} />} accent={C.textSec} />
  if (page === 'notifications') return <GenericPage title="Notifications" subtitle="Notification management" icon={<Bell className="h-5 w-5" style={{ color: C.warning }} />} accent={C.warning} />
  if (page === 'admins') return <GenericPage title="Admins" subtitle="Admin team management" icon={<ShieldCheck className="h-5 w-5" style={{ color: C.info }} />} accent={C.info} />
  if (page === 'replays') return <ReplaysPage />
  if (page === 'ads-manager') return <AdsManagerWrapper />
  if (page === 'create-ad') return <CreateNewAdSection />
  if (page === 'hero-ads') return <HeroFooterAdsManager />
  if (page === 'video-ads') return <VideoAdsManager />
  if (page === 'video-ads-analytics') return <VideoAdsAnalyticsPage />
  if (page === 'rtmp-config') return <RTMPConfigPage />
  return null
}

/* ═══════════════════════════════════════════════════════════════
   MAIN ADMIN PANEL
   ═══════════════════════════════════════════════════════════════ */

export default function AdminPanel() {
  const { setCurrentView } = useAppStore()
  const [activePage, setActivePage] = useState<AdminPage>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
      setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="min-h-screen flex" style={{ background: C.bg }}>
      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 280, background: C.sidebar, borderColor: C.border }}
      >
        {/* Logo */}
        <div className="flex h-12 items-center gap-3 border-b px-4" style={{ borderColor: C.border }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.accent, boxShadow: `0 4px 16px ${C.accentGlow}` }}>
            <Activity className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              SPORTIX<span style={{ color: C.accent }}> LIVE</span>
            </h1>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: C.textDim }}>Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden rounded-lg p-1 hover:bg-white/[0.05]">
            <X className="h-4 w-4" style={{ color: C.textTer }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 no-scrollbar">
          {menuSections.map((section) => (
            <div key={section.label || '_root'} className="mb-3">
              {section.label && (
                <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: C.textDim }}>
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activePage === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActivePage(item.id); setSidebarOpen(false) }}
                      className="relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150"
                      style={{
                        background: isActive ? C.accent : 'transparent',
                        color: isActive ? '#fff' : C.textSec,
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" style={{ color: isActive ? '#fff' : C.textTer }} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[9px] font-bold"
                          style={{
                            background: item.badge === 'LIVE' ? C.accent : `${C.accent}20`,
                            color: item.badge === 'LIVE' ? '#fff' : C.accent,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t px-3 py-3" style={{ borderColor: C.border }}>
          <button
            onClick={() => { setCurrentView('home'); setSidebarOpen(false) }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all hover:bg-white/[0.04]"
            style={{ color: C.accent }}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Sidebar Overlay (mobile) ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 md:ml-[280px] min-h-screen flex flex-col transition-all duration-300">
        {/* ─── Top Header ─── */}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 sm:gap-3 border-b px-3 sm:px-4 lg:px-5" style={{ background: 'rgba(20,20,20,0.92)', backdropFilter: 'blur(20px)', borderColor: C.border }}>
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: C.accent, boxShadow: `0 2px 10px ${C.accentGlow}` }}>
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              SPORTIX<span style={{ color: C.accent }}> LIVE</span>
            </h1>
          </div>
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.05]"
          >
            <Menu className="h-5 w-5" style={{ color: C.textSec }} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              <Search className="h-4 w-4 flex-shrink-0" style={{ color: C.textDim }} />
              <input
                type="text"
                placeholder="Search anything..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
              />
              <kbd className="hidden sm:inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-mono" style={{ borderColor: C.border, color: C.textDim }}>⌘K</kbd>
            </div>
          </div>

          {/* Date */}
          <div className="hidden md:flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] transition-colors hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textTer }}>
            <Calendar className="h-3.5 w-3.5" />
            {currentDate}
          </div>

          {/* Time */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-mono" style={{ borderColor: C.border, color: C.textSec, background: 'rgba(255,255,255,0.02)' }}>
            <Clock className="h-3 w-3" style={{ color: C.textDim }} />
            {currentTime}
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <main className="flex-1 p-2.5 sm:p-3 md:p-4 lg:p-5">
          <Suspense fallback={
            <div className="flex h-64 w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#E50914]" />
            </div>
          }>
            {renderPage(activePage)}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
