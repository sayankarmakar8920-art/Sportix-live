'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { io as socketIo } from 'socket.io-client'
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
  Zap,
  Globe,
  Camera,
  Mic,
  ChevronDown,
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
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */

const C = {
  bg: '#121212',
  sidebar: '#1a1a1a',
  card: '#1e1e1e',
  cardHover: '#242424',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.10)',
  accent: '#e63946',
  accentDim: 'rgba(230,57,70,0.15)',
  accentGlow: 'rgba(230,57,70,0.25)',
  success: '#2ecc71',
  warning: '#f39c12',
  info: '#3498db',
  purple: '#9b59b6',
  text: '#ffffff',
  textSec: '#b0b0b0',
  textTer: '#888888',
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
      { id: 'highlights', label: 'Highlights', icon: Zap },
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

function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border p-5 transition-all duration-200 ${className}`} style={{ background: C.card, borderColor: C.border, ...style }}>
      {children}
    </div>
  )
}

function CardHeader({ title, children }: { title: string; children?: React.ReactNode }) {
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

/* ═══════════════════════════════════════════════════════════════
   1. DASHBOARD PAGE — exact reference match
   ═══════════════════════════════════════════════════════════════ */

function DashboardPage() {
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

  const statsCards = [
    { label: 'Total Users', value: '24,853', change: '+12.5%', positive: true, icon: Users, color: C.purple, sparkline: [18, 22, 19, 25, 28, 24, 30] },
    { label: 'Active Users', value: '5,472', change: '+8.3%', positive: true, icon: Activity, color: C.purple, sparkline: [12, 15, 13, 18, 16, 20, 22] },
    { label: 'Total Streams', value: '1,256', change: '+15.7%', positive: true, icon: Radio, color: C.info, sparkline: [8, 10, 12, 9, 14, 11, 16] },
    { label: 'Total Views', value: '8.45M', change: '+21.4%', positive: true, icon: Eye, color: '#e6a817', sparkline: [50, 65, 55, 70, 80, 75, 90] },
    { label: 'Storage Used', value: '1.24 TB', change: '12.4% of 10 TB', positive: true, icon: HardDrive, color: C.success, sparkline: [30, 35, 32, 40, 38, 42, 45] },
  ]

  const viewsChartData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 1500000) + 500000)
  const uploadChartData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 800) + 200)

  const liveUsers = [
    { name: 'Rahul Sharma', email: 'rahul@email.com', status: 'watching', stream: 'India vs Australia', time: '12m ago' },
    { name: 'Priya Patel', email: 'priya@email.com', status: 'streaming', stream: 'EPL Highlights', time: '5m ago' },
    { name: 'Alex Chen', email: 'alex@email.com', status: 'watching', stream: 'NBA Finals', time: '2m ago' },
    { name: 'Maria Garcia', email: 'maria@email.com', status: 'watching', stream: 'F1 Monaco GP', time: '8m ago' },
    { name: 'James Wilson', email: 'james@email.com', status: 'idle', stream: '—', time: '15m ago' },
  ]

  const topVideos = [
    { title: 'India vs England - T20 WC Final', views: '2.4M', likes: '45.2K', duration: '4:12:30', thumbnail: '/sportix/stadium-preview.png' },
    { title: 'EPL Best Goals 2026', views: '1.8M', likes: '38.1K', duration: '12:45', thumbnail: '/sportix/cricket-stadium.png' },
    { title: 'NBA Finals Game 7 Highlights', views: '1.2M', likes: '29.5K', duration: '8:30', thumbnail: '/sportix/stadium-preview.png' },
  ]

  const recentReports = [
    { id: 'R-1042', type: 'Spam', user: 'user_8291', target: 'Comment on Stream #45', status: 'pending', date: '2 hours ago' },
    { id: 'R-1041', type: 'Inappropriate', user: 'user_7723', target: 'Highlight Video #128', status: 'resolved', date: '4 hours ago' },
    { id: 'R-1040', type: 'Copyright', user: 'mod_team', target: 'Reel #892', status: 'reviewing', date: '6 hours ago' },
    { id: 'R-1039', type: 'Spam', user: 'user_6654', target: 'Comment on Video #334', status: 'resolved', date: '8 hours ago' },
  ]

  return (
    <div className="space-y-5 fade-in-up">
      {/* ── Stats Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statsCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: C.textTer }}>{s.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${s.color}15` }}>
                  <Icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] font-medium" style={{ color: s.positive ? C.success : C.accent }}>
                  {s.positive ? <ArrowUpRight className="inline h-3 w-3 mr-0.5" /> : <ArrowDownRight className="inline h-3 w-3 mr-0.5" />}
                  {s.change}
                </span>
                <MiniSparkline data={s.sparkline} color={s.color} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Views Overview */}
        <Card>
          <CardHeader title="Views Overview">
            <span className="text-[11px] font-medium" style={{ color: C.textTer }}>Last 7 days</span>
          </CardHeader>
          <div className="flex h-48 items-end gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const max = Math.max(...viewsChartData)
              const h = (viewsChartData[i] / max) * 100
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group cursor-pointer">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                      style={{ height: `${h}%`, background: `linear-gradient(180deg, ${C.accent}90, ${C.accent}20)`, minHeight: 8 }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block rounded-md px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap" style={{ background: C.sidebar }}>
                      {fmtCompact(viewsChartData[i])}
                    </div>
                  </div>
                  <span className="text-[10px]" style={{ color: C.textDim }}>{day}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px]" style={{ color: C.textTer }}>Total: <span className="font-semibold text-white">{fmt(viewsChartData.reduce((a, b) => a + b, 0))}</span></span>
            <span className="text-[11px] font-semibold" style={{ color: C.success }}>+21.4%</span>
          </div>
        </Card>

        {/* Upload Overview */}
        <Card>
          <CardHeader title="Upload Overview">
            <span className="text-[11px] font-medium" style={{ color: C.textTer }}>Last 7 days</span>
          </CardHeader>
          <div className="flex h-48 items-end gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const max = Math.max(...uploadChartData)
              const h = (uploadChartData[i] / max) * 100
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group cursor-pointer">
                    <div
                      className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-80"
                      style={{ height: `${h}%`, background: `${C.accent}80`, minHeight: 8 }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block rounded-md px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap" style={{ background: C.sidebar }}>
                      {uploadChartData[i]}
                    </div>
                  </div>
                  <span className="text-[10px]" style={{ color: C.textDim }}>{day}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px]" style={{ color: C.textTer }}>Total: <span className="font-semibold text-white">{uploadChartData.reduce((a, b) => a + b, 0)}</span></span>
            <span className="text-[11px] font-semibold" style={{ color: C.success }}>+8.2%</span>
          </div>
        </Card>
      </div>

      {/* ── Live Users + Top Videos + System ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Users */}
        <Card className="lg:col-span-1">
          <CardHeader title="Live Users">
            <StatusBadge text="2,431 online" color={C.success} />
          </CardHeader>
          <div className="space-y-0 overflow-y-auto max-h-[320px] no-scrollbar">
            {liveUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: C.border }}>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: `${C.accent}30` }}>
                  {u.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{u.name}</p>
                  <p className="text-[10px] truncate" style={{ color: C.textTer }}>{u.stream}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <StatusBadge text={u.status} color={u.status === 'watching' ? C.info : u.status === 'streaming' ? C.accent : C.textTer} />
                  <p className="text-[9px] mt-1" style={{ color: C.textDim }}>{u.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Performing Videos */}
        <Card className="lg:col-span-1">
          <CardHeader title="Top Performing Videos">
            <button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button>
          </CardHeader>
          <div className="space-y-3">
            {topVideos.map((v, i) => (
              <div key={i} className="flex gap-3 rounded-xl p-2 transition-all cursor-pointer hover:bg-white/[0.03]">
                <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg" style={{ background: C.sidebar }}>
                  <img src={v.thumbnail} alt="" className="h-full w-full object-cover opacity-70" draggable={false} />
                  <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-mono text-white">{v.duration}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white line-clamp-2 leading-relaxed">{v.title}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] flex items-center gap-1" style={{ color: C.textTer }}><Eye className="h-3 w-3" /> {v.views}</span>
                    <span className="text-[10px]" style={{ color: C.textTer }}>♥ {v.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System Overview */}
        <Card className="lg:col-span-1">
          <CardHeader title="System Overview">
            <StatusBadge text="Healthy" color={C.success} />
          </CardHeader>
          {/* Circular Progress */}
          <div className="flex justify-center mb-5">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={C.accent} strokeWidth="10" strokeDasharray={`${2 * Math.PI * 50 * 0.73} ${2 * Math.PI * 50}`} strokeLinecap="round" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={C.info} strokeWidth="10" strokeDasharray={`${2 * Math.PI * 50 * 0.45} ${2 * Math.PI * 50}`} strokeDashoffset={`${-2 * Math.PI * 50 * 0.73}`} strokeLinecap="round" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={C.warning} strokeWidth="10" strokeDasharray={`${2 * Math.PI * 50 * 0.62} ${2 * Math.PI * 50}`} strokeDashoffset={`${-2 * Math.PI * 50 * (0.73 + 0.45)}`} strokeLinecap="round" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={C.success} strokeWidth="10" strokeDasharray={`${2 * Math.PI * 50 * 0.42} ${2 * Math.PI * 50}`} strokeDashoffset={`${-2 * Math.PI * 50 * (0.73 + 0.45 + 0.62)}`} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-white">73%</span>
                <span className="text-[10px]" style={{ color: C.textTer }}>Health</span>
              </div>
            </div>
          </div>
          {/* Metrics */}
          <div className="space-y-3">
            {[
              { label: 'CPU Usage', value: '45%', color: C.info, pct: 45 },
              { label: 'Memory Usage', value: '62%', color: C.warning, pct: 62 },
              { label: 'Disk Usage', value: '73%', color: C.accent, pct: 73 },
              { label: 'Network', value: '42%', color: C.success, pct: 42 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px]" style={{ color: C.textTer }}>{m.label}</span>
                  <span className="text-[11px] font-semibold text-white">{m.value}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.pct}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Reports + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Reports */}
        <Card>
          <CardHeader title="Recent Reports">
            <button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: C.border }}>
                  {['ID', 'Type', 'User', 'Target', 'Status', 'Date'].map((h) => (
                    <th key={h} className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                    <td className="py-2.5 text-[11px] font-mono text-white">{r.id}</td>
                    <td className="py-2.5 text-[11px]" style={{ color: C.textSec }}>{r.type}</td>
                    <td className="py-2.5 text-[11px]" style={{ color: C.textTer }}>{r.user}</td>
                    <td className="py-2.5 text-[11px] text-white max-w-[120px] truncate">{r.target}</td>
                    <td className="py-2.5">
                      <StatusBadge text={r.status} color={r.status === 'resolved' ? C.success : r.status === 'reviewing' ? C.warning : C.accent} />
                    </td>
                    <td className="py-2.5 text-[10px]" style={{ color: C.textTer }}>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Upload Video', icon: Upload, color: C.info },
              { label: 'Go Live', icon: Radio, color: C.accent },
              { label: 'New Banner', icon: ImageIcon, color: C.purple },
              { label: 'Clear Cache', icon: RefreshCw, color: C.warning },
              { label: 'View Logs', icon: FileText, color: C.success },
              { label: 'System Check', icon: Monitor, color: C.textSec },
            ].map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.label}
                  className="flex flex-col items-center gap-2.5 rounded-xl p-4 border transition-all hover:bg-white/[0.03] hover:border-white/10"
                  style={{ borderColor: C.border }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${a.color}15` }}>
                    <Icon className="h-5 w-5" style={{ color: a.color }} />
                  </div>
                  <span className="text-[11px] font-medium text-white">{a.label}</span>
                </button>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
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
    <div className="space-y-5 fade-in-up">
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
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['ID', 'Title', 'Status', 'Views', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
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
    <div className="space-y-5 fade-in-up">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Stream', 'Category', 'Viewers', 'Peak', 'Duration', 'Health', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
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
    <div className="space-y-5 fade-in-up">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
            <table className="w-full">
              <thead><tr className="border-b" style={{ borderColor: C.border }}>
                {['Campaign', 'Revenue', 'Impressions', 'Clicks', 'CTR', 'Conv.', 'Cost/Conv.', 'ROAS'].map(h => <th key={h} className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
    <div className="space-y-5 fade-in-up">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              {['Ad Preview', 'Campaign', 'Engagements', 'ER %', 'Likes', 'Comments', 'Shares', 'Saves', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>)}
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
    <div className="space-y-5 fade-in-up">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
            <table className="w-full">
              <thead><tr className="border-b" style={{ borderColor: C.border }}>
                {['Campaign', 'Revenue', 'Ad Revenue', 'Sub', 'Other', 'Refunds', 'Change', 'Trend'].map(h => <th key={h} className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>)}
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
            <div key={i} className="flex items-center gap-4">
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
    <div className="space-y-5 fade-in-up">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Top Performing Banners"><button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b" style={{ borderColor: C.border }}>
                {['#', 'Banner', 'Impressions', 'Clicks', 'CTR', 'Revenue'].map(h => <th key={h} className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>)}
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
            <table className="w-full">
              <thead><tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Banner Info', 'Placement', 'Status', 'Impressions', 'Clicks', 'CTR', 'CPC', 'Revenue', 'Conv.', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
    <div className="space-y-5 fade-in-up">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
   ONLINE USERS PAGE (Real-time user tracking)
   ═══════════════════════════════════════════════════════════════ */

interface TrackedUser {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  isOnline: boolean
  lastSeen: string
  loginCount: number
  createdAt: string
}

function OnlineUsersPage() {
  const [users, setUsers] = useState<TrackedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all')

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users/admin')
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    const interval = setInterval(fetchUsers, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [fetchUsers])

  // Socket.io for real-time updates
  useEffect(() => {
    const socket = socketIo('/?XTransformPort=3005', {
      transports: ['websocket', 'polling'],
    })

    socket.on('user-login', (data: { userId: string; name: string; timestamp: string }) => {
      setUsers(prev => prev.map(u =>
        u.id === data.userId ? { ...u, isOnline: true, lastSeen: data.timestamp } : u
      ))
    })

    socket.on('user-logout', (data: { userId: string; name: string; timestamp: string }) => {
      setUsers(prev => prev.map(u =>
        u.id === data.userId ? { ...u, isOnline: false, lastSeen: data.timestamp } : u
      ))
    })

    return () => { socket.disconnect() }
  }, [])

  const onlineCount = users.filter(u => u.isOnline).length
  const offlineCount = users.length - onlineCount

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'all' || (filter === 'online' && u.isOnline) || (filter === 'offline' && !u.isOnline)
    const matchesSearch = !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  function formatTimeAgo(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'Just now'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    return `${diffDay}d ago`
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const avatarColors = ['#e63946', '#9b59b6', '#3498db', '#2ecc71', '#f39c12', '#e91e63', '#00bcd4', '#ff5722']

  if (loading) {
    return (
      <div className="space-y-5 fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.purple}15` }}>
            <Users className="h-5 w-5" style={{ color: C.purple }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Online Users</h2>
            <p className="text-xs" style={{ color: C.textTer }}>Real-time user tracking</p>
          </div>
        </div>
        <Card>
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#2ecc71]" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5 fade-in-up">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.purple}15` }}>
          <Users className="h-5 w-5" style={{ color: C.purple }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Online Users</h2>
          <p className="text-xs" style={{ color: C.textTer }}>Real-time user tracking • Auto-refresh every 5s</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>Total Users</span>
            <Users className="h-4 w-4" style={{ color: C.purple }} />
          </div>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>Online Now</span>
            <div className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" /></div>
          </div>
          <p className="text-2xl font-bold" style={{ color: C.success }}>{onlineCount}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>Offline</span>
            <div className="h-3 w-3 rounded-full" style={{ background: C.textDim }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: C.textTer }}>{offlineCount}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>Total Logins</span>
            <Activity className="h-4 w-4" style={{ color: C.info }} />
          </div>
          <p className="text-2xl font-bold text-white">{users.reduce((sum, u) => sum + u.loginCount, 0)}</p>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
            <Search className="h-4 w-4" style={{ color: C.textDim }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(['all', 'online', 'offline'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium border transition-all"
              style={{
                borderColor: filter === f ? (f === 'online' ? `${C.success}40` : f === 'offline' ? `${C.textDim}40` : `${C.accent}40`) : C.border,
                background: filter === f ? (f === 'online' ? `${C.success}10` : f === 'offline' ? `${C.textDim}10` : `${C.accent}10`) : 'transparent',
                color: filter === f ? (f === 'online' ? C.success : f === 'offline' ? C.textSec : C.accent) : C.textTer,
              }}
            >
              {f === 'online' && <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: C.success }} />}
              {f === 'all' && `All (${users.length})`}
              {f === 'online' && `Online (${onlineCount})`}
              {f === 'offline' && `Offline (${offlineCount})`}
            </button>
          ))}
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium border transition-all hover:bg-white/[0.03]"
            style={{ borderColor: C.border, color: C.textSec }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['User', 'Status', 'Last Seen', 'Logins', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2" style={{ color: C.textDim }} />
                    <p className="text-sm" style={{ color: C.textTer }}>No users found</p>
                  </td>
                </tr>
              )}
              {filteredUsers.map((user, i) => (
                <tr key={user.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ background: avatarColors[i % avatarColors.length] + '30', color: avatarColors[i % avatarColors.length] }}
                        >
                          {getInitials(user.name)}
                        </div>
                        {user.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2" style={{ background: C.success, borderColor: C.card }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-white truncate">{user.name}</p>
                        <p className="text-[10px] truncate" style={{ color: C.textTer }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {user.isOnline ? (
                      <StatusBadge text="Online" color={C.success} />
                    ) : (
                      <StatusBadge text="Offline" color={C.textDim} />
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[11px]" style={{ color: user.isOnline ? C.success : C.textTer }}>
                      {user.isOnline ? 'Active now' : formatTimeAgo(user.lastSeen)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[12px] font-medium text-white">{user.loginCount}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[11px]" style={{ color: C.textTer }}>{formatDate(user.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }} title="View Details">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }} title="Copy Email">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
          <span className="text-[11px]" style={{ color: C.textTer }}>
            Showing {filteredUsers.length} of {users.length} users
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: C.textDim }}>
              Auto-refresh: <span className="text-green-400">● Active</span>
            </span>
          </div>
        </div>
      </Card>

      {/* Online Users Activity Feed */}
      {onlineCount > 0 && (
        <Card>
          <CardHeader title="Currently Online">
            <StatusBadge text={`${onlineCount} active`} color={C.success} />
          </CardHeader>
          <div className="space-y-0 overflow-y-auto max-h-[320px] no-scrollbar">
            {users.filter(u => u.isOnline).map((user, i) => (
              <div key={user.id} className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: C.border }}>
                <div className="relative flex-shrink-0">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: avatarColors[i % avatarColors.length] + '30', color: avatarColors[i % avatarColors.length] }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 animate-pulse" style={{ background: C.success, borderColor: C.card }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user.name}</p>
                  <p className="text-[10px] truncate" style={{ color: C.textTer }}>{user.email}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${C.success}15`, color: C.success }}>
                    {user.loginCount} logins
                  </span>
                  <StatusBadge text="Online" color={C.success} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ADS MANAGER PAGE
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
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'banner',
    mediaUrl: '',
    targetUrl: '',
    category: 'football',
    duration: 30,
    position: 'pre',
    priority: 1,
  })

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    borderColor: C.border,
    borderRadius: 12,
  }

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

  const handleCreateAd = async () => {
    if (!form.title) return
    setCreating(true)
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ title: '', type: 'banner', mediaUrl: '', targetUrl: '', category: 'football', duration: 30, position: 'pre', priority: 1 })
        fetchAds()
      }
    } catch {
      // ignore
    } finally {
      setCreating(false)
    }
  }

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

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'ad')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm(prev => ({ ...prev, mediaUrl: data.url || data.fileUrl || '' }))
      }
    } catch {
      // ignore
    } finally {
      setUploading(false)
    }
  }

  const getCtr = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0.00'
    return ((clicks / impressions) * 100).toFixed(2)
  }

  if (loading) {
    return (
      <div className="space-y-5 fade-in-up">
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
    <div className="space-y-5 fade-in-up">
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
        <div className="flex gap-2">
          <button
            onClick={fetchAds}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]"
            style={{ borderColor: C.border, color: C.textSec }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: C.warning }}
          >
            <Plus className="h-3.5 w-3.5" /> Create Ad
          </button>
        </div>
      </div>

      {/* Create Ad Form */}
      {showForm && (
        <Card>
          <CardHeader title="Create New Ad">
            <button onClick={() => setShowForm(false)} className="rounded-lg p-1 transition-colors hover:bg-white/[0.05]">
              <X className="h-4 w-4" style={{ color: C.textTer }} />
            </button>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20"
                style={inputStyle}
                placeholder="Ad title..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none"
                style={{ ...inputStyle, background: '#1e1e1e' }}
              >
                <option value="banner" style={{ background: '#1e1e1e' }}>Banner</option>
                <option value="pre-roll" style={{ background: '#1e1e1e' }}>Pre-Roll</option>
                <option value="mid-roll" style={{ background: '#1e1e1e' }}>Mid-Roll</option>
                <option value="overlay" style={{ background: '#1e1e1e' }}>Overlay</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none"
                style={{ ...inputStyle, background: '#1e1e1e' }}
              >
                <option value="football" style={{ background: '#1e1e1e' }}>Football</option>
                <option value="basketball" style={{ background: '#1e1e1e' }}>Basketball</option>
                <option value="racing" style={{ background: '#1e1e1e' }}>Racing</option>
                <option value="tennis" style={{ background: '#1e1e1e' }}>Tennis</option>
                <option value="cricket" style={{ background: '#1e1e1e' }}>Cricket</option>
                <option value="mma" style={{ background: '#1e1e1e' }}>MMA</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Target URL</label>
              <input
                type="text"
                value={form.targetUrl}
                onChange={(e) => setForm(prev => ({ ...prev, targetUrl: e.target.value }))}
                className="w-full border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20"
                style={inputStyle}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Duration (seconds)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                className="w-full border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-white/20"
                style={inputStyle}
                min={1}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Position</label>
              <select
                value={form.position}
                onChange={(e) => setForm(prev => ({ ...prev, position: e.target.value }))}
                className="w-full border px-3 py-2.5 text-sm text-white bg-transparent focus:outline-none"
                style={{ ...inputStyle, background: '#1e1e1e' }}
              >
                <option value="pre" style={{ background: '#1e1e1e' }}>Pre</option>
                <option value="mid" style={{ background: '#1e1e1e' }}>Mid</option>
                <option value="post" style={{ background: '#1e1e1e' }}>Post</option>
                <option value="overlay" style={{ background: '#1e1e1e' }}>Overlay</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mt-4">
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: C.textTer }}>Media (Upload Image)</label>
            {form.mediaUrl ? (
              <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                <div className="h-12 w-20 rounded-lg overflow-hidden flex-shrink-0" style={{ background: C.sidebar }}>
                  <img src={form.mediaUrl} alt="Ad preview" className="h-full w-full object-cover" />
                </div>
                <span className="text-xs text-white truncate flex-1">{form.mediaUrl}</span>
                <button onClick={() => setForm(prev => ({ ...prev, mediaUrl: '' }))} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.accent }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors hover:border-white/10 cursor-pointer" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.01)' }}>
                {uploading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#f39c12]" />
                ) : (
                  <>
                    <CloudUpload className="h-6 w-6 mb-1" style={{ color: C.textDim }} />
                    <p className="text-[11px] font-medium text-white">Click to upload ad image</p>
                    <p className="text-[10px]" style={{ color: C.textDim }}>JPG, PNG up to 5MB</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
              </label>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="rounded-xl border px-4 py-2 text-[12px] font-medium transition-colors hover:bg-white/[0.05]" style={{ borderColor: C.border, color: C.textSec }}>
              Cancel
            </button>
            <button onClick={handleCreateAd} disabled={creating || !form.title} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ background: C.warning }}>
              {creating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {creating ? 'Creating...' : 'Create Ad'}
            </button>
          </div>
        </Card>
      )}

      {/* Ads Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Title', 'Type', 'Category', 'Impressions', 'Clicks', 'CTR', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
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
   REPLAYS MANAGER PAGE
   ═══════════════════════════════════════════════════════════════ */

interface Recording {
  id: string
  title: string
  streamTitle: string
  duration: number
  status: 'ready' | 'processing' | 'failed'
  views: number
  createdAt: string
}

function ReplaysManagerPage() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'processing' | 'failed'>('all')

  const fetchRecordings = useCallback(async () => {
    try {
      const res = await fetch('/api/recordings')
      if (res.ok) {
        const data = await res.json()
        setRecordings(Array.isArray(data) ? data : data.recordings || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRecordings() }, [fetchRecordings])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/recordings/${id}`, { method: 'DELETE' })
      fetchRecordings()
    } catch {
      // ignore
    }
  }

  const filtered = statusFilter === 'all' ? recordings : recordings.filter(r => r.status === statusFilter)
  const stats = {
    total: recordings.length,
    ready: recordings.filter(r => r.status === 'ready').length,
    processing: recordings.filter(r => r.status === 'processing').length,
    failed: recordings.filter(r => r.status === 'failed').length,
  }

  function formatDurationSec(sec: number): string {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="space-y-5 fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.info}15` }}>
            <Film className="h-5 w-5 animate-pulse" style={{ color: C.info }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Replays</h2>
            <p className="text-xs" style={{ color: C.textTer }}>Loading recordings...</p>
          </div>
        </div>
        <Card>
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#3498db]" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5 fade-in-up">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.info}15` }}>
          <Film className="h-5 w-5" style={{ color: C.info }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Replays</h2>
          <p className="text-xs" style={{ color: C.textTer }}>Manage stream recordings and VOD content</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Recordings', value: String(stats.total), icon: Film, color: C.info },
          { label: 'Ready', value: String(stats.ready), icon: CheckCircle, color: C.success },
          { label: 'Processing', value: String(stats.processing), icon: Clock, color: C.warning },
          { label: 'Failed', value: String(stats.failed), icon: XCircle, color: C.accent },
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

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['all', 'ready', 'processing', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium border transition-all capitalize"
              style={{
                borderColor: statusFilter === f ? `${C.info}40` : C.border,
                background: statusFilter === f ? `${C.info}10` : 'transparent',
                color: statusFilter === f ? C.info : C.textTer,
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={fetchRecordings}
          className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]"
          style={{ borderColor: C.border, color: C.textSec }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Recordings Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Title', 'Stream', 'Duration', 'Status', 'Views', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Film className="h-8 w-8 mx-auto mb-2" style={{ color: C.textDim }} />
                    <p className="text-sm" style={{ color: C.textTer }}>No recordings found</p>
                  </td>
                </tr>
              )}
              {filtered.map((rec) => (
                <tr key={rec.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Play className="h-3.5 w-3.5 flex-shrink-0" style={{ color: C.info }} />
                      <span className="text-[12px] font-medium text-white truncate max-w-[150px]">{rec.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[11px] truncate max-w-[120px]" style={{ color: C.textSec }}>{rec.streamTitle}</td>
                  <td className="px-5 py-3 text-[11px] font-mono" style={{ color: C.textTer }}>{formatDurationSec(rec.duration || 0)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      text={rec.status}
                      color={rec.status === 'ready' ? C.success : rec.status === 'processing' ? C.warning : C.accent}
                    />
                  </td>
                  <td className="px-5 py-3 text-[12px]" style={{ color: C.textSec }}>{fmt(rec.views || 0)}</td>
                  <td className="px-5 py-3 text-[11px]" style={{ color: C.textTer }}>
                    {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(rec.id)} className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.accent }} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
          <span className="text-[11px]" style={{ color: C.textTer }}>
            Showing {filtered.length} of {recordings.length} recordings
          </span>
        </div>
      </Card>
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
    <div className="space-y-5 fade-in-up">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
   PAGE ROUTER
   ═══════════════════════════════════════════════════════════════ */

function renderPage(page: AdminPage): React.ReactNode {
  if (page === 'dashboard') return <DashboardPage />
  if (page === 'live-monitor') return <LiveMonitorPage />
  if (page === 'analytics') return <AnalyticsPage />
  if (page === 'engagement') return <EngagementPage />
  if (page === 'revenue') return <RevenuePage />
  if (page === 'settings') return <SettingsPage />
  if (page === 'users') return <OnlineUsersPage />
  if (page === 'live-control') return <LiveControlPage />
  if (page === 'videos') return <GenericPage title="Videos" subtitle="Video content library" icon={<Video className="h-5 w-5" style={{ color: C.info }} />} accent={C.info} />
  if (page === 'highlights') return <GenericPage title="Highlights" subtitle="Match highlights" icon={<Zap className="h-5 w-5" style={{ color: C.accent }} />} accent={C.accent} />
  if (page === 'reports') return <GenericPage title="Reports" subtitle="User reports moderation" icon={<AlertTriangle className="h-5 w-5" style={{ color: C.accent }} />} accent={C.accent} />
  if (page === 'categories') return <GenericPage title="Categories" subtitle="Content categories" icon={<FolderOpen className="h-5 w-5" style={{ color: C.purple }} />} accent={C.purple} />
  if (page === 'schedules') return <GenericPage title="Schedules" subtitle="Match schedules" icon={<CalendarClock className="h-5 w-5" style={{ color: C.info }} />} accent={C.info} />
  if (page === 'comments') return <GenericPage title="Comments" subtitle="User comments" icon={<MessageSquare className="h-5 w-5" style={{ color: C.success }} />} accent={C.success} />
  if (page === 'banners') return <BannerAnalyticsPage />
  if (page === 'activity-logs') return <GenericPage title="Activity Logs" subtitle="System activity" icon={<ClipboardList className="h-5 w-5" style={{ color: C.textSec }} />} accent={C.textSec} />
  if (page === 'notifications') return <GenericPage title="Notifications" subtitle="Notification management" icon={<Bell className="h-5 w-5" style={{ color: C.warning }} />} accent={C.warning} />
  if (page === 'admins') return <GenericPage title="Admins" subtitle="Admin team management" icon={<ShieldCheck className="h-5 w-5" style={{ color: C.info }} />} accent={C.info} />
  if (page === 'replays') return <ReplaysManagerPage />
  if (page === 'ads-manager') return <AdsManagerPage />
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
        <div className="flex h-16 items-center gap-3 border-b px-5" style={{ borderColor: C.border }}>
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
        <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
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
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 lg:px-6" style={{ background: 'rgba(18,18,18,0.90)', backdropFilter: 'blur(20px)', borderColor: C.border }}>
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.05] md:hidden"
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
        <main className="flex-1 p-4 md:p-5 lg:p-6">
          {renderPage(activePage)}
        </main>
      </div>
    </div>
  )
}
