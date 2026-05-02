'use client'

import { useAppStore } from '@/lib/store'
import type { PageView } from '@/lib/store'
import {
  Home, Radio, Trophy, Calendar, Award, Flame,
  Heart, ListVideo, Settings, Crown, ChevronRight
} from 'lucide-react'

const NAV_ITEMS: { id: PageView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'live', label: 'Live Match', icon: Radio },
  { id: 'popular', label: 'Popular', icon: Flame },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'leagues', label: 'Leagues', icon: Award },
  { id: 'highlights', label: 'Highlights', icon: Flame },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'mylist', label: 'My List', icon: ListVideo },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { currentView, setCurrentView } = useAppStore()

  // Only show sidebar on non-player, non-admin pages
  if (currentView === 'player' || currentView === 'admin' || currentView === 'live-control-room') return null

  return (
    <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 border-r border-white/[0.06] bg-[#080c16]/50">
      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#00ff88]/[0.08] text-[#00ff88] shadow-sm shadow-[#00ff88]/5'
                  : 'text-white/45 hover:bg-white/[0.03] hover:text-white/70'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,255,136,0.3)]' : ''}`} />
              <span>{item.label}</span>
              {item.id === 'live' && (
                <span className="ml-auto flex items-center gap-1 rounded-md bg-[#ff3b3b]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#ff3b3b]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b3b] animate-pulse" />
                  LIVE
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Go Premium CTA */}
      <div className="p-3">
        <div className="rounded-xl border border-[#00ff88]/10 bg-gradient-to-br from-[#00ff88]/[0.06] to-transparent p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-[#00ff88]" />
            <span className="text-sm font-semibold text-white">Go Premium</span>
          </div>
          <p className="text-[11px] leading-relaxed text-white/35 mb-3">
            Watch ad-free with 4K quality, exclusive content & more.
          </p>
          <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#00ff88] px-3 py-2 text-xs font-bold text-[#02040a] transition-all hover:bg-[#00dd75] active:scale-[0.97]">
            Upgrade Now
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
