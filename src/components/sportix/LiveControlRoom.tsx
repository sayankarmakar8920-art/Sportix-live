'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import {
  LayoutDashboard,
  Radio,
  Tv,
  CalendarClock,
  Video,
  Film,
  BarChart3,
  Settings,
  ClipboardList,
  Bell,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Eye,
  Clock,
  ArrowLeft,
  Wifi,
  WifiOff,
  Monitor,
  Volume2,
  Activity,
  Signal,
  AlertTriangle,
  Upload,
  Play,
  Square,
  User,
  Globe,
  Zap,
  Shield,
  RefreshCw,
  X,
  ExternalLink,
  Cpu,
  HardDrive,
  Thermometer,
  Timer,
  TrendingUp,
  Users,
  Maximize2,
  Lock,
  Unlock,
  ChevronUp,
  Info,
  Home,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type SidebarPage =
  | 'dashboard'
  | 'live-control'
  | 'stream-history'
  | 'videos'
  | 'highlights'
  | 'schedules'
  | 'analytics'
  | 'settings'

interface MenuItem {
  id: SidebarPage
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  badge?: string
  badgeColor?: string
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const COLORS = {
  bg: '#0B0F14',
  bgSecondary: '#0E141B',
  bgCard: 'rgba(14, 20, 27, 0.80)',
  border: 'rgba(255, 255, 255, 0.06)',
  borderHover: 'rgba(255, 255, 255, 0.12)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.50)',
  textTertiary: 'rgba(255, 255, 255, 0.30)',
  accent: '#FF2E2E',
  success: '#00C853',
  warning: '#FFB800',
  info: '#3B82F6',
  cardGlow: 'rgba(255, 46, 46, 0.03)',
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'live-control', label: 'Live Control', icon: Radio, badge: 'LIVE', badgeColor: COLORS.accent },
  { id: 'stream-history', label: 'Stream History', icon: Tv },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'highlights', label: 'Highlights', icon: Film },
  { id: 'schedules', label: 'Schedules', icon: CalendarClock },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  onClick,
  style,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-[14px] border transition-all duration-300 ${
        hover ? 'hover:border-[rgba(255,255,255,0.10)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : ''
      } ${className}`}
      style={{
        background: COLORS.bgCard,
        backdropFilter: 'blur(20px)',
        border: glow ? '1px solid rgba(255, 46, 46, 0.15)' : `1px solid ${COLORS.border}`,
        boxShadow: glow ? '0 0 40px rgba(255, 46, 46, 0.05)' : '0 2px 12px rgba(0,0,0,0.2)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function LiveBadge({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'px-2 py-0.5 text-[10px] gap-1.5',
    md: 'px-3 py-1 text-[11px] gap-1.5',
    lg: 'px-4 py-1.5 text-xs gap-2',
  }
  const dotMap = { sm: 'h-1.5 w-1.5', md: 'h-2 w-2', lg: 'h-2.5 w-2.5' }

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider text-white ${sizeMap[size]}`}
      style={{ background: COLORS.accent, borderRadius: 6 }}
    >
      <span className={`relative flex ${dotMap[size]}`}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-full w-full rounded-full bg-white" />
      </span>
      Live
    </span>
  )
}

function StatusDot({ status, size = 8 }: { status: 'online' | 'offline' | 'warning'; size?: number }) {
  const colorMap = { online: COLORS.success, offline: 'rgba(255,255,255,0.15)', warning: COLORS.warning }
  return (
    <span
      className="relative flex rounded-full"
      style={{ width: size, height: size, background: colorMap[status] }}
    >
      {status === 'online' && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
          style={{ background: COLORS.success }}
        />
      )}
    </span>
  )
}

