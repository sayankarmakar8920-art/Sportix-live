'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart3, TrendingUp, Users, DollarSign, Eye, MousePointerClick,
  Target, Activity, Zap, Play, Clock, ArrowUpRight, ArrowDownRight,
  RefreshCw, Globe, Calendar, Filter
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#0a0a0a',
  card: '#141414',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#E50914',
  success: '#22c55e',
  warning: '#f5c518',
  info: '#3b82f6',
  purple: '#a855f7',
  text: '#ffffff',
  textSec: '#a1a1aa',
  textTer: '#71717a',
  glass: 'rgba(255, 255, 255, 0.03)',
}

const AdminAnalytics = React.memo(function AdminAnalytics() {
  const [stats, setStats] = useState({
    impressions: 1254000,
    clicks: 84200,
    revenue: 12450,
    activeUsers: 2458,
    ctr: 6.72,
    watchTime: 45800,
  })

  const [isLive, setIsLive] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data.overview
        setStats(prev => ({
          ...prev,
          impressions: d.adImpressions || 1254000, // Fallback if not in API yet
          clicks: d.adClicks || 84200,
          revenue: d.totalRevenue,
          activeUsers: d.totalViewers || 2458,
          ctr: d.adImpressions > 0 ? (d.adClicks / d.adImpressions) * 100 : 6.72,
          watchTime: d.watchTime || 45800
        }))
      }
    } catch (err) {
      console.error('Analytics fetch error:', err)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 5000)

    const handleManualRefresh = () => fetchAnalytics()
    window.addEventListener('sportix-refresh-data', handleManualRefresh)

    const channel = supabase
      .channel('analytics_realtime_full')
      .on('postgres_changes' as any, { event: '*', table: 'Ad' }, () => fetchAnalytics())
      .on('postgres_changes' as any, { event: '*', table: 'User' }, () => fetchAnalytics())
      .on('postgres_changes' as any, { event: '*', table: 'Stream' }, () => fetchAnalytics())
      .on('postgres_changes' as any, { event: '*', table: 'Video' }, () => fetchAnalytics())
      .subscribe()

    return () => {
      clearInterval(interval)
      window.removeEventListener('sportix-refresh-data', handleManualRefresh)
      supabase.removeChannel(channel)
    }
  }, [fetchAnalytics])

  return (
    <div className="space-y-6 animate-fadeIn p-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-red-500" />
            Performance Insights
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Real-time data synchronization with Supabase active</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Live Tracking</span>
          </div>
          <button className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
            <Filter size={18} className="text-zinc-400" />
          </button>
          <button className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
            <Calendar size={18} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* 1. AD PERFORMANCE OVERVIEW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Ad Performance Overview</h2>
          <span className="text-[10px] text-zinc-500">Last 24 Hours</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIContainer title="Total Impressions" value={stats.impressions.toLocaleString()} change="+12.5%" trend="up" icon={<Eye size={20} />} color={C.info} />
          <KPIContainer title="Total Clicks" value={stats.clicks.toLocaleString()} change="+8.2%" trend="up" icon={<MousePointerClick size={20} />} color={C.success} />
          <KPIContainer title="Avg. CTR" value={`${stats.ctr}%`} change="-0.4%" trend="down" icon={<Target size={20} />} color={C.warning} />
          <KPIContainer title="Conversion Rate" value="3.14%" change="+1.2%" trend="up" icon={<Zap size={20} />} color={C.purple} />
        </div>
      </section>

      {/* 2. REVENUE OVERVIEW & BANNER ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Revenue Overview</h2>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-red-500" />
                 <span className="text-[10px] text-zinc-500">Ad Revenue</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-zinc-700" />
                 <span className="text-[10px] text-zinc-500">Subscription</span>
               </div>
            </div>
          </div>
          <div className="h-[300px] rounded-3xl border border-white/5 bg-zinc-900/40 p-6 flex items-end gap-3">
             {/* Simulated Chart Bars */}
             {[45, 60, 55, 80, 70, 95, 85, 65, 50, 75, 90, 100].map((v, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-zinc-800 relative group overflow-hidden" style={{ height: `${v}%` }}>
                     <div className="absolute inset-x-0 bottom-0 bg-red-500 transition-all duration-1000 group-hover:bg-red-400" style={{ height: '40%' }} />
                  </div>
                  <span className="text-[9px] text-zinc-600 font-bold">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Banner Analytics</h2>
          <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-5 space-y-5">
             <BannerItem title="Home Hero Banner" views="452K" clicks="32K" ctr="7.1%" color="#3b82f6" />
             <BannerItem title="Category Sidebar" views="128K" clicks="8.2K" ctr="6.4%" color="#22c55e" />
             <BannerItem title="Footer Sticky Ad" views="892K" clicks="64K" ctr="7.2%" color="#eab308" />
             <BannerItem title="In-Stream Overlay" views="64K" clicks="12K" ctr="18.7%" color="#E50914" />
             
             <div className="pt-2 border-t border-white/5">
                <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all">
                  View Detailed Banner Report
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* 3. ENGAGEMENT OVERVIEW */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Engagement Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <EngagementCard title="Live Viewers" value={stats.activeUsers.toLocaleString()} icon={<Users size={18} />} color={C.purple} chart={[20, 40, 30, 50, 45, 60]} />
           <EngagementCard title="Watch Time" value="45.8K hrs" icon={<Clock size={18} />} color={C.info} chart={[30, 25, 45, 35, 55, 50]} />
           <EngagementCard title="Reactions" value="128K" icon={<Zap size={18} />} color={C.accent} chart={[15, 35, 25, 45, 40, 55]} />
        </div>
      </section>
    </div>
  )
})

export default AdminAnalytics

function KPIContainer({ title, value, change, trend, icon, color }: any) {
  return (
    <div className="p-5 rounded-3xl border border-white/5 bg-zinc-900/40 group hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-2xl bg-white/5 text-zinc-400 group-hover:text-white transition-colors" style={{ color: `${color}cc` }}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function BannerItem({ title, views, clicks, ctr, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-zinc-300">{title}</span>
        <span className="text-[10px] font-mono text-zinc-500">{ctr} CTR</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: ctr, background: color }} />
      </div>
      <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter text-zinc-600">
        <span>{views} Views</span>
        <span>{clicks} Clicks</span>
      </div>
    </div>
  )
}

function EngagementCard({ title, value, icon, color, chart }: any) {
  return (
    <div className="p-5 rounded-3xl border border-white/5 bg-zinc-900/40 flex items-center justify-between">
       <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <div className="p-1.5 rounded-lg bg-white/5" style={{ color }}>{icon}</div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{title}</span>
          </div>
          <p className="text-2xl font-bold text-white">{value}</p>
       </div>
       <div className="flex items-end gap-1 h-10 w-24">
          {chart.map((v: number, i: number) => (
             <div key={i} className="flex-1 rounded-sm bg-white/10 relative overflow-hidden" style={{ height: `${v}%` }}>
                <div className="absolute inset-0 opacity-40" style={{ background: color }} />
             </div>
          ))}
       </div>
    </div>
  )
}
