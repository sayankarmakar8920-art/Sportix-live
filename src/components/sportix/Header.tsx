'use client'

import { useAppStore } from '@/lib/store'
import { Search, X, Calendar } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'

export default function Header() {
  const { currentView, setCurrentView } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleLogoClick = useCallback(() => {
    clickCountRef.current += 1

    // Clear previous timer
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)

    // 7 clicks = open admin panel instantly
    if (clickCountRef.current === 7) {
      clickCountRef.current = 0
      setCurrentView('admin')
      return
    }

    // Wait 800ms to see if user keeps clicking — only reload if they stop before 7
    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current > 0 && clickCountRef.current < 7) {
        clickCountRef.current = 0
        window.location.reload()
      }
    }, 800)
  }, [setCurrentView])

  if (currentView === 'admin' || currentView === 'live-control-room') return null

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0e1a]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
        {/* Left: Date + Logo */}
        <div className="flex items-center gap-4">
          <span className="hidden text-xs font-medium text-white/40 lg:flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {today}
          </span>
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 transition-all duration-200 hover:opacity-80 active:scale-[0.97] touch-active"
          >
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#00ff88] to-[#00cc6a] shadow-lg shadow-[#00ff88]/20">
              <span className="text-[#02040a] text-sm font-black">S</span>
            </div>
            <span className="hidden text-base font-bold tracking-tight text-white sm:block">
              Sport<span className="text-[#00ff88]">ix</span>{' '}
              <span className="text-white/40 font-normal text-xs">Live</span>
            </span>
          </button>
        </div>

        {/* Center: Search — always visible on md+ */}
        <div className="flex-1 max-w-lg">
          {searchOpen ? (
            <div className="flex items-center gap-2 fade-in-up">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for matches, teams, leagues..."
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/25 focus:border-[#00ff88]/30 focus:outline-none focus:ring-1 focus:ring-[#00ff88]/20"
                  autoFocus
                  onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
                />
              </div>
              <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="rounded-lg p-1.5 text-white/30 hover:text-white hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden w-full items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 text-sm text-white/25 transition-all hover:bg-white/[0.05] hover:border-white/[0.08] md:flex"
            >
              <Search className="h-4 w-4" />
              <span>Search for matches, teams, leagues...</span>
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setSearchOpen(!searchOpen)} className="rounded-lg p-2 text-white/40 transition-all hover:bg-white/5 hover:text-white/70 md:hidden">
            <Search className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  )
}
