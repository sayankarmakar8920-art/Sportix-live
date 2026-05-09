// ─── Smart Mid-Roll Ad Scheduling Engine ─────────────────────────────
// Automatically calculates optimal ad break timestamps based on video duration.
// Minimum gap: 10-15 minutes between ads.

export interface MidRollSlot {
  timestamp: number  // seconds into the video
  index: number      // ad break number (1-based)
  label: string      // human-readable label like "15:00"
}

/**
 * Format seconds to mm:ss or h:mm:ss
 */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Get smart mid-roll timestamps based on video duration.
 * Uses the rules from the spec:
 *   - 36-50 min → 2-3 ads
 *   - 1 hour    → 3 ads
 *   - 2 hours   → 4 ads
 *   - 3 hours   → 6 ads
 *   - min gap: 10-15 minutes
 */
export function calculateMidRollSlots(videoDurationSec: number): MidRollSlot[] {
  if (videoDurationSec < 600) return [] // < 10 min: no mid-rolls

  const totalMin = videoDurationSec / 60
  let adCount: number
  let gapMin: number

  if (totalMin <= 50) {
    // 36-50 min → 2-3 ads
    adCount = totalMin >= 42 ? 3 : 2
    gapMin = 12
  } else if (totalMin <= 75) {
    // 50-75 min → 3 ads
    adCount = 3
    gapMin = 15
  } else if (totalMin <= 150) {
    // 75-150 min (2.5h) → 4-5 ads
    adCount = totalMin >= 120 ? 5 : 4
    gapMin = 15
  } else {
    // 150+ min (2.5h+) → scale up, max 8
    adCount = Math.min(8, Math.floor(totalMin / 25))
    gapMin = 15
  }

  // Calculate even distribution
  const intervalSec = videoDurationSec / (adCount + 1)
  const minGapSec = gapMin * 60

  const slots: MidRollSlot[] = []
  let lastTimestamp = 0

  for (let i = 1; i <= adCount; i++) {
    let ts = Math.round(intervalSec * i)

    // Ensure minimum gap
    if (ts - lastTimestamp < minGapSec) {
      ts = lastTimestamp + minGapSec
    }

    // Don't place ad in last 3 minutes (reserved for content ending)
    if (ts > videoDurationSec - 180) {
      ts = videoDurationSec - 180
    }

    // Don't place in first 5 minutes
    if (ts < 300) {
      ts = 300
    }

    // Avoid duplicate timestamps
    if (ts <= lastTimestamp) continue

    lastTimestamp = ts
    slots.push({
      timestamp: ts,
      index: slots.length + 1,
      label: formatTime(ts),
    })
  }

  return slots
}

/**
 * Get the next upcoming ad break from a list of mid-roll slots
 */
export function getNextAdBreak(
  slots: MidRollSlot[],
  currentTimeSec: number,
  shownBreaks: Set<number>,
): MidRollSlot | null {
  for (const slot of slots) {
    if (!shownBreaks.has(slot.timestamp) && currentTimeSec >= slot.timestamp - 1) {
      return slot
    }
  }
  return null
}

/**
 * Check if an ad break should trigger right now
 */
export function shouldShowAdBreak(
  slots: MidRollSlot[],
  currentTimeSec: number,
  shownBreaks: Set<number>,
): boolean {
  return getNextAdBreak(slots, currentTimeSec, shownBreaks) !== null
}

/**
 * Preload ad data (called before video starts)
 * Returns pre-roll + mid-roll ads from API
 */
export interface VideoAdsData {
  preRollAds: Array<{
    id: string
    title: string
    mediaUrl: string
    targetUrl?: string
    duration: number
    skipAfter: number
  }>
  midRollAds: Array<{
    id: string
    title: string
    mediaUrl: string
    targetUrl?: string
    duration: number
    skipAfter: number
  }>
  postRollAds: Array<{
    id: string
    title: string
    mediaUrl: string
    targetUrl?: string
    duration: number
    skipAfter: number
  }>
  midRollSlots: MidRollSlot[]
}

export async function fetchVideoAds(
  videoDurationSec: number,
  category?: string,
): Promise<VideoAdsData> {
  const device = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'desktop'
    : typeof window !== 'undefined' && window.innerWidth >= 768 ? 'tablet'
    : 'mobile'

  try {
    const params = new URLSearchParams({ device })
    if (category) params.set('category', category)

    const res = await fetch(`/api/ads/video-ads?${params}`)
    if (!res.ok) throw new Error('Failed to fetch video ads')

    const data = await res.json()

    const preRollAds = (data.preRoll || []).map((a: any) => ({
      id: a.id, title: a.title, mediaUrl: a.mediaUrl,
      targetUrl: a.targetUrl, duration: a.duration || 8, skipAfter: a.skipAfter || 5,
    }))

    const midRollAds = (data.midRoll || []).map((a: any) => ({
      id: a.id, title: a.title, mediaUrl: a.mediaUrl,
      targetUrl: a.targetUrl, duration: a.duration || 8, skipAfter: a.skipAfter || 5,
    }))

    const postRollAds = (data.postRoll || []).map((a: any) => ({
      id: a.id, title: a.title, mediaUrl: a.mediaUrl,
      targetUrl: a.targetUrl, duration: a.duration || 8, skipAfter: a.skipAfter || 5,
    }))

    // Calculate smart mid-roll slots
    const midRollSlots = calculateMidRollSlots(videoDurationSec)

    return { preRollAds, midRollAds, postRollAds, midRollSlots }
  } catch {
    return { preRollAds: [], midRollAds: [], postRollAds: [], midRollSlots: [] }
  }
}
