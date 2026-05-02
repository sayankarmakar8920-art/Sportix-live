'use client'

import { Home, Tv, Trophy, Flame, MoreHorizontal } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { PageView } from '@/lib/store'
import { useState } from 'react'

const NAV_ITEMS: { id: PageView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'live', label: 'Live', icon: Tv },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'highlights', label: 'Highlights', icon: Flame },
  { id: 'more', label: 'More', icon: MoreHorizontal },
]

const MORE_ITEMS: { id: PageView; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'leagues', label: 'Leagues' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'mylist', label: 'My List' },
  { id: 'settings', label: 'Settings' },
]

export default function BottomNav() {
  const { currentView, setCurrentView } = useAppStore()
  const [showMore, setShowMore] = useState(false)

  // Hide on player/admin/control-room pages
  if (currentView === 'player' || currentView === 'admin' || currentView === 'live-control-room') return null

  // More menu
  if (showMore) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0a0e1a]/98 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <span className="text-sm font-semibold text-white">More Options</span>
          <button onClick={() => setShowMore(false)} className="text-xs text-[#00ff88] font-medium">Close</button>
        </div>
        <div className="grid grid-cols-3 gap-1 p-3">
          {MORE_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id); setShowMore(false) }}
              className={`flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all touch-active ${
                currentView === item.id ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/50 hover:bg-white/[0.03]'
              }`}
            >
              <span className="text-[13px]">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0a0e1a]/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around py-1.5 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id || (item.id === 'more' && !['home', 'live', 'sports', 'highlights'].includes(currentView))
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  setShowMore(true)
                } else {
                  setCurrentView(item.id)
                }
              }}
              className={`relative flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 transition-all duration-150 touch-active ${
                isActive
                  ? 'text-[#00ff88]'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,255,136,0.4)]' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.id === 'live' && (
                <span className="absolute top-0.5 right-3 h-2 w-2 rounded-full bg-[#ff3b3b] animate-pulse" />
              )}
              {isActive && (
                <span className="absolute -bottom-1.5 h-[3px] w-5 rounded-full bg-[#00ff88]" />
              )}
            </button>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
