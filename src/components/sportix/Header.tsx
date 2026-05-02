'use client'

import { useAppStore } from '@/lib/store'
import { useSession, signOut } from 'next-auth/react'
import { Search, X, Calendar, ChevronDown, LogOut } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

export default function Header() {
  const { currentView, incrementLogoClicks, resetLogoClicks } = useAppStore()
  const { data: session } = useSession()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleLogoClick = useCallback(() => {
    // Block admin easter egg on mobile
    if (isMobile) return
    incrementLogoClicks()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { resetLogoClicks() }, 3000)
  }, [incrementLogoClicks, resetLogoClicks, isMobile])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return
    const handleClick = () => setShowUserMenu(false)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showUserMenu])

  if (currentView === 'admin' || currentView === 'live-control-room') return null

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || 'U'

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

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu) }}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all hover:bg-white/5"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#00ff88]/40 to-[#00ff88]/10 ring-1 ring-white/10 cursor-pointer">
                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/70">{userInitial}</div>
              </div>
              <ChevronDown className="hidden h-3 w-3 text-white/30 lg:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50 fade-in-up"
                style={{
                  background: 'rgba(15, 20, 30, 0.95)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="p-3 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-white truncate">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-white/40 truncate">{session?.user?.email || ''}</p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { setShowUserMenu(false); useAppStore.getState().setCurrentView('settings') }}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Calendar className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#ff5252]/80 hover:bg-[#ff5252]/5 hover:text-[#ff5252] transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
