'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  type VideoAdsData,
  fetchVideoAds,
  shouldShowAdBreak,
} from '@/lib/adScheduler'

export type AdPhase = 'idle' | 'pre-roll' | 'playing' | 'mid-roll' | 'post-roll' | 'done'

export interface UseVideoAdsOptions {
  videoDurationSec: number
  category?: string
  playbackPosition: number
  onPauseForAd: () => void
  onResumeFromAd: () => void
  videoEnded: boolean
}

export function useVideoAds({
  videoDurationSec,
  category,
  playbackPosition,
  onPauseForAd,
  onResumeFromAd,
  videoEnded,
}: UseVideoAdsOptions) {
  const [adsData, setAdsData] = useState<VideoAdsData>({
    preRollAds: [], midRollAds: [], postRollAds: [], midRollSlots: [],
  })
  const [phase, setPhase] = useState<AdPhase>('idle')
  const [currentAd, setCurrentAd] = useState<{
    id: string; title: string; mediaUrl: string; targetUrl?: string; duration: number; skipAfter: number;
  } | null>(null)
  const [shownBreaks, setShownBreaks] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const midRollIndexRef = useRef(0)
  const lastCheckedPosRef = useRef(0)
  const lastCheckedEndedRef = useRef(false)

  // Fetch ads + trigger pre-roll on mount
  useEffect(() => {
    let cancelled = false
    fetchVideoAds(videoDurationSec, category).then(data => {
      if (cancelled) return
      setAdsData(data)
      setLoading(false)
      if (data.preRollAds.length > 0) {
        setPhase('pre-roll')
        setCurrentAd(data.preRollAds[0])
        onPauseForAd()
      } else {
        setPhase('playing')
      }
    }).catch(() => {
      if (!cancelled) {
        setLoading(false)
        setPhase('playing')
      }
    })
    return () => { cancelled = true }
  }, [videoDurationSec, category, onPauseForAd])

  // Called from playback tick — check mid-roll triggers
  const tick = useCallback(() => {
    // Skip if not playing or no mid-roll ads
    if (phase !== 'playing' || adsData.midRollAds.length === 0) return
    if (adsData.midRollSlots.length === 0) return
    if (playbackPosition <= lastCheckedPosRef.current) return

    lastCheckedPosRef.current = playbackPosition

    if (shouldShowAdBreak(adsData.midRollSlots, playbackPosition, shownBreaks)) {
      const adIndex = midRollIndexRef.current % adsData.midRollAds.length
      const ad = adsData.midRollAds[adIndex]
      const slot = adsData.midRollSlots.find(
        s => !shownBreaks.has(s.timestamp) && playbackPosition >= s.timestamp - 1
      )

      if (slot && ad) {
        setPhase('mid-roll')
        setCurrentAd(ad)
        setShownBreaks(prev => new Set(prev).add(slot.timestamp))
        midRollIndexRef.current++
        onPauseForAd()
      }
    }
  }, [phase, adsData, playbackPosition, shownBreaks, onPauseForAd])

  // Called from playback tick — check post-roll on video end
  const checkEnd = useCallback(() => {
    if (lastCheckedEndedRef.current === videoEnded) return
    lastCheckedEndedRef.current = videoEnded

    if (!videoEnded || phase !== 'playing') return
    if (adsData.postRollAds.length > 0) {
      setPhase('post-roll')
      setCurrentAd(adsData.postRollAds[0])
    } else {
      setPhase('done')
    }
  }, [videoEnded, phase, adsData.postRollAds])

  const handlePreRollComplete = useCallback(() => {
    setPhase('playing')
    setCurrentAd(null)
    onResumeFromAd()
  }, [onResumeFromAd])

  const handleMidRollComplete = useCallback(() => {
    setPhase('playing')
    setCurrentAd(null)
    onResumeFromAd()
  }, [onResumeFromAd])

  const handlePostRollComplete = useCallback(() => {
    setPhase('done')
    setCurrentAd(null)
  }, [])

  const skipAd = useCallback(() => {
    if (phase === 'pre-roll') handlePreRollComplete()
    else if (phase === 'mid-roll') handleMidRollComplete()
    else if (phase === 'post-roll') handlePostRollComplete()
  }, [phase, handlePreRollComplete, handleMidRollComplete, handlePostRollComplete])

  const isAdPlaying = phase === 'pre-roll' || phase === 'mid-roll' || phase === 'post-roll'

  return {
    phase,
    currentAd,
    isAdPlaying,
    loading,
    midRollSlots: adsData.midRollSlots,
    shownBreaks,
    skipAd,
    tick,
    checkEnd,
    handlePreRollComplete,
    handleMidRollComplete,
    handlePostRollComplete,
  }
}