function MetricItem({ label, value, icon, color, status }: {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: string
  status?: 'good' | 'warn' | 'bad'
}) {
  const statusColor = status === 'good' ? COLORS.success : status === 'warn' ? COLORS.warning : status === 'bad' ? COLORS.accent : color || 'rgba(255,255,255,0.60)'
  return (
    <div className="flex items-center justify-between py-2.5 px-0">
      <span className="text-[13px] text-white/40 flex items-center gap-2">
        {icon && <span style={{ color: 'rgba(255,255,255,0.20)' }}>{icon}</span>}
        {label}
      </span>
      <span className="text-[13px] font-semibold" style={{ color: statusColor }}>
        {value}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LEFT SIDEBAR
   ═══════════════════════════════════════════════════════════════ */

function Sidebar({ activePage, onNavigate, collapsed, onToggle, onBack }: {
  activePage: SidebarPage
  onNavigate: (page: SidebarPage) => void
  collapsed: boolean
  onToggle: () => void
  onBack: () => void
}) {
  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r transition-all duration-300"
      style={{
        width: collapsed ? 72 : 260,
        background: 'linear-gradient(180deg, #0B0F14 0%, #0E141B 100%)',
        borderColor: COLORS.border,
      }}
    >
      {/* Logo */}
      <div className="flex h-[70px] items-center gap-3 border-b px-4" style={{ borderColor: COLORS.border }}>
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl cursor-pointer transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${COLORS.accent}, #cc1a1a)`, boxShadow: '0 4px 16px rgba(255,46,46,0.25)' }}
          onClick={onBack}
          title="Back to Home"
        >
          <Radio className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[15px] font-bold text-white tracking-tight">Sportix Live</h1>
            <p className="text-[10px] text-white/25 font-medium">Control Panel</p>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activePage === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200"
                style={{
                  background: isActive ? `linear-gradient(135deg, rgba(255,46,46,0.12), rgba(255,46,46,0.04))` : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full"
                    style={{ background: COLORS.accent, boxShadow: `0 0 12px ${COLORS.accent}` }}
                  />
                )}

                <Icon
                  className="h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200"
                  style={{ color: isActive ? COLORS.accent : 'rgba(255,255,255,0.35)' }}
                />
                {!collapsed && (
                  <>
                    <span
                      className="text-[13px] font-medium transition-colors duration-200"
                      style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.50)' }}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className="ml-auto rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{
                          background: item.badgeColor === COLORS.accent ? 'rgba(255,46,46,0.15)' : 'rgba(0,200,83,0.15)',
                          color: item.badgeColor,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom: Back + Collapse */}
      <div className="border-t px-3 py-3 space-y-1" style={{ borderColor: COLORS.border }}>
        <button
          onClick={onBack}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-white/30 transition-all hover:bg-white/[0.04] hover:text-white/50"
        >
          <ArrowLeft className="h-4 w-4" />
          {!collapsed && <span>Back to Home</span>}
        </button>
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[12px] text-white/20 transition-all hover:bg-white/[0.04] hover:text-white/40"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TOP HEADER
   ═══════════════════════════════════════════════════════════════ */

function TopHeader({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifCount] = useState(3)

  const langs = ['English', 'Hindi', 'Spanish']
  const [lang, setLang] = useState('English')

  return (
    <header
      className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b px-6 transition-all duration-300"
      style={{
        marginLeft: sidebarCollapsed ? 72 : 260,
        background: 'rgba(11, 15, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        borderColor: COLORS.border,
      }}
    >
      {/* Left */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">Live Control Room</h2>
          <LiveBadge size="sm" />
        </div>
        <p className="text-[12px] text-white/30 mt-0.5">Manage your live stream and broadcast settings</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:bg-white/[0.04]" style={{ borderColor: COLORS.border }}>
          <Bell className="h-4 w-4 text-white/40" />
          {notifCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
              style={{ background: COLORS.accent }}
            >
              {notifCount}
            </span>
          )}
        </button>

        {/* Language */}
        <div className="relative">
          <button
            onClick={() => { setLangOpen(!langOpen); setProfileOpen(false) }}
            className="flex h-9 items-center gap-2 rounded-xl border px-3 transition-all hover:bg-white/[0.04]"
            style={{ borderColor: COLORS.border }}
          >
            <Globe className="h-3.5 w-3.5 text-white/30" />
            <span className="text-[12px] text-white/50">{lang}</span>
            <ChevronDown className="h-3 w-3 text-white/20" />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-2 w-36 overflow-hidden rounded-xl border shadow-2xl" style={{ background: '#0E141B', borderColor: COLORS.border }}>
              {langs.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangOpen(false) }}
                  className="w-full px-3 py-2 text-left text-[12px] text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/80"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false) }}
            className="flex items-center gap-2.5 rounded-xl border py-1.5 pl-1.5 pr-3 transition-all hover:bg-white/[0.04]"
            style={{ borderColor: COLORS.border }}
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${COLORS.accent}, #cc1a1a)` }}
            >
              SA
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[12px] font-medium text-white/70 leading-tight">Super Admin</p>
              <p className="text-[10px] text-white/25">admin@sportix.io</p>
            </div>
            <ChevronDown className="h-3 w-3 text-white/20 hidden md:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border shadow-2xl" style={{ background: '#0E141B', borderColor: COLORS.border }}>
              <div className="border-b px-3 py-3" style={{ borderColor: COLORS.border }}>
                <p className="text-[13px] font-semibold text-white">Super Admin</p>
                <p className="text-[11px] text-white/30">admin@sportix.io</p>
              </div>
              {['Profile Settings', 'Security', 'Help Center', 'Sign Out'].map((item) => (
                <button
                  key={item}
                  className="w-full px-3 py-2.5 text-left text-[12px] text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STREAM PREVIEW CARD
   ═══════════════════════════════════════════════════════════════ */

function StreamPreviewCard({ isLive, onGoLive }: { isLive: boolean; onGoLive: () => void }) {
  return (
    <GlassCard className="p-0 overflow-hidden" glow={isLive}>
      {/* Preview Area */}
      <div className="relative aspect-video overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0e16, #111827)' }}>
        <img
          src="/sportix/stadium-preview.png"
          alt="Stream Preview"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-[rgba(11,15,20,0.4)]" />

        {/* LIVE Badge */}
        {isLive && (
          <div className="absolute top-4 left-4 z-10">
            <LiveBadge size="md" />
          </div>
        )}

        {/* Center Controls */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {!isLive ? (
            <>
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full mb-4 transition-all duration-300 hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <Play className="h-7 w-7 text-white/60 ml-1" />
              </div>
              <p className="text-[15px] font-semibold text-white/80">Stream is currently offline</p>
              <p className="text-[13px] text-white/30 mt-1">Start streaming to go live</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[14px] font-bold text-white tracking-wide">India vs Australia</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-white">245</span>
                <span className="text-xl text-white/20">-</span>
                <span className="text-3xl font-black text-white">198</span>
              </div>
              <p className="text-[12px] text-white/30 mt-1.5 tracking-widest uppercase">42nd Over • Live</p>
            </>
          )}
        </div>
      </div>

      {/* Bottom Info Row */}
      <div className="flex items-center gap-0 border-t" style={{ borderColor: COLORS.border }}>
        {[
          { label: 'Category', value: 'Cricket', icon: <Film className="h-3 w-3" /> },
          { label: 'Resolution', value: '1080p', icon: <Monitor className="h-3 w-3" /> },
          { label: 'Bitrate', value: '4500 kbps', icon: <Signal className="h-3 w-3" /> },
          { label: 'FPS', value: '60', icon: <Activity className="h-3 w-3" /> },
          { label: 'Audio', value: '128kbps', icon: <Volume2 className="h-3 w-3" /> },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 ${i < arr.length - 1 ? 'border-r' : ''}`}
            style={{ borderColor: COLORS.border }}
          >
            <span className="text-white/20">{item.icon}</span>
            <div>
              <p className="text-[9px] text-white/20 uppercase tracking-wider">{item.label}</p>
              <p className="text-[11px] font-semibold text-white/60">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STREAM CONNECTION CARD
   ═══════════════════════════════════════════════════════════════ */

function StreamConnectionCard() {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const serverUrl = 'rtmp://live.sportix.io/live'
  const streamKey = 'sk-live-8f3a2b1c-4d5e-6f7a-8b9c-0d1e2f3a4b5c'

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const obsSteps = [
    { step: '1', text: 'Open OBS Studio and go to Settings > Stream' },
    { step: '2', text: 'Set Service to "Custom..."' },
    { step: '3', text: 'Paste the Server URL above' },
    { step: '4', text: 'Paste the Stream Key above' },
    { step: '5', text: 'Set output to 1080p / 60fps / 4500kbps' },
    { step: '6', text: 'Click "Start Streaming" in OBS' },
  ]

  return (
    <GlassCard className="p-5">
      {/* Status */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
          <Wifi className="h-4 w-4" style={{ color: COLORS.success }} />
          Stream Connection
        </h3>
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ background: 'rgba(0,200,83,0.10)', color: COLORS.success, boxShadow: '0 0 16px rgba(0,200,83,0.08)' }}
        >
          <StatusDot status="online" size={6} />
          Ready
        </span>
      </div>

      {/* Server URL */}
      <div className="mb-3">
        <label className="block text-[11px] font-medium text-white/30 mb-1.5 uppercase tracking-wider">Server URL</label>
        <div className="flex gap-2">
          <div
            className="flex-1 rounded-xl border px-3.5 py-2.5 text-[12px] font-mono text-white/70 truncate"
            style={{ borderColor: COLORS.border, background: 'rgba(255,255,255,0.02)' }}
          >
            {serverUrl}
          </div>
          <button
            onClick={() => handleCopy(serverUrl, 'url')}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-all hover:bg-white/[0.04]"
            style={{ borderColor: COLORS.border }}
          >
            {copied === 'url' ? <Check className="h-4 w-4" style={{ color: COLORS.success }} /> : <Copy className="h-4 w-4 text-white/30" />}
          </button>
        </div>
      </div>

      {/* Stream Key */}
      <div className="mb-5">
        <label className="block text-[11px] font-medium text-white/30 mb-1.5 uppercase tracking-wider">Stream Key</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={streamKey}
              readOnly
              className="w-full rounded-xl border px-3.5 py-2.5 text-[12px] font-mono text-white/70 focus:outline-none"
              style={{ borderColor: COLORS.border, background: 'rgba(255,255,255,0.02)' }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 transition-colors hover:text-white/40"
            >
              {showKey ? <Eye className="h-4 w-4" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <button
            onClick={() => handleCopy(streamKey, 'key')}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-all hover:bg-white/[0.04]"
            style={{ borderColor: COLORS.border }}
          >
            {copied === 'key' ? <Check className="h-4 w-4" style={{ color: COLORS.success }} /> : <Copy className="h-4 w-4 text-white/30" />}
          </button>
        </div>
      </div>

      {/* OBS Guide */}
      <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: 'rgba(255,255,255,0.01)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-semibold text-white/60">OBS Setup Guide</p>
          <button className="flex items-center gap-1 text-[11px] font-medium transition-colors hover:text-white/80" style={{ color: COLORS.accent }}>
            <ExternalLink className="h-3 w-3" /> Watch Guide
          </button>
        </div>
        <div className="space-y-2">
          {obsSteps.map((s) => (
            <div key={s.step} className="flex items-start gap-2.5">
              <div
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {s.step}
              </div>
              <p className="text-[11px] text-white/35 leading-relaxed pt-0.5">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}

/* ═══════════════════════════════════════════════════════════════
   START LIVE STREAM CARD (CENTER)
   ═══════════════════════════════════════════════════════════════ */

function StartLiveStreamCard({ isLive, onGoLive, onStopLive }: { isLive: boolean; onGoLive: () => void; onStopLive: () => void }) {
  const [category, setCategory] = useState<'cricket' | 'football'>('cricket')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleCount, setTitleCount] = useState(0)
  const [descCount, setDescCount] = useState(0)

  return (
    <GlassCard className="p-5" glow={isLive}>
      {/* Section Title */}
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: isLive ? 'rgba(255,46,46,0.15)' : 'rgba(0,200,83,0.10)' }}
        >
          {isLive ? <Radio className="h-4 w-4" style={{ color: COLORS.accent }} /> : <Play className="h-4 w-4" style={{ color: COLORS.success }} />}
        </div>
        <h3 className="text-[14px] font-semibold text-white">Start Live Stream</h3>
      </div>

      {/* Category Toggle */}
      <div className="mb-4">
        <label className="block text-[11px] font-medium text-white/30 mb-2 uppercase tracking-wider">Category</label>
        <div className="flex gap-2">
          {(['cricket', 'football'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold capitalize transition-all duration-300"
              style={{
                background: category === cat
                  ? isLive
                    ? `linear-gradient(135deg, rgba(255,46,46,0.15), rgba(255,46,46,0.05))`
                    : `linear-gradient(135deg, rgba(0,200,83,0.12), rgba(0,200,83,0.04))`
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${category === cat ? (isLive ? 'rgba(255,46,46,0.25)' : 'rgba(0,200,83,0.20)') : COLORS.border}`,
                color: category === cat ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                boxShadow: category === cat
                  ? isLive
                    ? '0 0 20px rgba(255,46,46,0.08)'
                    : '0 0 20px rgba(0,200,83,0.06)'
                  : 'none',
              }}
            >
              {cat === 'cricket' ? '🏏' : '⚽'} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Match Title */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">Match Title</label>
          <span className={`text-[10px] ${titleCount > 100 ? 'font-semibold' : ''}`} style={{ color: titleCount > 100 ? COLORS.accent : 'rgba(255,255,255,0.20)' }}>
            {titleCount}/100
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setTitleCount(e.target.value.length) }}
          placeholder="e.g. India vs Australia - 3rd T20I"
          className="w-full rounded-xl border px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/15 focus:outline-none transition-all"
          style={{
            borderColor: titleCount > 100 ? 'rgba(255,46,46,0.30)' : COLORS.border,
            background: 'rgba(255,255,255,0.02)',
          }}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">Description</label>
          <span className={`text-[10px] ${descCount > 300 ? 'font-semibold' : ''}`} style={{ color: descCount > 300 ? COLORS.accent : 'rgba(255,255,255,0.20)' }}>
            {descCount}/300
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); setDescCount(e.target.value.length) }}
          placeholder="Add match details, commentary info..."
          rows={3}
          className="w-full resize-none rounded-xl border px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/15 focus:outline-none transition-all"
          style={{
            borderColor: descCount > 300 ? 'rgba(255,46,46,0.30)' : COLORS.border,
            background: 'rgba(255,255,255,0.02)',
          }}
        />
      </div>

      {/* Thumbnail Upload */}
      <div className="mb-5">
        <label className="block text-[11px] font-medium text-white/30 mb-1.5 uppercase tracking-wider">Thumbnail</label>
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition-all cursor-pointer hover:border-white/15 hover:bg-white/[0.01]"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <Upload className="h-6 w-6 text-white/15" />
          <p className="text-[12px] text-white/25">Drag & drop or click to upload</p>
          <p className="text-[10px] text-white/15">Recommended: 1280 x 720 (16:9)</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isLive ? (
          <>
            <button
              onClick={onGoLive}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold text-white transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, #FF2E2E, #cc1a1a)',
                boxShadow: '0 4px 24px rgba(255,46,46,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-full w-full rounded-full bg-white" />
              </span>
              Go Live Now
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-[13px] font-semibold text-white/40 transition-all hover:bg-white/[0.04] hover:text-white/60"
              style={{ borderColor: COLORS.border }}
            >
              <Radio className="h-4 w-4" />
              Test
            </button>
          </>
        ) : (
          <button
            onClick={onStopLive}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold text-white transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <Square className="h-4 w-4" />
            End Stream
          </button>
        )}
      </div>
    </GlassCard>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STREAM STATUS CARD
   ═══════════════════════════════════════════════════════════════ */

function StreamStatusCard({ isLive }: { isLive: boolean }) {
  return (
    <GlassCard className="p-5">
      <h3 className="text-[14px] font-semibold text-white mb-4">Stream Status</h3>
      <div className="flex flex-col items-center py-4">
        {/* Big Status Indicator */}
        <div className="relative mb-4">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-500 ${
              isLive ? 'animate-pulse' : ''
            }`}
            style={{
              background: isLive
                ? `radial-gradient(circle, rgba(255,46,46,0.20), rgba(255,46,46,0.05))`
                : 'rgba(255,255,255,0.03)',
              border: `2px solid ${isLive ? 'rgba(255,46,46,0.30)' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: isLive ? '0 0 60px rgba(255,46,46,0.15)' : 'none',
            }}
          >
            {isLive ? (
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-full w-full rounded-full bg-white" />
              </span>
            ) : (
              <WifiOff className="h-6 w-6 text-white/20" />
            )}
          </div>
        </div>

        <span
          className={`text-[16px] font-bold tracking-wider uppercase ${isLive ? 'animate-pulse' : ''}`}
          style={{ color: isLive ? COLORS.accent : 'rgba(255,255,255,0.25)' }}
        >
          {isLive ? '● LIVE' : '● OFFLINE'}
        </span>
        <p className="text-[12px] text-white/20 mt-1">
          {isLive ? 'Streaming to 24,532 viewers' : 'Ready to start streaming'}
        </p>
      </div>
    </GlassCard>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STREAM HEALTH CARD
   ═══════════════════════════════════════════════════════════════ */

function StreamHealthCard({ isLive }: { isLive: boolean }) {
  const metrics = [
    { label: 'Video Resolution', value: isLive ? '1920x1080' : 'N/A', status: isLive ? 'good' : 'bad' as const, icon: <Monitor className="h-3.5 w-3.5" /> },
    { label: 'Bitrate', value: isLive ? '4,500 kbps' : 'N/A', status: isLive ? 'good' : 'bad' as const, icon: <Signal className="h-3.5 w-3.5" /> },
    { label: 'Audio Bitrate', value: isLive ? '128 kbps' : 'N/A', status: isLive ? 'good' : 'bad' as const, icon: <Volume2 className="h-3.5 w-3.5" /> },
    { label: 'FPS', value: isLive ? '60' : 'N/A', status: isLive ? 'good' : 'bad' as const, icon: <Activity className="h-3.5 w-3.5" /> },
    { label: 'Dropped Frames', value: isLive ? '3 (0.05%)' : 'N/A', status: isLive ? 'good' : 'bad' as const, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  ]

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: isLive ? COLORS.success : 'rgba(255,255,255,0.20)' }} />
          Stream Health
        </h3>
        {isLive && (
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            style={{ background: 'rgba(0,200,83,0.10)', color: COLORS.success }}
          >
            <StatusDot status="online" size={5} /> Excellent
          </span>
        )}
      </div>
      <div className="divide-y" style={{ borderColor: COLORS.border }}>
        {metrics.map((m) => (
          <MetricItem key={m.label} label={m.label} value={m.value} icon={m.icon} status={m.status} />
        ))}
      </div>
    </GlassCard>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LIVE STATISTICS CARD
   ═══════════════════════════════════════════════════════════════ */

function LiveStatisticsCard({ isLive }: { isLive: boolean }) {
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => setDuration((d) => d + 1), 1000)
    return () => clearInterval(interval)
  }, [isLive])

  const stats = [
    { label: 'Duration', value: formatDuration(duration), icon: <Timer className="h-4 w-4" />, color: COLORS.accent },
    { label: 'Viewers', value: isLive ? '24,532' : '0', icon: <Eye className="h-4 w-4" />, color: COLORS.success },
    { label: 'Peak Viewers', value: isLive ? '31,205' : '0', icon: <TrendingUp className="h-4 w-4" />, color: COLORS.warning },
    { label: 'Data Used', value: isLive ? '2.4 GB' : '0 KB', icon: <HardDrive className="h-4 w-4" />, color: COLORS.info },
  ]

  return (
    <GlassCard className="p-5">
      <h3 className="text-[14px] font-semibold text-white mb-4">Live Statistics</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3 text-center transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${COLORS.border}` }}
          >
            <div className="flex justify-center mb-2" style={{ color: s.color }}>{s.icon}</div>
            <p className="text-[16px] font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-white/25 mt-0.5 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ═══════════════════════════════════════════════════════════════
   RECENT STREAMS CARD
   ═══════════════════════════════════════════════════════════════ */

function RecentStreamsCard() {
  const recentStreams = [
    { title: 'India vs England - 2nd T20I', date: 'Yesterday', duration: '3h 45m', viewers: '42.1K', isReplay: true },
    { title: 'Arsenal vs Chelsea - EPL', date: '2 days ago', duration: '2h 10m', viewers: '38.5K', isReplay: true },
    { title: 'Australia vs New Zealand - ODI', date: '3 days ago', duration: '4h 20m', viewers: '29.3K', isReplay: false },
    { title: 'Man City vs Liverpool - UCL', date: '5 days ago', duration: '2h 05m', viewers: '51.2K', isReplay: true },
  ]

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Recent Streams</h3>
        <button className="text-[11px] font-medium" style={{ color: COLORS.accent }}>View All</button>
      </div>
      <div className="space-y-2.5">
        {recentStreams.map((stream, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl p-2.5 transition-all cursor-pointer hover:bg-white/[0.02]"
            style={{ border: `1px solid transparent` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.borderHover }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
          >
            <div
              className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded-lg overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #111827, #1f2937)' }}
            >
              <Play className="h-3.5 w-3.5 text-white/30" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white/70 truncate">{stream.title}</p>
              <p className="text-[10px] text-white/25 mt-0.5">{stream.date} • {stream.duration}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {stream.isReplay && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,200,83,0.10)', color: COLORS.success }}>
                  Replay
                </span>
              )}
              <span className="text-[10px] text-white/25">{stream.viewers}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STREAMING CHECKLIST (BOTTOM)
   ═══════════════════════════════════════════════════════════════ */

function StreamingChecklist({ isLive }: { isLive: boolean }) {
  const checklistItems = [
    { label: 'Encoder Connected', status: isLive ? 'online' as const : 'online' as const, icon: <Cpu className="h-4 w-4" /> },
    { label: 'Stream Key Valid', status: 'online', icon: <Lock className="h-4 w-4" /> },
    { label: 'Video Input', status: isLive ? 'online' as const : 'warning' as const, icon: <Monitor className="h-4 w-4" /> },
    { label: 'Audio Input', status: isLive ? 'online' as const : 'online' as const, icon: <Volume2 className="h-4 w-4" /> },
    { label: 'Internet Status', status: 'online', icon: <Wifi className="h-4 w-4" /> },
    { label: 'Server Connection', status: isLive ? 'online' as const : 'online' as const, icon: <Shield className="h-4 w-4" /> },
  ]

  const completedCount = checklistItems.filter((i) => i.status === 'online').length
  const totalCount = checklistItems.length
  const progressPct = (completedCount / totalCount) * 100

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
          <ClipboardList className="h-4 w-4" style={{ color: progressPct === 100 ? COLORS.success : COLORS.warning }} />
          Streaming Checklist
        </h3>
        <span className="text-[11px] font-semibold" style={{ color: progressPct === 100 ? COLORS.success : 'rgba(255,255,255,0.30)' }}>
          {completedCount}/{totalCount} Ready
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progressPct}%`,
            background: progressPct === 100
              ? `linear-gradient(90deg, ${COLORS.success}, #00e676)`
              : `linear-gradient(90deg, ${COLORS.warning}, ${COLORS.accent})`,
            boxShadow: progressPct === 100 ? '0 0 12px rgba(0,200,83,0.30)' : 'none',
          }}
        />
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {checklistItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all"
            style={{
              borderColor: item.status === 'online' ? 'rgba(0,200,83,0.12)' : 'rgba(255,184,0,0.12)',
              background: item.status === 'online' ? 'rgba(0,200,83,0.03)' : 'rgba(255,184,0,0.03)',
            }}
          >
            <span style={{ color: item.status === 'online' ? COLORS.success : COLORS.warning }}>
              {item.icon}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <StatusDot status={item.status} size={5} />
                <span className="text-[11px] font-medium text-white/60">{item.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PAGE CONTENT ROUTER
   ═══════════════════════════════════════════════════════════════ */

function PageContent({ activePage, isLive, onGoLive, onStopLive }: {
  activePage: SidebarPage
  isLive: boolean
  onGoLive: () => void
  onStopLive: () => void
}) {
  if (activePage === 'dashboard') return <DashboardPageContent />
  if (activePage === 'live-control') return <LiveControlPageContent isLive={isLive} onGoLive={onGoLive} onStopLive={onStopLive} />
  if (activePage === 'settings') return <SettingsPageContent />
  if (activePage === 'analytics') return <AnalyticsPageContent />
  if (activePage === 'stream-history') return <StreamHistoryContent />
  if (activePage === 'videos') return <GenericPageContent title="Videos" subtitle="Manage your video content library" icon={<Video className="h-5 w-5" style={{ color: COLORS.info }} />} />
  if (activePage === 'highlights') return <GenericPageContent title="Highlights" subtitle="Curate and manage match highlights" icon={<Film className="h-5 w-5" style={{ color: COLORS.warning }} />} />
  if (activePage === 'schedules') return <GenericPageContent title="Schedules" subtitle="Manage upcoming match schedules" icon={<CalendarClock className="h-5 w-5" style={{ color: COLORS.success }} />} />

  return null
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════════ */

function DashboardPageContent() {
  const overviewStats = [
    { label: 'Total Streams', value: '1,247', change: '+12%', icon: <Radio className="h-5 w-5" />, color: COLORS.accent },
    { label: 'Total Viewers', value: '2.4M', change: '+23%', icon: <Eye className="h-5 w-5" />, color: COLORS.success },
    { label: 'Watch Hours', value: '18.5K', change: '+8%', icon: <Clock className="h-5 w-5" />, color: COLORS.warning },
    { label: 'Revenue', value: '$24.5K', change: '+15%', icon: <TrendingUp className="h-5 w-5" />, color: COLORS.info },
  ]

  const topStreams = [
    { title: 'India vs England - T20 World Cup Final', viewers: '245K', duration: '4h 12m', date: 'Oct 15', revenue: '$3,200' },
    { title: 'Arsenal vs Man City - EPL Derby', viewers: '198K', duration: '2h 05m', date: 'Oct 14', revenue: '$2,800' },
    { title: 'Australia vs South Africa - ODI', viewers: '156K', duration: '3h 45m', date: 'Oct 13', revenue: '$2,100' },
    { title: 'NBA Finals Game 7 - Lakers vs Celtics', viewers: '312K', duration: '2h 30m', date: 'Oct 12', revenue: '$4,500' },
    { title: 'F1 Monaco Grand Prix', viewers: '189K', duration: '1h 55m', date: 'Oct 11', revenue: '$2,600' },
  ]

  const activityFeed = [
    { text: 'Stream "India vs Australia" went live', time: '2 min ago', type: 'live' },
    { text: 'New subscriber: Premium Plan activated', time: '15 min ago', type: 'user' },
    { text: 'Highlight video "Best Goals EPL" published', time: '1 hour ago', type: 'content' },
    { text: 'System maintenance completed', time: '2 hours ago', type: 'system' },
    { text: 'Stream "Arsenal vs Chelsea" ended - 38.5K peak', time: '3 hours ago', type: 'live' },
  ]

  return (
    <div className="space-y-6 fade-in-up">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-white/35 font-medium">{stat.label}</span>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <span
                className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,200,83,0.10)', color: COLORS.success }}
              >
                {stat.change}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Top Streams Table */}
        <GlassCard className="lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-white">Top Performing Streams</h3>
            <button className="text-[11px] font-medium" style={{ color: COLORS.accent }}>See All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: COLORS.border }}>
                  {['Stream', 'Viewers', 'Duration', 'Revenue'].map((h) => (
                    <th key={h} className="pb-3 text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topStreams.map((s, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-white/[0.01]" style={{ borderColor: COLORS.border }}>
                    <td className="py-3 pr-4">
                      <p className="text-[12px] font-medium text-white/70 truncate max-w-[200px]">{s.title}</p>
                      <p className="text-[10px] text-white/20">{s.date}</p>
                    </td>
                    <td className="py-3 text-[12px] font-semibold text-white/60">{s.viewers}</td>
                    <td className="py-3 text-[12px] text-white/40">{s.duration}</td>
                    <td className="py-3 text-[12px] font-semibold" style={{ color: COLORS.success }}>{s.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Activity Feed */}
        <GlassCard className="lg:col-span-2 p-5">
          <h3 className="text-[14px] font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-0 max-h-[320px] overflow-y-auto no-scrollbar">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b last:border-0" style={{ borderColor: COLORS.border }}>
                <div
                  className="mt-0.5 h-2 w-2 rounded-full flex-shrink-0"
                  style={{
                    background: item.type === 'live' ? COLORS.accent : item.type === 'user' ? COLORS.success : item.type === 'content' ? COLORS.warning : COLORS.info,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-white/50 leading-relaxed">{item.text}</p>
                  <p className="text-[10px] text-white/20 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Viewer Chart Placeholder */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-white">Viewer Analytics (7 Days)</h3>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-white/30">
              <span className="h-2 w-2 rounded-full" style={{ background: COLORS.accent }} /> Viewers
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-white/30">
              <span className="h-2 w-2 rounded-full" style={{ background: COLORS.success }} /> Watch Time
            </span>
          </div>
        </div>
        <div className="flex h-40 items-end gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const height = 30 + Math.random() * 60
            const height2 = 20 + Math.random() * 50
            return (
              <div key={i} className="flex-1 flex items-end gap-1">
                <div
                  className="flex-1 rounded-t-md transition-all duration-500 hover:opacity-80"
                  style={{ height: `${height}%`, background: `linear-gradient(180deg, ${COLORS.accent}40, ${COLORS.accent}10)` }}
                />
                <div
                  className="flex-1 rounded-t-md transition-all duration-500 hover:opacity-80"
                  style={{ height: `${height2}%`, background: `linear-gradient(180deg, ${COLORS.success}40, ${COLORS.success}10)` }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 px-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d} className="flex-1 text-center text-[10px] text-white/15">{d}</span>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LIVE CONTROL PAGE (Main Grid)
   ═══════════════════════════════════════════════════════════════ */

function LiveControlPageContent({ isLive, onGoLive, onStopLive }: {
  isLive: boolean
  onGoLive: () => void
  onStopLive: () => void
}) {
  return (
    <div className="space-y-6 fade-in-up">
      {/* 3 Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-1 space-y-5">
          <StreamPreviewCard isLive={isLive} onGoLive={onGoLive} />
          <StreamConnectionCard />
        </div>

        {/* CENTER COLUMN */}
        <div className="xl:col-span-1">
          <StartLiveStreamCard isLive={isLive} onGoLive={onGoLive} onStopLive={onStopLive} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-1 space-y-5">
          <StreamStatusCard isLive={isLive} />
          <StreamHealthCard isLive={isLive} />
          <LiveStatisticsCard isLive={isLive} />
          <RecentStreamsCard />
        </div>
      </div>

      {/* BOTTOM - Streaming Checklist */}
      <StreamingChecklist isLive={isLive} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════════════════════════ */

function SettingsPageContent() {
  return (
    <div className="space-y-6 fade-in-up">
      <GlassCard className="p-5">
        <h3 className="text-[14px] font-semibold text-white mb-4">Platform Settings</h3>
        <div className="space-y-4">
          {[
            { label: 'Auto-start Stream', desc: 'Automatically start streaming when encoder connects', value: true },
            { label: 'Low Latency Mode', desc: 'Reduce stream delay (may increase CPU usage)', value: false },
            { label: 'Auto-record Streams', desc: 'Save all live streams for replay', value: true },
            { label: 'Chat Moderation', desc: 'Enable AI-powered chat moderation', value: true },
            { label: 'Email Notifications', desc: 'Get notified about stream events', value: false },
            { label: 'DVR Support', desc: 'Enable DVR for live streams', value: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: COLORS.border }}>
              <div>
                <p className="text-[13px] font-medium text-white/70">{setting.label}</p>
                <p className="text-[11px] text-white/25 mt-0.5">{setting.desc}</p>
              </div>
              <button
                className="relative h-6 w-11 rounded-full transition-all duration-200"
                style={{ background: setting.value ? COLORS.success : 'rgba(255,255,255,0.08)' }}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200"
                  style={{ left: setting.value ? '22px' : '2px' }}
                />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS PAGE
   ═══════════════════════════════════════════════════════════════ */

function AnalyticsPageContent() {
  const analyticsStats = [
    { label: 'Total Views', value: '2.4M', change: '+23%', color: COLORS.accent },
    { label: 'Unique Viewers', value: '845K', change: '+15%', color: COLORS.success },
    { label: 'Avg. Watch Time', value: '32 min', change: '+8%', color: COLORS.warning },
    { label: 'Subscribers', value: '24.5K', change: '+12%', color: COLORS.info },
    { label: 'Revenue', value: '$24.5K', change: '+18%', color: COLORS.success },
    { label: 'Engagement Rate', value: '7.2%', change: '+3%', color: COLORS.warning },
  ]

  return (
    <div className="space-y-6 fade-in-up">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsStats.map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <span className="text-[12px] text-white/30 font-medium">{stat.label}</span>
            <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
            <span className="text-[11px] font-semibold" style={{ color: COLORS.success }}>+{stat.change}</span>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <h3 className="text-[14px] font-semibold text-white mb-4">Views Over Time (30 Days)</h3>
        <div className="flex h-48 items-end gap-1">
          {Array.from({ length: 30 }, (_, i) => {
            const height = 10 + Math.random() * 85
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-70"
                style={{
                  height: `${height}%`,
                  background: `linear-gradient(180deg, ${COLORS.accent}30, ${COLORS.accent}05)`,
                }}
              />
            )
          })}
        </div>
      </GlassCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STREAM HISTORY PAGE
   ═══════════════════════════════════════════════════════════════ */

function StreamHistoryContent() {
  const history = [
    { id: 1, title: 'India vs England - T20 World Cup Final', date: 'Oct 15, 2024', duration: '4h 12m', peak: '245K', avg: '182K', status: 'completed' },
    { id: 2, title: 'Arsenal vs Man City - EPL Derby', date: 'Oct 14, 2024', duration: '2h 05m', peak: '198K', avg: '156K', status: 'completed' },
    { id: 3, title: 'Australia vs South Africa - ODI', date: 'Oct 13, 2024', duration: '3h 45m', peak: '156K', avg: '124K', status: 'completed' },
    { id: 4, title: 'NBA Finals Game 7 - Lakers vs Celtics', date: 'Oct 12, 2024', duration: '2h 30m', peak: '312K', avg: '267K', status: 'completed' },
    { id: 5, title: 'F1 Monaco Grand Prix', date: 'Oct 11, 2024', duration: '1h 55m', peak: '189K', avg: '145K', status: 'completed' },
    { id: 6, title: 'India vs Australia - 3rd Test Day 5', date: 'Oct 10, 2024', duration: '8h 30m', peak: '98K', avg: '67K', status: 'completed' },
  ]

  return (
    <div className="space-y-6 fade-in-up">
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-white">Stream History</h3>
          <div className="flex gap-2">
            <button className="rounded-lg border px-3 py-1.5 text-[11px] font-medium text-white/40 transition-all hover:bg-white/[0.04]" style={{ borderColor: COLORS.border }}>All</button>
            <button className="rounded-lg border px-3 py-1.5 text-[11px] font-medium text-white/40 transition-all hover:bg-white/[0.04]" style={{ borderColor: COLORS.border }}>This Week</button>
            <button className="rounded-lg border px-3 py-1.5 text-[11px] font-medium text-white/40 transition-all hover:bg-white/[0.04]" style={{ borderColor: COLORS.border }}>This Month</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: COLORS.border }}>
                {['Stream', 'Date', 'Duration', 'Peak Viewers', 'Avg Viewers', 'Status'].map((h) => (
                  <th key={h} className="pb-3 text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b transition-colors hover:bg-white/[0.01]" style={{ borderColor: COLORS.border }}>
                  <td className="py-3 pr-4">
                    <p className="text-[12px] font-medium text-white/70 truncate max-w-[240px]">{h.title}</p>
                  </td>
                  <td className="py-3 text-[12px] text-white/40">{h.date}</td>
                  <td className="py-3 text-[12px] text-white/40">{h.duration}</td>
                  <td className="py-3 text-[12px] font-semibold text-white/60">{h.peak}</td>
                  <td className="py-3 text-[12px] text-white/40">{h.avg}</td>
                  <td className="py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(0,200,83,0.10)', color: COLORS.success }}>
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   GENERIC PAGE PLACEHOLDER
   ═══════════════════════════════════════════════════════════════ */

function GenericPageContent({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-[12px] text-white/30">{subtitle}</p>
        </div>
      </div>

      <GlassCard className="p-12 flex flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {icon}
        </div>
        <p className="text-[15px] font-semibold text-white/50">{title}</p>
        <p className="text-[13px] text-white/25 mt-1">Manage your {title.toLowerCase()} content here</p>
        <button
          className="mt-4 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, rgba(255,46,46,0.15), rgba(255,46,46,0.05))', border: `1px solid rgba(255,46,46,0.20)` }}
        >
          + Add New
        </button>
      </GlassCard>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT: LIVE CONTROL ROOM
   ═══════════════════════════════════════════════════════════════ */

export default function LiveControlRoom() {
  const { setCurrentView } = useAppStore()
  const [activePage, setActivePage] = useState<SidebarPage>('live-control')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLive, setIsLive] = useState(false)

  const handleGoLive = useCallback(() => setIsLive(true), [])
  const handleStopLive = useCallback(() => setIsLive(false), [])
  const handleBack = useCallback(() => setCurrentView('home'), [setCurrentView])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => {
      // Simple approach: click anywhere closes dropdowns (handled by React state)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.bgSecondary})` }}>
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onBack={handleBack}
      />

      {/* Header */}
      <TopHeader sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main
        className="min-h-[calc(100vh-70px)] p-6 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <PageContent
          activePage={activePage}
          isLive={isLive}
          onGoLive={handleGoLive}
          onStopLive={handleStopLive}
        />
      </main>
    </div>
  )
}
