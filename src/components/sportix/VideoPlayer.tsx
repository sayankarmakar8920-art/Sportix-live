'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, Settings, Maximize, Volume2, VolumeX, Users, Radio } from 'lucide-react'
import LiveChat from './LiveChat'

const QUALITY_OPTIONS = ['Auto', '1080p', '720p', '480p', '360p']

export default function VideoPlayer() {
  const { selectedStream, setCurrentView, setSelectedStream } = useAppStore()
  const [isMuted, setIsMuted] = useState(false)
  const [quality, setQuality] = useState('Auto')
  const [showQuality, setShowQuality] = useState(false)
  const [viewerCount, setViewerCount] = useState(selectedStream?.viewerCount || 0)

  useEffect(() => {
    if (!selectedStream) return
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const delta = Math.floor(Math.random() * 100) - 50
        return Math.max(100, prev + delta)
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedStream])

  if (!selectedStream) return null

  const formatViewers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <div className="sportix-bg min-h-screen">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-white/5 bg-[#02040a]/80 px-4 backdrop-blur-xl">
        <button
          onClick={() => {
            setCurrentView('home')
            setSelectedStream(null)
          }}
          className="flex items-center gap-2 rounded-lg p-2 text-white/50 transition-all hover:bg-white/5 hover:text-white touch-active"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden text-sm sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b3b] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff3b3b]" />
          </span>
          <h1 className="truncate text-sm font-semibold text-white">{selectedStream.title}</h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Users className="h-3.5 w-3.5" />
          {formatViewers(viewerCount)}
        </div>
      </header>

      {/* Player + Chat layout */}
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row">
          {/* Player Area */}
          <div className="flex-1 p-4 md:p-6">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 bg-black">
              {/* Video Player Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0b0f1a] via-[#111827] to-[#1a2235]">
                {/* Simulated video content */}
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 flex items-center justify-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00ff88]/10 ring-2 ring-[#00ff88]/20 animate-pulse">
                        <Radio className="h-8 w-8 text-[#00ff88]" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-white">{selectedStream.homeTeam} vs {selectedStream.awayTeam}</p>
                    <p className="mt-2 text-sm text-[#00ff88] font-medium">
                      {selectedStream.homeScore} — {selectedStream.awayScore}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {selectedStream.matchTime || 'LIVE'} • {formatViewers(viewerCount)} watching
                    </p>
                  </div>
                </div>

                {/* Scan line effect */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
                }} />
              </div>

              {/* Player Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="rounded-lg p-2 text-white/70 transition-colors hover:text-white hover:bg-white/10"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Quality selector */}
                    <div className="relative">
                      <button
                        onClick={() => setShowQuality(!showQuality)}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/15"
                      >
                        {quality}
                      </button>
                      {showQuality && (
                        <div className="absolute bottom-full right-0 mb-2 rounded-xl border border-white/10 bg-[#0b0f1a] p-1 shadow-2xl backdrop-blur-xl">
                          {QUALITY_OPTIONS.map((q) => (
                            <button
                              key={q}
                              onClick={() => { setQuality(q); setShowQuality(false) }}
                              className={`flex w-full items-center rounded-lg px-3 py-1.5 text-xs transition-colors ${
                                quality === q ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="rounded-lg p-2 text-white/70 transition-colors hover:text-white hover:bg-white/10">
                      <Settings className="h-5 w-5" />
                    </button>
                    <button className="rounded-lg p-2 text-white/70 transition-colors hover:text-white hover:bg-white/10">
                      <Maximize className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-lg bg-[#ff3b3b]/10 px-2.5 py-1 text-xs font-bold text-[#ff3b3b] ring-1 ring-[#ff3b3b]/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b3b] live-pulse" />
                  LIVE
                </span>
                <span className="text-sm text-white/40">{formatViewers(viewerCount)} watching</span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedStream.title}</h2>
              {selectedStream.description && (
                <p className="text-sm text-white/50 leading-relaxed">{selectedStream.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-white/40">
                <span className="rounded-full bg-white/5 px-3 py-1 capitalize">{selectedStream.category}</span>
                <span>{selectedStream.homeTeam} {selectedStream.homeScore} — {selectedStream.awayScore} {selectedStream.awayTeam}</span>
                <span>{selectedStream.matchTime}</span>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-full border-l border-white/5 lg:w-[380px]">
            <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
              <div className="h-full p-4 md:p-6">
                <div className="h-full">
                  <LiveChat streamId={selectedStream.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
