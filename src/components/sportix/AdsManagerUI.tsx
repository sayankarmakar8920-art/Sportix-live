'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Megaphone, Eye, MousePointerClick, DollarSign, Plus, Search,
  Edit3, Trash2, Pause, Play, Image, Layout, ToggleLeft, ToggleRight,
  Calendar, ArrowUpRight, BarChart3, Settings, RefreshCw, Filter,
  CheckCircle, XCircle, Clock, TrendingUp, Globe, Monitor, Smartphone,
  Target, Copy, ExternalLink,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════ */
const C = {
  bg: '#0a0a0a',
  card: '#141414',
  border: 'rgba(255,255,255,0.08)',
  accent: '#E50914',
  accentDim: 'rgba(229,9,20,0.12)',
  success: '#22c55e',
  warning: '#eab308',
  info: '#3b82f6',
  purple: '#a855f7',
  text: '#ffffff',
  textSec: '#a1a1aa',
  textTer: '#71717a',
  textDim: '#52525b',
}

/* ═══════════════════════════════════════════════════
   TYPES & MOCK DATA
   ═══════════════════════════════════════════════════ */
interface BannerAd {
  id: string
  title: string
  type: 'banner' | 'overlay' | 'popup' | 'hero'
  position: 'top' | 'bottom' | 'sidebar' | 'hero' | 'footer'
  deviceTarget: 'all' | 'mobile' | 'desktop'
  status: 'active' | 'paused' | 'draft' | 'expired'
  impressions: number
  clicks: number
  ctr: number
  cpm: number
  revenue: number
  scheduleStart: string
  scheduleEnd: string
  targetUrl: string
}

