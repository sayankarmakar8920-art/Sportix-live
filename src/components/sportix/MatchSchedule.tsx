'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Clock, Trophy, Filter, Search, Plus, MapPin, Radio, ChevronRight, MoreHorizontal } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const C = {
  bg: '#141414',
  card: '#1a1a1a',
  border: 'rgba(255,255,255,0.08)',
  accent: '#E50914',
  textTer: '#808080',
  textSec: '#b3b3b3',
}

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  startTime: string
  category: string
  league: string
  status: 'live' | 'upcoming' | 'finished'
  venue?: string
}

export default function MatchSchedule() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all')

  const fetchMatches = useCallback(() => {
    const performFetch = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('Stream')
          .select('*')
          .order('startTime', { ascending: true })

        if (error) throw error
        setMatches(data || [])
      } catch (err) {
        console.error('Error fetching matches:', err)
      } finally {
        setLoading(false)
      }
    }
    performFetch()
  }, [])

  useEffect(() => {
    fetchMatches()
    const interval = setInterval(fetchMatches, 5000)

    const handleManualRefresh = () => fetchMatches()
    window.addEventListener('sportix-refresh-data', handleManualRefresh)

    const channel = supabase
      .channel('match_updates')
      .on('postgres_changes' as any, { event: '*', table: 'Stream' }, () => fetchMatches())
      .subscribe()
    return () => { 
      clearInterval(interval)
      window.removeEventListener('sportix-refresh-data', handleManualRefresh)
      supabase.removeChannel(channel) 
    }
  }, [fetchMatches])

  const filteredMatches = matches.filter(m => {
    if (filter === 'all') return true
    return m.status === filter
  })

  return (
    <div className="space-y-4 fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E50914]/10">
            <Calendar className="h-5 w-5 text-[#E50914]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Match Schedule</h2>
            <p className="text-xs text-[#808080]">Manage upcoming and live streaming events</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/5">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
          <button className="flex items-center gap-1.5 rounded-xl bg-[#E50914] px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> Create Event
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit">
        {(['all', 'live', 'upcoming'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === f ? 'bg-[#E50914] text-white shadow-lg' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/5">
          <Calendar className="h-12 w-12 text-white/10 mb-3" />
          <p className="text-sm text-white/30 font-medium">No matches found for the selected filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMatches.map((match) => (
            <div key={match.id} className="group relative rounded-2xl border border-white/5 bg-[#1a1a1a] p-4 transition-all hover:border-[#E50914]/30 hover:shadow-2xl hover:shadow-[#E50914]/5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Trophy className="h-4 w-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{match.league || 'International'}</p>
                    <p className="text-xs font-semibold text-white/60 capitalize">{match.category}</p>
                  </div>
                </div>
                {match.status === 'live' ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-[#E50914]/15 px-2.5 py-1 text-[10px] font-bold text-[#E50914]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E50914] animate-pulse" /> LIVE
                  </span>
                ) : (
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/30">UPCOMING</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex-1 text-center">
                  <p className="text-sm font-bold text-white line-clamp-1">{match.homeTeam}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-black text-[#E50914]">VS</span>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm font-bold text-white line-clamp-1">{match.awayTeam}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-white/20" />
                    <span className="text-[11px] font-medium text-white/40">
                      {match.startTime ? new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-white/20" />
                    <span className="text-[11px] font-medium text-white/40 truncate max-w-[80px]">{match.venue || 'Stadium'}</span>
                  </div>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 transition-all hover:bg-[#E50914] hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