const MOCK_ADS: BannerAd[] = [
  { id: '1', title: 'Nike Summer Campaign', type: 'banner', position: 'hero', deviceTarget: 'all', status: 'active', impressions: 342500, clicks: 18920, ctr: 5.52, cpm: 3.80, revenue: 1301.50, scheduleStart: '2025-05-01', scheduleEnd: '2025-06-30', targetUrl: 'https://nike.com/summer' },
  { id: '2', title: 'Coca-Cola Overlay', type: 'overlay', position: 'bottom', deviceTarget: 'mobile', status: 'active', impressions: 218400, clicks: 9828, ctr: 4.5, cpm: 2.50, revenue: 546.00, scheduleStart: '2025-04-15', scheduleEnd: '2025-07-15', targetUrl: 'https://cocacola.com' },
  { id: '3', title: 'Samsung Banner Ad', type: 'banner', position: 'sidebar', deviceTarget: 'desktop', status: 'active', impressions: 156700, clicks: 5485, ctr: 3.5, cpm: 4.20, revenue: 658.14, scheduleStart: '2025-05-10', scheduleEnd: '2025-08-10', targetUrl: 'https://samsung.com' },
  { id: '4', title: 'Red Bull Popup', type: 'popup', position: 'top', deviceTarget: 'all', status: 'paused', impressions: 89200, clicks: 6244, ctr: 7.0, cpm: 5.00, revenue: 446.00, scheduleStart: '2025-03-01', scheduleEnd: '2025-05-01', targetUrl: 'https://redbull.com' },
  { id: '5', title: 'Adidas Footer Banner', type: 'banner', position: 'footer', deviceTarget: 'all', status: 'active', impressions: 267800, clicks: 10712, ctr: 4.0, cpm: 3.20, revenue: 856.96, scheduleStart: '2025-05-01', scheduleEnd: '2025-07-01', targetUrl: 'https://adidas.com' },
  { id: '6', title: 'BMW Hero Banner', type: 'hero', position: 'hero', deviceTarget: 'desktop', status: 'draft', impressions: 0, clicks: 0, ctr: 0, cpm: 0, revenue: 0, scheduleStart: '2025-06-01', scheduleEnd: '2025-08-31', targetUrl: 'https://bmw.com' },
  { id: '7', title: 'Uber Eats Mobile', type: 'overlay', position: 'bottom', deviceTarget: 'mobile', status: 'active', impressions: 421000, clicks: 18945, ctr: 4.5, cpm: 2.80, revenue: 1178.80, scheduleStart: '2025-04-01', scheduleEnd: '2025-06-30', targetUrl: 'https://ubereats.com' },
  { id: '8', title: 'Spotify Sidebar', type: 'banner', position: 'sidebar', deviceTarget: 'desktop', status: 'expired', impressions: 198400, clicks: 7142, ctr: 3.6, cpm: 3.50, revenue: 694.40, scheduleStart: '2025-01-01', scheduleEnd: '2025-04-01', targetUrl: 'https://spotify.com' },
]

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */
function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function StatusBadge({ status }: { status: BannerAd['status'] }) {
  const cfg: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    active: { color: C.success, bg: 'rgba(34,197,94,0.12)', icon: <CheckCircle className="h-3 w-3" /> },
    paused: { color: C.warning, bg: 'rgba(234,179,8,0.12)', icon: <Pause className="h-3 w-3" /> },
    draft: { color: C.info, bg: 'rgba(59,130,246,0.12)', icon: <Edit3 className="h-3 w-3" /> },
    expired: { color: C.textDim, bg: 'rgba(82,82,91,0.12)', icon: <XCircle className="h-3 w-3" /> },
  }
  const c = cfg[status] || cfg.draft
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: c.bg, color: c.color }}>
      {c.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function AdsManagerUI() {
  const [ads, setAds] = useState<BannerAd[]>(MOCK_ADS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'draft' | 'expired'>('all')

  // Simulated realtime updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAds(prev => prev.map(ad => {
        if (ad.status !== 'active') return ad
        const impInc = Math.floor(Math.random() * 50 + 10)
        const clickInc = Math.floor(Math.random() * 5)
        const newImp = ad.impressions + impInc
        const newClicks = ad.clicks + clickInc
        return {
          ...ad,
          impressions: newImp,
          clicks: newClicks,
          ctr: newImp > 0 ? (newClicks / newImp) * 100 : 0,
        }
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Computed stats
  const totalImpressions = ads.filter(a => a.status === 'active').reduce((s, a) => s + a.impressions, 0)
  const totalClicks = ads.filter(a => a.status === 'active').reduce((s, a) => s + a.clicks, 0)
  const totalRevenue = ads.filter(a => a.status === 'active').reduce((s, a) => s + a.revenue, 0)
  const activeCount = ads.filter(a => a.status === 'active').length
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

  // Filtered ads
  const filteredAds = ads.filter(ad => {
    if (activeTab !== 'all' && ad.status !== activeTab) return false
    if (filterType !== 'all' && ad.type !== filterType) return false
    if (searchQuery && !ad.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const toggleAdStatus = (id: string) => {
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, status: ad.status === 'active' ? 'paused' as const : 'active' as const } : ad))
  }

  const deleteAd = (id: string) => {
    setAds(prev => prev.filter(ad => ad.id !== id))
  }

  return (
    <div className="space-y-4 fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: C.accentDim }}>
            <Megaphone className="h-5 w-5" style={{ color: C.accent }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Ads Manager</h2>
            <p className="text-xs" style={{ color: C.textTer }}>Manage banner, overlay & popup ads</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}>
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}>
            <Filter className="h-3 w-3" /> Filter
          </button>
          <button className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-semibold text-white transition-all hover:brightness-110" style={{ background: C.accent }}>
            <Plus className="h-3.5 w-3.5" /> New Ad
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          { label: 'Active Ads', value: String(activeCount), change: '+2', icon: Megaphone, color: C.accent },
          { label: 'Impressions', value: fmtNum(totalImpressions), change: '+12.5%', icon: Eye, color: C.info },
          { label: 'Clicks', value: fmtNum(totalClicks), change: '+8.3%', icon: MousePointerClick, color: C.success },
          { label: 'Revenue', value: fmtCurrency(totalRevenue), change: '+15.2%', icon: DollarSign, color: C.warning },
          { label: 'Avg CTR', value: avgCTR.toFixed(2) + '%', change: '+0.4%', icon: TrendingUp, color: C.purple },
        ].map(kpi => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="rounded-2xl border p-4 transition-all" style={{ background: C.card, borderColor: C.border }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{kpi.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${kpi.color}15` }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="text-xl font-bold text-white">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <ArrowUpRight className="h-3 w-3" style={{ color: C.success }} />
                <span className="text-[10px] font-semibold" style={{ color: C.success }}>{kpi.change}</span>
                <span className="text-[9px]" style={{ color: C.textDim }}>vs last 7d</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'active', 'paused', 'draft', 'expired'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab ? C.accentDim : 'transparent',
              color: activeTab === tab ? C.accent : C.textTer,
              border: `1px solid ${activeTab === tab ? 'rgba(229,9,20,0.25)' : C.border}`,
            }}
          >
            {tab === 'all' ? 'All Ads' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: `${C.border}`, color: C.textSec }}>
              {tab === 'all' ? ads.length : ads.filter(a => a.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
          <Search className="h-4 w-4" style={{ color: C.textDim }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ads..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="rounded-xl border px-3 py-2 text-[11px] font-medium bg-transparent focus:outline-none"
          style={{ borderColor: C.border, color: C.textSec }}
        >
          <option value="all" style={{ background: '#1a1a1a' }}>All Types</option>
          <option value="banner" style={{ background: '#1a1a1a' }}>Banner</option>
          <option value="overlay" style={{ background: '#1a1a1a' }}>Overlay</option>
          <option value="popup" style={{ background: '#1a1a1a' }}>Popup</option>
          <option value="hero" style={{ background: '#1a1a1a' }}>Hero</option>
        </select>
      </div>

      {/* Ads Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: C.card, borderColor: C.border }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Ad', 'Type', 'Position', 'Device', 'Status', 'Impressions', 'Clicks', 'CTR', 'Revenue', 'Schedule', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAds.map(ad => (
                <tr key={ad.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${C.accent}15` }}>
                        <Image className="h-4 w-4" style={{ color: C.accent }} />
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-white">{ad.title}</p>
                        <a href={ad.targetUrl} target="_blank" rel="noopener" className="text-[10px] flex items-center gap-1 hover:underline" style={{ color: C.textTer }}>
                          {ad.targetUrl} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: C.textSec }}>
                      {ad.type === 'hero' ? <Layout className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                      {ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px]" style={{ color: C.textSec }}>{ad.position}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: C.textTer }}>
                      {ad.deviceTarget === 'mobile' ? <Smartphone className="h-3 w-3" /> : ad.deviceTarget === 'desktop' ? <Monitor className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      {ad.deviceTarget.charAt(0).toUpperCase() + ad.deviceTarget.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={ad.status} /></td>
                  <td className="px-4 py-3 text-[11px] font-medium" style={{ color: C.textSec }}>{fmtNum(ad.impressions)}</td>
                  <td className="px-4 py-3 text-[11px] font-medium" style={{ color: C.info }}>{fmtNum(ad.clicks)}</td>
                  <td className="px-4 py-3 text-[11px] font-semibold" style={{ color: ad.ctr >= 5 ? C.success : C.warning }}>{ad.ctr.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-[11px] font-semibold" style={{ color: C.success }}>{fmtCurrency(ad.revenue)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px]" style={{ color: C.textTer }}>{ad.scheduleStart}</span>
                      <span className="text-[9px]" style={{ color: C.textDim }}>to {ad.scheduleEnd}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleAdStatus(ad.id)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]"
                        style={{ color: ad.status === 'active' ? C.warning : C.success }}
                        title={ad.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        {ad.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Edit3 className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Copy className="h-3.5 w-3.5" /></button>
                      <button
                        onClick={() => deleteAd(ad.id)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]"
                        style={{ color: C.accent }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAds.length === 0 && (
          <div className="py-12 text-center">
            <Megaphone className="h-8 w-8 mx-auto mb-2" style={{ color: C.textDim }} />
            <p className="text-sm" style={{ color: C.textTer }}>No ads found</p>
          </div>
        )}
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: C.border }}>
          <span className="text-[11px]" style={{ color: C.textTer }}>Showing {filteredAds.length} of {ads.length} ads</span>
          <div className="flex items-center gap-1">
            <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/[0.04]" style={{ color: C.textTer }}>Previous</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-medium" style={{ background: C.accent, color: '#fff' }}>1</button>
            <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/[0.04]" style={{ color: C.textTer }}>Next</button>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <h3 className="text-sm font-semibold text-white mb-3">Top Performing Ad</h3>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <TrophyIcon />
            </div>
            <div>
              <p className="text-[12px] font-medium text-white">{ads.sort((a, b) => b.ctr - a.ctr)[0]?.title}</p>
              <p className="text-[10px]" style={{ color: C.success }}>CTR: {ads[0]?.ctr.toFixed(2)}% • {fmtNum(ads[0]?.impressions || 0)} impressions</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <h3 className="text-sm font-semibold text-white mb-3">Device Split</h3>
          <div className="space-y-2">
            {[
              { label: 'Desktop', pct: 45, color: C.info },
              { label: 'Mobile', pct: 48, color: C.success },
              { label: 'Tablet', pct: 7, color: C.warning },
            ].map(d => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-[10px] w-14" style={{ color: C.textTer }}>{d.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
                <span className="text-[10px] font-semibold w-8 text-right" style={{ color: C.textSec }}>{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.border }}>
          <h3 className="text-sm font-semibold text-white mb-3">Quick Stats</h3>
          <div className="space-y-2">
            {[
              { label: 'Total Revenue (All)', value: fmtCurrency(ads.reduce((s, a) => s + a.revenue, 0)), color: C.success },
              { label: 'Best Day CTR', value: '7.0%', color: C.warning },
              { label: 'Avg CPM', value: '$' + (totalImpressions > 0 ? (totalRevenue / totalImpressions * 1000).toFixed(2) : '0.00'), color: C.info },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: C.textTer }}>{s.label}</span>
                <span className="text-[12px] font-semibold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
